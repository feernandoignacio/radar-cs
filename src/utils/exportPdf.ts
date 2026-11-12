import { STATUS_INFO } from '../status.ts';
import type { Client } from '../types.ts';
import { getSummary, percent } from './summary.ts';

// As fontes padrão do PDF não têm alguns símbolos (ex: o "maior ou igual" dos motivos).
// Troca os conhecidos e remove o que sobrar fora do alfabeto latino.
function pdfText(value: string) {
  return value
    .replace(/\u2265/g, '>=')
    .replace(/\u2264/g, '<=')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^\u0020-\u00ff]/g, '');
}

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

type ExportInput = {
  clients: Client[];
  month: string;
  batchName: string;
};

// Gera o PDF no navegador. As bibliotecas só carregam quando ela clica,
// então não pesam na abertura do site.
export async function exportPdf({ clients, month, batchName }: ExportInput) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const summary = getSummary(clients);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(14, 107, 87);
  doc.text('Radar CS', 40, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(58, 64, 73);
  doc.text(pdfText(`${month} · ${batchName}`), 40, 66);

  // Resumo da meta
  const { counts, total, goal, forecast } = summary;
  const lines = [
    `Realizadas: ${counts.done} de ${total} (${percent(counts.done, total)}%)   Meta: ${goal} reuniões`,
    `Agendadas: ${counts.scheduled}   Previsão de fechamento: ${forecast} (${percent(forecast, total)}%)   Em análise (fora da meta): ${counts.in_review}`,
  ];
  doc.setFontSize(10);
  lines.forEach((line, index) => doc.text(pdfText(line), 40, 90 + index * 15));

  // Mesma ordem da tela: realizadas no fim
  const ordered = [
    ...clients.filter((client) => client.status !== 'done'),
    ...clients.filter((client) => client.status === 'done'),
  ];

  autoTable(doc, {
    startY: 120,
    head: [
      [
        'Empresa',
        'Motivo do lote',
        'Status',
        'Contato',
        'WhatsApp / telefone',
        'Emails',
        'Última ação',
      ].map(pdfText),
    ],
    body: ordered.map((client) =>
      [
        client.company || '(sem nome)',
        client.reason || '-',
        STATUS_INFO[client.status].label,
        client.contactName || '-',
        client.whatsapp || client.companyPhone || 'Não encontrado',
        client.emails.length === 0
          ? '-'
          : client.emails.length === 1
            ? client.emails[0]
            : `${client.emails[0]} (+${client.emails.length - 1})`,
        client.lastAction,
      ].map(pdfText),
    ),
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 5,
      overflow: 'linebreak',
    },
    headStyles: { fillColor: [14, 107, 87], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    columnStyles: {
      0: { cellWidth: 120, fontStyle: 'bold' },
      1: { cellWidth: 150 },
      2: { cellWidth: 85 },
    },
    // Coluna de status com as mesmas cores da tela
    didParseCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 2) return;
      const client = ordered[data.row.index];
      const info = STATUS_INFO[client.status];
      data.cell.styles.fillColor = hexToRgb(info.pillBg);
      data.cell.styles.textColor = hexToRgb(info.pillText);
      data.cell.styles.fontStyle = 'bold';
    },
    // Rodapé com número da página
    didDrawPage: () => {
      const page = doc.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.setTextColor(138, 146, 156);
      doc.text(
        `Página ${page}`,
        pageWidth - 40,
        doc.internal.pageSize.getHeight() - 20,
        { align: 'right' },
      );
    },
  });

  // Ex: radar-cs-novembro-2026.pdf
  const slug = month
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+de\s+/g, '-')
    .replace(/\s+/g, '-');
  doc.save(`radar-cs-${slug}.pdf`);
}
