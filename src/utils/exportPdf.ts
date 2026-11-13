// Gera um PDF que é a "foto" da página, organizada para o papel.
// As bibliotecas só carregam quando ela clica, então não pesam na abertura.
export async function exportPdf(element: HTMLElement, fileName: string) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const scale = 2;
  // Pontos onde a página pode ser cortada sem partir nada no meio
  let breakPoints: number[] = [];

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: '#f5f6f8',
    // Largura fixa, igual em qualquer tela, pensada para a folha A4 em pé:
    // o texto sai com tamanho bom para ler impresso
    windowWidth: 820,
    onclone: (copy, clone) => {
      // Ativa o layout do PDF só na cópia, a tela dela não muda
      copy.body.classList.add('is-exporting-pdf');

      // Campo de texto não quebra linha. No PDF vira texto comum,
      // para o motivo aparecer inteiro (vazio vira um traço).
      clone
        .querySelectorAll<HTMLInputElement>('input.editable-cell')
        .forEach((input) => {
          const text = copy.createElement('span');
          text.className = 'pdf-cell-text';
          text.textContent = input.value || '-';
          input.replaceWith(text);
        });

      const top = clone.getBoundingClientRect().top;
      const blocks = clone.querySelectorAll(
        '.header, .app-summary, .goal-card, .status-cards, .app-clients-title, .client-table thead, .client-table tbody tr, .app-clients, .app-footer',
      );
      breakPoints = Array.from(blocks, (block) =>
        Math.round((block.getBoundingClientRect().bottom - top) * scale),
      );
      const footer = clone.querySelector('.site-footer');
      if (footer) {
        breakPoints.push(
          Math.round((footer.getBoundingClientRect().top - top) * scale),
        );
      }
      breakPoints.sort((a, b) => a - b);
    },
  });

  // Retrato: imprime direto em folha A4 em pé, ocupando a folha toda
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const margin = 24;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  // Quantos pixels da foto cabem na área útil de uma página
  const pixelsPerPage = Math.floor(
    (canvas.width * contentHeight) / contentWidth,
  );

  let start = 0;
  let pageIndex = 0;
  while (start < canvas.height) {
    const limit = start + pixelsPerPage;
    let end = canvas.height;

    if (limit < canvas.height) {
      // Corta no último bloco inteiro que cabe nesta página
      const fit = breakPoints.filter(
        (point) => point > start && point <= limit,
      );
      end = fit.length > 0 ? fit[fit.length - 1] : limit;
    }

    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = end - start;
    const context = slice.getContext('2d');
    if (context) {
      context.fillStyle = '#f5f6f8';
      context.fillRect(0, 0, slice.width, slice.height);
      context.drawImage(
        canvas,
        0,
        start,
        canvas.width,
        slice.height,
        0,
        0,
        canvas.width,
        slice.height,
      );
    }

    if (pageIndex > 0) doc.addPage();
    // Fundo da página com a mesma cor do site, para não ficar faixa branca
    doc.setFillColor(245, 246, 248);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.addImage(
      slice.toDataURL('image/jpeg', 0.92),
      'JPEG',
      margin,
      margin,
      contentWidth,
      (slice.height * contentWidth) / canvas.width,
    );

    start = end;
    pageIndex++;
  }

  doc.save(fileName);
}
