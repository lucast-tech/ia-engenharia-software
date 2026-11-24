/* =========================================================
   Ano do rodapé decidido no servidor, no horário de Brasília.

   Roda na Netlify a cada visita de página: pega o HTML que seria
   entregue, troca o número dentro de <span data-year> pelo ano atual
   em America/Sao_Paulo e marca o elemento com data-year-fonte="servidor".
   O JavaScript da página vê essa marca e não mexe no ano, então o
   relógio do aparelho do visitante não muda nada.

   Assim a virada de ano acontece à meia-noite de Brasília, mesmo que
   o site não seja publicado de novo.
   ========================================================= */

const FUSO = 'America/Sao_Paulo';

export function anoBrasilia(agora = new Date()) {
  return new Intl.DateTimeFormat('en-US', { timeZone: FUSO, year: 'numeric' }).format(agora);
}

export function trocarAno(html, ano) {
  return html.replace(
    /<span data-year(?:\s+data-year-fonte="[^"]*")?>\d{4}<\/span>/g,
    `<span data-year data-year-fonte="servidor">${ano}</span>`
  );
}

export default async (request, context) => {
  const resposta = await context.next();
  const tipo = resposta.headers.get('content-type') || '';
  if (!tipo.includes('text/html')) return resposta;

  const html = await resposta.text();
  const cabecalhos = new Headers(resposta.headers);
  cabecalhos.delete('content-length');
  // A página muda com o ano: não deixa navegador nem CDN guardarem uma cópia velha
  cabecalhos.set('cache-control', 'public, max-age=0, must-revalidate');

  return new Response(trocarAno(html, anoBrasilia()), {
    status: resposta.status,
    headers: cabecalhos,
  });
};

export const config = {
  path: '/*',
  excludedPath: ['/assets/*', '/css/*', '/js/*', '/netlify/*'],
};
