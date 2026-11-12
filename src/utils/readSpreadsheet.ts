import { unzipSync } from 'fflate';
import Papa from 'papaparse';

// Uma linha da planilha: nome da coluna -> valor em texto
export type SheetRow = Record<string, string>;

export async function readSpreadsheet(file: File): Promise<SheetRow[]> {
  if (file.name.toLowerCase().endsWith('.csv')) {
    return readCsv(file);
  }
  return readXlsx(file);
}

function readCsv(file: File): Promise<SheetRow[]> {
  return new Promise((resolve, reject) => {
    // O Papa descobre sozinho se o separador é vírgula ou ponto e vírgula
    Papa.parse<SheetRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (result) => resolve(result.data),
      error: reject,
    });
  });
}

// Um .xlsx é um arquivo zip cheio de XMLs. Lemos direto porque o
// export do Power BI usa um formato que as bibliotecas comuns não leem.
async function readXlsx(file: File): Promise<SheetRow[]> {
  const files = unzipSync(new Uint8Array(await file.arrayBuffer()));
  // TextDecoder também remove o BOM do começo dos arquivos
  const decoder = new TextDecoder();
  const readXml = (path: string) => {
    const bytes = files[path];
    if (!bytes) return null;
    return new DOMParser().parseFromString(
      decoder.decode(bytes),
      'application/xml',
    );
  };

  const sheetPath = findFirstSheetPath(readXml);
  const sheet = sheetPath ? readXml(sheetPath) : null;
  if (!sheet) {
    throw new Error('Não encontrei nenhuma aba no arquivo.');
  }

  const sharedStrings = readSharedStrings(readXml('xl/sharedStrings.xml'));
  const grid: string[][] = [];

  for (const row of byTag(sheet, 'row')) {
    const values: string[] = [];
    let nextColumn = 0;

    for (const cell of byTag(row, 'c')) {
      // Quando a célula tem endereço (ex: "C5"), usa a coluna dele.
      // O Power BI não manda endereço, então segue em ordem.
      const address = cell.getAttribute('r');
      const column = address ? columnIndex(address) : nextColumn;
      values[column] = cellText(cell, sharedStrings);
      nextColumn = column + 1;
    }

    grid.push(Array.from(values, (value) => value ?? ''));
  }

  return gridToRows(grid);
}

// Busca por nome da tag ignorando o prefixo (x:row e row são iguais)
function byTag(node: Document | Element, tag: string) {
  return Array.from(node.getElementsByTagNameNS('*', tag));
}

function findFirstSheetPath(readXml: (path: string) => Document | null) {
  const workbook = readXml('xl/workbook.xml');
  const rels = readXml('xl/_rels/workbook.xml.rels');
  const firstSheet = workbook ? byTag(workbook, 'sheet')[0] : undefined;
  if (!firstSheet || !rels) return 'xl/worksheets/sheet1.xml';

  // O id da aba fica num atributo com namespace (r:id)
  const id =
    firstSheet.getAttributeNS(
      'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'id',
    ) ?? firstSheet.getAttribute('r:id');
  const rel = byTag(rels, 'Relationship').find(
    (item) => item.getAttribute('Id') === id,
  );
  const target = rel?.getAttribute('Target');
  if (!target) return 'xl/worksheets/sheet1.xml';

  return target.startsWith('/') ? target.slice(1) : `xl/${target}`;
}

function readSharedStrings(xml: Document | null) {
  if (!xml) return [];
  // Um texto pode vir quebrado em vários pedaços <t>, então junta todos
  return byTag(xml, 'si').map((item) =>
    byTag(item, 't')
      .map((part) => part.textContent ?? '')
      .join(''),
  );
}

function cellText(cell: Element, sharedStrings: string[]) {
  const type = cell.getAttribute('t');

  if (type === 'inlineStr') {
    return byTag(cell, 't')
      .map((part) => part.textContent ?? '')
      .join('');
  }

  const value = byTag(cell, 'v')[0]?.textContent ?? '';
  if (type === 's') return sharedStrings[Number(value)] ?? '';
  if (type === 'b') return value === '1' ? 'true' : 'false';
  return value;
}

// "AB12" -> 27 (contando a partir de zero)
function columnIndex(address: string) {
  const letters = address.replace(/[0-9]/g, '').toUpperCase();
  let index = 0;
  for (const letter of letters) {
    index = index * 26 + (letter.charCodeAt(0) - 64);
  }
  return index - 1;
}

// Primeira linha vira o nome das colunas
function gridToRows(grid: string[][]): SheetRow[] {
  const [header = [], ...lines] = grid;
  const names = header.map((name) => name.trim());

  return lines
    .filter((line) => line.some((value) => value.trim() !== ''))
    .map((line) =>
      Object.fromEntries(names.map((name, i) => [name, line[i] ?? ''])),
    );
}
