/* ==========================================================
   CONEXÕES ESG · motor de triagem local
   InovaHACK SENAI Porto 2026 — desafio AEVO

   Este é o PLANO B da demonstração ao vivo, exigido pelo edital.
   Roda inteiro no navegador: sem internet, sem chave, sem custo.
   Se a IA falhar por qualquer motivo, o app cai aqui sozinho e a
   apresentação continua.

   O dicionário é organizado por TEMA dentro de cada dimensão, e
   não só por letra. É o tema que permite devolver indicador
   específico: ideia de iluminação recebe indicador em kWh, ideia
   de reuso recebe indicador em m³.
   ========================================================== */

const TEMAS = {
  E: { nome:'Ambiental', temas:{
    agua:{ rotulo:'uso de água',
      termos:['agua','efluente','esgoto','reuso','reusar','reaproveit','hidr','vazamento','torneira','lavagem','limpeza','resfriamento','mangueira','poco','chuva','litro'],
      beneficios:['Menos água tratada comprada da concessionária','Menor volume de efluente para tratar','Conta de água mais baixa todo mês'],
      indicadores:['m³ de água economizados por mês','% de água reaproveitada no processo','R$ de redução na conta de água'],
      areas:['Meio Ambiente','Manutenção','Utilidades'],
      riscos:['A água reaproveitada precisa de laudo de qualidade para o novo uso','Reuso pode exigir aprovação do órgão ambiental estadual'] },
    energia:{ rotulo:'consumo de energia',
      termos:['energia','eletric','kwh','luz','iluminac','lampada','led','luminaria','motor','compressor','ar comprimido','caldeira','forno','vapor','gas natural','glp','botijao','solar','fotovoltaic','inversor','demanda','gerador','geracao','painel solar','turbina','ocios','madrugada','desligar','fora de expediente','standby','em vazio'],
      beneficios:['Menos energia consumida no mesmo processo','Conta de luz mais baixa','Menos emissão ligada à matriz elétrica'],
      indicadores:['kWh reduzidos por mês','R$ de redução na conta de energia','kWh por peça produzida'],
      areas:['Manutenção','Utilidades','Meio Ambiente'],
      riscos:['Precisa medir o consumo atual antes, senão não dá para provar o ganho','Troca de equipamento exige parada programada'] },
    residuo:{ rotulo:'geração de resíduo',
      termos:['residuo','lixo','sucata','descart','aterro','reciclag','reciclar','embalagem','papel','plastico','papelao','borra','rebarba','refugo','sobra','retalho','copo'],
      beneficios:['Menos resíduo enviado para aterro','Receita ou crédito com material vendido para reciclagem','Menos custo de coleta e destinação'],
      indicadores:['kg de resíduo desviados do aterro por mês','% de resíduo segregado corretamente','R$ de redução no custo de destinação'],
      areas:['Meio Ambiente','Produção','Suprimentos'],
      riscos:['Destinação exige empresa licenciada e MTR emitido','Segregação só funciona com treinamento de quem opera'] },
    emissao:{ rotulo:'emissões',
      termos:['emissao','co2','carbono','poluic','fumaca','fuligem','combustivel','diesel','gasolina','frota','caminhao','empilhadeira','gases','chamine'],
      beneficios:['Menos emissão de gases de efeito estufa','Menos combustível queimado','Ar melhor para quem trabalha por perto'],
      indicadores:['tCO₂e evitadas por ano','Litros de combustível economizados por mês','km rodados por litro na frota'],
      areas:['Meio Ambiente','Logística','Manutenção'],
      riscos:['Cálculo de emissão precisa de metodologia aceita (GHG Protocol)','Trocar fonte de energia pode exigir investimento alto'] }
  }},
  S: { nome:'Social', temas:{
    seguranca:{ rotulo:'segurança do trabalho',
      /* Vocabulário elétrico ('choque'...'curto circuito') acrescentado
         em 12/08/2026: antes, "sala elétrica" só tinha caminho pro tema
         energia (via o radical "eletric", que "elétrica" também bate) —
         nenhum termo aqui reconhecia risco elétrico como o que ele é,
         Social/segurança, não Ambiental. Ficam como termos normais, não
         em FORTES: "sala elétrica" sozinha, sem dizer o que preocupa
         nela, continua sem sustentar nenhuma dimensão (correto — ver
         perguntaLocal); só sustenta quando a pessoa der um segundo
         sinal real, tipo "sala elétrica sem sinalização" ou "risco de
         choque". */
      termos:['seguranca','acidente','epi','queda','corte','prensa','incendio','protecao','guarda','bloqueio','quase-acidente','emergencia','sinalizac','choque','eletrocu','alta tensao','risco eletrico','fiacao exposta','fio exposto','aterramento','quadro eletrico','painel eletrico','sala eletrica','curto circuito'],
      beneficios:['Menos exposição a risco de acidente','Menos afastamento por lesão','Cumprimento mais fácil das normas regulamentadoras'],
      indicadores:['Nº de quase-acidentes registrados por mês','Taxa de frequência de acidentes','Dias sem acidente com afastamento'],
      areas:['SESMT','Segurança do Trabalho','Produção'],
      riscos:['Mudança de proteção em máquina exige atender a NR-12','Controle novo não pode criar atalho perigoso na operação'] },
    ergonomia:{ rotulo:'ergonomia',
      termos:['ergonom','postura','levanta','levantar','peso','carga','esforco','ler','dort','dores','repetitiv','fadiga','cansaco','agacha','alcance','bancada','altura','costas','coluna','ombro','punho','joelho','elevatoria','talha','transpalete','carrinho'],
      beneficios:['Rotina menos desgastante para quem opera','Menos queixa de dor e menos atestado','Trabalho possível para mais gente do time'],
      indicadores:['Nº de afastamentos por lesão osteomuscular por trimestre','Nº de queixas de dor registradas por mês','Peso máximo movimentado manualmente por posto'],
      areas:['SESMT','Ergonomia','Produção'],
      riscos:['Mudança de posto exige análise ergonômica preliminar (NR-17)','Equipamento de apoio precisa caber no espaço existente'] },
    capacitacao:{ rotulo:'capacitação',
      termos:['treinamento','capacit','qualificac','aprendiz','instruc','ensina','curso','integrac','multiplicador','onboarding','tutorial'],
      beneficios:['Time mais preparado para a função','Menos erro por falta de instrução','Menos dependência de uma pessoa só'],
      indicadores:['Horas de treinamento por colaborador por ano','% do time treinado no procedimento','Nº de erros por falta de instrução por mês'],
      areas:['RH','Treinamento','Produção'],
      riscos:['Treinamento sem prática no posto não fixa','Precisa de tempo liberado na escala, não só de material'] },
    inclusao:{ rotulo:'inclusão e acessibilidade',
      termos:['inclusao','inclusiv','acessibilidade','acessivel','rampa','locomoc','mobilidade','cadeirante','vestiario','diversidade','deficien','pcd','libras','daltonic','surdo','cego','baixa visao','idade','idoso','mulher','genero','equidade','neurodiver','autis','tdah'],
      beneficios:['Postos abertos para mais perfis de pessoas','Cumprimento da cota legal com trabalho adequado','Comunicação que todo mundo entende'],
      indicadores:['Nº de postos adaptados','% de vagas acessíveis a PcD','Nº de materiais em formato acessível'],
      areas:['RH','Diversidade e Inclusão','SESMT'],
      riscos:['Adaptação precisa ser feita com a pessoa, não para ela','Acessibilidade pela metade cria exclusão nova'] },
    saude:{ rotulo:'saúde e conforto',
      termos:['saude','ruido','barulho','calor','frio','insalubr','afastamento','absente','atestado','ventilac','poeira','descanso','pausa','refeitorio','aliment','nutric','potavel'],
      beneficios:['Ambiente menos agressivo ao longo do turno','Menos afastamento por doença ocupacional','Possível redução de adicional de insalubridade'],
      indicadores:['dB medidos no posto','Índice de absenteísmo mensal','Nº de atestados por causa ocupacional'],
      areas:['SESMT','Medicina do Trabalho','Manutenção'],
      riscos:['Medição precisa de equipamento calibrado e laudo','Reduzir insalubridade mexe em adicional, precisa passar pelo RH'] }
  }},
  G: { nome:'Governança', temas:{
    padronizacao:{ rotulo:'padronização',
      /* 'retrabalho' acrescentado em 12/08/2026: o próprio tema já
         usava essa palavra em beneficios e indicadores ("Menos
         retrabalho por método diferente", "Nº de retrabalhos por
         mês") mas nunca esteve na lista de termos — "temos muito
         retrabalho aqui", sozinho, não batia em nada. É queixa comum
         de chão de fábrica e um sinal forte e específico de
         Governança (por isso também em FORTES, abaixo). */
      termos:['procedimento','padroniz','checklist','instrucao de trabalho','rotina','formulario','padrao','metodo','cada um faz','retrabalho'],
      beneficios:['Mesmo resultado independente de quem executa','Menos retrabalho por método diferente','Treinar gente nova fica mais rápido'],
      indicadores:['% de execuções seguindo o procedimento','Nº de retrabalhos por mês','Tempo de treinamento de um novato'],
      areas:['Qualidade','Processos','Produção'],
      riscos:['Procedimento escrito no gabinete e não na linha não é seguido','Excesso de etapa formal trava a operação'] },
    registro:{ rotulo:'registro e rastreabilidade',
      termos:['registro','anota','caderno','planilha','documenta','rastrea','historico','relatorio','apontamento','perde','memoria','somar','consolidar','cada turno','fim do mes','juntar'],
      beneficios:['Histórico que dá para consultar e somar','Decisão baseada em dado, não em memória','Rastro pronto quando o cliente ou o auditor pede'],
      indicadores:['% de eventos com registro completo','Tempo para localizar um registro','Nº de lacunas encontradas em auditoria interna'],
      areas:['Qualidade','TI','Produção'],
      riscos:['Registro que dá trabalho demais deixa de ser preenchido','Dado sobre pessoa exige base legal pela LGPD'] },
    conformidade:{ rotulo:'conformidade',
      termos:['auditoria','compliance','conformidade','norma','iso','nr-','legisla','licenca','fiscal','multa','requisito legal','certificac','nao conformidade'],
      beneficios:['Menos não-conformidade em auditoria','Menos exposição a multa e autuação','Certificação mais fácil de manter'],
      indicadores:['Nº de não-conformidades por auditoria','% de requisitos legais atendidos','Nº de autuações por ano'],
      areas:['Qualidade','Compliance','Jurídico'],
      riscos:['Interpretação da norma precisa de confirmação com quem audita','Prazo legal pode ser mais curto que o do projeto'] },
    transparencia:{ rotulo:'transparência e controle',
      termos:['indicador','transparen','etica','denuncia','meta','aprovac','lgpd','dados pessoais','privacidade','conflito de interesse','visibilidade','gestao a vista'],
      beneficios:['Time enxerga o próprio resultado','Decisão de priorização fica defensável','Canal claro para levantar problema'],
      indicadores:['Nº de indicadores publicados e atualizados','Tempo médio de aprovação','Nº de relatos tratados dentro do prazo'],
      areas:['Compliance','Gestão','TI'],
      riscos:['Indicador exposto sem contexto vira cobrança injusta','Tratar dado pessoal exige base legal e prazo de guarda'] },
    fornecedor:{ rotulo:'cadeia de fornecimento',
      termos:['fornecedor','contrat','compra','terceiro','suprimento','homologac','prestador','subcontrat','checagem','cadastr','due diligence'],
      beneficios:['Critério claro para escolher fornecedor','Menos risco herdado da cadeia','Negociação apoiada em dado'],
      indicadores:['% de fornecedores homologados com critério socioambiental','Nº de fornecedores auditados por ano','Prazo médio de homologação'],
      areas:['Suprimentos','Compliance','Qualidade'],
      riscos:['Critério novo pode reduzir demais a base de fornecedores','Exigência sem apoio técnico empurra o custo para o pequeno fornecedor'] }
  }}
};

/* ---------- Objetivos de Desenvolvimento Sustentável (ONU) ----------
   A AEVO cita os ODS como referencial na apresentação do desafio.
   Cada tema aponta para o objetivo que ele de fato move — não para
   uma lista decorativa de 17 ícones. */
const ODS = {
  agua:         { n:6,  nome:'Água potável e saneamento' },
  energia:      { n:7,  nome:'Energia limpa e acessível' },
  residuo:      { n:12, nome:'Consumo e produção responsáveis' },
  emissao:      { n:13, nome:'Ação contra a mudança global do clima' },
  seguranca:    { n:8,  nome:'Trabalho decente e crescimento econômico' },
  ergonomia:    { n:3,  nome:'Saúde e bem-estar' },
  capacitacao:  { n:4,  nome:'Educação de qualidade' },
  inclusao:     { n:10, nome:'Redução das desigualdades' },
  saude:        { n:3,  nome:'Saúde e bem-estar' },
  padronizacao: { n:9,  nome:'Indústria, inovação e infraestrutura' },
  registro:     { n:12, nome:'Consumo e produção responsáveis' },
  conformidade: { n:16, nome:'Paz, justiça e instituições eficazes' },
  transparencia:{ n:16, nome:'Paz, justiça e instituições eficazes' },
  fornecedor:   { n:12, nome:'Consumo e produção responsáveis' }
};

/* ---------- TERMOS FORTES ----------------------------------------
   Palavras que, sozinhas, já sustentam uma dimensão. "Energia" ou
   "acidente" numa frase não deixa dúvida sobre o enquadramento.
   Palavras ambíguas ficam de fora: "refeitório", "peso" e "controle"
   aparecem em conversa que nada tem de ESG, e por isso continuam
   precisando de um segundo termo para valer.

   Balanceamento 12/08/2026: Ambiental tinha 22 termos fortes contra
   15 do Social e 11 da Governança — desproporção que ajuda a
   explicar por que uma frase curta batia em E com mais frequência
   que em S ou G (um termo forte sozinho já sustenta a dimensão; os
   outros dois pilares tinham menos chance disso acontecer numa frase
   curta). Acrescentei só termos que são tão específicos quanto os que
   já estavam na lista — sem ambiguidade de sentido em português de
   fábrica — em vez de inflar a lista toda pra igualar o número.
   'copo' também virou FORTE nessa data: é o próprio exemplo citado no
   INSTRUCAO da IA remota ("trocar copo por caneca já é E") e o
   cenário da demonstração original do projeto — sem isso, "40 copos"
   sozinho (sem "plástico" ou outro segundo termo junto) não sustentava
   dimensão nenhuma e o cálculo de lucro nunca chegava a rodar. */
const FORTES = new Set([
  'agua','efluente','esgoto','reuso','reusar','reutiliz','reciclag','reciclar','residuo',
  'aterro','sucata','energia','kwh','solar','fotovoltaic','gerador','emissao',
  'co2','carbono','poluic','combustivel','vazamento','copo',
  'seguranca','acidente','epi','ergonom','dort','insalubr','treinamento','incendio',
  'capacit','acessibilidade','inclusao','deficien','pcd','libras','diversidade','afastamento',
  'auditoria','compliance','conformidade','lgpd','procedimento','padroniz','retrabalho','checklist',
  'rastrea','denuncia','certificac','legisla','nao conformidade'
]);

/** Tira acento e caixa alta, para o dicionário casar com texto escrito de qualquer jeito. */
function simplificar(t){
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

/* O termo tem que começar uma palavra. Antes a busca era substring
   pura, e isso dava acidentes graves: "idade" casava dentro de
   QUALIDADE, UNIDADE, CAPACIDADE, ATIVIDADE, PRODUTIVIDADE — as
   palavras mais comuns de fábrica — e "iso" dentro de PRECISO e
   AVISO. Toda ideia falando em qualidade ganhava um Social falso.
   Todos os termos são radicais de início de palavra ("contrat" para
   contratar/contrato, "deficien" para deficiente/deficiência), então
   exigir início de palavra mantém a intenção e mata o acidente. */
const _cacheRe = new Map();
function casaTermo(texto, termo){
  let re = _cacheRe.get(termo);
  if (!re){
    re = new RegExp('\\b' + termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    _cacheRe.set(termo, re);
  }
  return re.test(texto);
}

/* ---------- REFERÊNCIA REAL DE CUSTO (ES) --------------------------
   Só pra dar escala concreta ao "Lucro pra empresa" — nunca pra
   calcular valor exato, porque nenhuma destas é um número fixo.
   São médias/faixas de mercado; a conta real da empresa manda.
   Fontes, pesquisadas em 11/08/2026:

   - Água: CESAN/ARSP, tabela vigente desde 01/08/2024, faixa
     industrial >50m³ ≈ R$13,90/m³. Reajusta todo agosto.
   - Energia: EDP Espírito Santo/ANEEL, Grupo B (baixa tensão),
     vigente desde 01/01/2026. Indústria de grande porte é Grupo A,
     com tarifa binômia — não comparável direto em R$/kWh.
   - Resíduo: faixa de mercado para Classe IIA (não perigoso não
     inerte), que é o caso da maioria das ideias de chão de fábrica.
     Classe I (perigoso) custa muito mais e varia demais pra citar.
   - Gás natural: ES Gás (Companhia de Gás do ES, grupo Energisa),
     regulada pela ARSP. Preço médio ao cativo R$2,2167/m³ sem
     tributos desde 01/05/2026; PIS/Cofins + ICMS somam 26,25% da
     tarifa final, o que leva o valor com impostos a cerca de R$3/m³.
   - Combustível: ANP. FAIXA LARGA DE PROPÓSITO — o diesel oscilou
     muito em 2026 (R$5,77/L no ES em janeiro, R$7,57 na média
     nacional em março). Serve pra ordem de grandeza, não pra cotação.
   - Tempo de trabalho: salário médio de admissão no ES ≈ R$2.370
     (Novo CAGED/MTE, 2026), acrescido de ~70% de encargos e dividido
     por 220h/mês. É aproximação: o custo real varia com o cargo e o
     regime, e o número serve só pra dar ordem de grandeza. */
const CUSTO_HORA_ES = 2370 * 1.7 / 220;   // ≈ R$ 18/hora

const REFERENCIA_TARIFA = {
  agua:    { tipo:'agua',    valor:15,  faixa:'R$10 a R$20 por m³', fonte:'tarifa da CESAN' },
  energia: { tipo:'energia', valor:0.75, faixa:'R$0,70 a R$0,80 por kWh em baixa tensão', fonte:'tarifa da EDP no ES' },
  residuo: { tipo:'residuo', valor:325, faixa:'R$150 a R$500 por tonelada, Classe IIA', fonte:'mercado 2026' },
  emissao: { tipo:'combustivel', valor:6.75, faixa:'R$6 a R$7,50 por litro de diesel, preço volátil', fonte:'ANP' },

  /* Inclusão entra por outro caminho: não é economia recorrente, é
     risco financeiro evitado. A Lei de Cotas (art. 93 da Lei 8.213/91)
     obriga empresa com 100+ funcionários a ter de 2% a 5% do quadro
     com PCD ou reabilitados, e cada vaga não preenchida é multa.
     `unico:true` marca que é valor de uma vez, não por mês — por isso
     não multiplica por 12 como os outros. */
  inclusao: { tipo:'vaga', valor:3499.80, unico:true,
    faixa:'R$3.499,80 a R$349.978,53 de multa por vaga PCD não preenchida',
    fonte:'Lei de Cotas, Portaria 13/2026' },

  // Temas cujo ganho aparece como tempo de gente: afastamento evitado,
  // retrabalho que some, hora que deixa de ser gasta procurando papel.
  seguranca:    { tipo:'tempo', valor:CUSTO_HORA_ES, faixa:'cerca de R$18 por hora de trabalho', fonte:'salário médio no ES — CAGED' },
  ergonomia:    { tipo:'tempo', valor:CUSTO_HORA_ES, faixa:'cerca de R$18 por hora de trabalho', fonte:'salário médio no ES — CAGED' },
  saude:        { tipo:'tempo', valor:CUSTO_HORA_ES, faixa:'cerca de R$18 por hora de trabalho', fonte:'salário médio no ES — CAGED' },
  capacitacao:  { tipo:'tempo', valor:CUSTO_HORA_ES, faixa:'cerca de R$18 por hora de trabalho', fonte:'salário médio no ES — CAGED' },
  padronizacao: { tipo:'tempo', valor:CUSTO_HORA_ES, faixa:'cerca de R$18 por hora de trabalho', fonte:'salário médio no ES — CAGED' },
  registro:     { tipo:'tempo', valor:CUSTO_HORA_ES, faixa:'cerca de R$18 por hora de trabalho', fonte:'salário médio no ES — CAGED' },
  transparencia:{ tipo:'tempo', valor:CUSTO_HORA_ES, faixa:'cerca de R$18 por hora de trabalho', fonte:'salário médio no ES — CAGED' }
};

/* Gás entra no lugar da tarifa de energia quando o texto fala de gás:
   caldeira e forno costumam ser a gás, não elétricos, e aí o m³ vale
   pela tarifa da ES Gás, não pelo kWh da EDP. */
const REFERENCIA_GAS = { tipo:'gas', valor:2.60, faixa:'R$2,20 sem impostos a R$3,00 com impostos por m³', fonte:'tarifa da ES Gás' };

/* Acha "quantidade + unidade [+ período]" no texto pra estimar R$/mês.
   Só entra em ação com um padrão limpo e reconhecido — qualquer coisa
   fora disso (unidade que não bate, número absurdo) e a função devolve
   null, e quem chama cai de volta na frase sem número. Mostrar um
   valor calculado errado é pior do que não mostrar valor nenhum. */
/* Unidades por tipo. A mesma unidade significa coisas diferentes
   conforme o tema: "800 litros" é água numa ideia de reuso e diesel
   numa ideia de frota; "m³" é água na CESAN e gás na ES Gás. Por isso
   o tipo esperado entra como parâmetro em vez de ser adivinhado. */
const CONVERSAO = {
  agua:        { ml:1/1000000, litro:1/1000, m3:1 },
  gas:         { m3:1 },
  combustivel: { litro:1 },
  energia:     { kwh:1 },
  residuo:     { ton:1, kg:1/1000 },
  tempo:       { hora:1, dia:8 },       // 1 dia de trabalho ≈ 8h
  vaga:        { vaga:1 }
};

function extrairQuantidade(textoOriginal, tipoEsperado){
  const t = simplificar(textoOriginal);
  const tabela = CONVERSAO[tipoEsperado];
  if (!tabela) return null;

  /* Percorre TODAS as ocorrências de número+unidade, não só a primeira.
     Antes parava na primeira e desistia se ela não servisse: em "caixa
     de 20 kg ... afastada 15 dias", o "kg" (que não é tempo) fazia o
     "15 dias" ser perdido. Frase de chão de fábrica mistura unidades o
     tempo todo, então tem que procurar a que serve. */
  const re = /(\d+(?:[.,]\d+)?)\s*(mililitros?|ml|litros?|l\b|metros? c[uu]bicos?|m3|m³|kwh|toneladas?|ton\b|kg|quilos?|horas?|h\b|dias?|vagas?)/g;
  let base = null, depoisDaQuantidade = '';

  for (const m of t.matchAll(re)){
    const valor = parseFloat(m[1].replace(',', '.'));
    if (!isFinite(valor) || valor <= 0) continue;
    const u = m[2];

    let token;
    if (/^(mililitro|ml)/.test(u))       token = 'ml';
    else if (/^(litros?|l)$/.test(u))    token = 'litro';
    else if (/^(metro|m3|m³)/.test(u))   token = 'm3';
    else if (/^kwh/.test(u))             token = 'kwh';
    else if (/^(tonelada|ton)/.test(u))  token = 'ton';
    else if (/^(kg|quilo)/.test(u))      token = 'kg';
    else if (/^(horas?|h)$/.test(u))     token = 'hora';
    else if (/^dias?/.test(u))           token = 'dia';
    else if (/^vagas?/.test(u))          token = 'vaga';
    else continue;

    if (token in tabela){
      base = valor * tabela[token];
      /* Guarda só o trecho logo DEPOIS da quantidade. O período tem que
         estar colado nela: em "umas 300 por turno ... afastada 15 dias",
         o "por turno" fala das caixas, não dos 15 dias de afastamento —
         e aplicá-lo ali multiplicava o afastamento por 30, dando um
         valor absurdo na tela. */
      depoisDaQuantidade = t.slice(m.index + m[0].length, m.index + m[0].length + 30);
      break;
    }
  }
  if (base === null) return null;

  /* Quantas pessoas: "10 pessoas perdem 1 hora por dia" multiplica o
     ganho de tempo. Só vale pra tempo — litro não multiplica por gente. */
  if (tipoEsperado === 'tempo'){
    const p = t.match(/(\d+)\s*(?:pessoas?|funcionarios?|colaboradores?|operadores?)/);
    if (p){
      const n = parseInt(p[1], 10);
      if (n > 0 && n < 5000) base *= n;
    }
  }

  // Período colado na quantidade (ver acima); sem período, assume mensal
  const d = depoisDaQuantidade;
  let mult = 1;
  if (/^\s*(por dia|ao dia|diari|por turno)/.test(d)) mult = 30;
  else if (/^\s*(por semana|semanal)/.test(d)) mult = 4.33;
  else if (/^\s*(por ano|anual)/.test(d)) mult = 1/12;

  return { tipo: tipoEsperado, mensal: base * mult };
}

/* Olha só se o texto já tem sinal semântico de alguma dimensão ESG —
   reaproveita a mesma regra de "casar termo + sustentar" do motor
   completo (peso ≥ 2 ou 1 termo forte), sem montar o resultado
   inteiro. É o critério de "já chega de pergunta": olha o que foi
   dito, não quantas palavras foram usadas pra dizer. */
/* Plano B da pergunta personalizada, sem IA: acha o tema mais forte já
   batido no texto (mesma lógica de casar termo de sempre) e usa o
   rótulo, o termo que a própria pessoa escreveu e o indicador do tema
   pra direcionar a pergunta. Sem tema nenhum ainda, cai numa pergunta
   genérica — mas mesmo essa já é mais específica que "onde acontece"
   repetido sempre igual. numero: 0 = primeira pergunta, 1 = segunda,
   2+ = reforço quando ainda tá vago.

   Cada posição tem 2-3 formas diferentes de perguntar a mesma coisa.
   Existe por um motivo concreto, não é polimento: sem internet, é
   este código que roda ao vivo pra qualquer jurado que testar. Uma
   frase fixa se repete IDÊNTICA de ideia em ideia — só o rótulo do
   tema muda — e aí "pergunta personalizada" desmonta na frente do
   jurado, mesmo a lógica por trás sendo real. _historicoPerguntaLocal
   guarda qual FORMA foi usada nas últimas vezes em cada posição (não
   o texto final, que já varia com o tema — a casca da frase) e evita
   repetir a mesma casca duas vezes seguidas, mesmo em ideias
   diferentes testadas uma atrás da outra. */
const _historicoPerguntaLocal = { 0:[], 1:[], 2:[] };

function escolherForma(numero, formas, jaFeitas){
  const pos = Math.min(numero, 2);
  const recentes = _historicoPerguntaLocal[pos];
  // nunca repete o texto exato já perguntado nesta mesma conversa
  const livres = formas.filter(f => !jaFeitas.includes(f.texto));
  // entre as livres, evita a casca usada nas últimas vezes desta posição —
  // é o que impede "onde isso acontece" idêntico em ideias seguidas
  const semRepetirCasca = livres.filter(f => !recentes.includes(f.id));
  const pool = semRepetirCasca.length ? semRepetirCasca : (livres.length ? livres : formas);
  const escolhida = pool[Math.floor(Math.random() * pool.length)];

  recentes.push(escolhida.id);
  if (recentes.length > 2) recentes.shift();
  return escolhida.texto;
}

function perguntaLocal(texto, numero, jaFeitas){
  jaFeitas = jaFeitas || [];
  const t = simplificar(texto);
  let melhor = null, melhorPeso = 0, melhorCasados = [];
  for (const letra of ['E','S','G']){
    for (const tema of Object.values(TEMAS[letra].temas)){
      const casados = tema.termos.filter(termo => casaTermo(t, termo));
      /* CORREÇÃO 12/08/2026 — "cai sempre no Ambiental": esta função
         escolhia "melhor" com QUALQUER termo batido, mesmo um só e
         mesmo fraco. "sala elétrica" bate em "eletric" (radical do
         tema energia) uma única vez — termo isolado, nem está em
         FORTES — e isso já bastava pra tema virar "energia" e a
         pergunta nº2 sair perguntando kWh, mesmo a pessoa não tendo
         dito NADA sobre consumo ainda. A classificação final
         (sustenta(), em triagemLocal) já exige 2 termos batidos OU 1
         termo FORTE antes de aceitar uma dimensão — esta função
         pulava essa exigência, então a pergunta corria na frente da
         classificação e empurrava a conversa pra uma dimensão que a
         análise final nem ia aceitar. Repito aqui o mesmo critério —
         casados.length>=2 || tem termo forte — pra pergunta nunca
         assumir uma dimensão mais cedo do que a classificação
         assumiria. Sem tema que sustente, cai no branch "!melhor"
         (pergunta genérica) alguns parágrafos abaixo, em vez de
         travar num indicador técnico específico sem base. */
      const forte = casados.some(x => FORTES.has(x));
      if (casados.length && (casados.length >= 2 || forte) && casados.length > melhorPeso){
        melhorPeso = casados.length; melhor = tema; melhorCasados = casados;
      }
    }
  }
  // termo mais específico batido no texto da própria pessoa — citar ele
  // de volta mostra que a pergunta nasceu do que foi escrito, não só da
  // categoria. Isso vale como personalização real mesmo sem IA nenhuma
  // rodando: não é o tema que muda, é a palavra dela.
  const termoCitado = melhorCasados.length
    ? melhorCasados.slice().sort((a, b) => b.length - a.length)[0]
    : null;

  if (numero === 0){
    if (!melhor){
      return escolherForma(0, [
        { id:'g1', texto:'Onde isso acontece hoje — que setor ou equipamento?' },
        { id:'g2', texto:'Em que parte do processo isso rola? Setor, turno ou máquina já ajuda a situar.' },
        { id:'g3', texto:'Me situa: em qual área da fábrica isso costuma acontecer?' }
      ], jaFeitas);
    }
    return escolherForma(0, [
      { id:'a', texto:`Onde isso acontece — em qual setor ou equipamento tem a ver com ${melhor.rotulo}?` },
      { id:'b', texto: termoCitado
          ? `Você mencionou "${termoCitado}" — em qual setor ou turno isso costuma aparecer?`
          : `Sobre ${melhor.rotulo}: em qual setor ou turno isso costuma aparecer?` },
      { id:'c', texto:`Pensando em ${melhor.rotulo}: isso acontece na planta inteira ou num equipamento específico?` }
    ], jaFeitas);
  }

  if (numero === 1){
    if (!melhor){
      return escolherForma(1, [
        { id:'g1', texto:'Consegue estimar o tamanho? Pode ser por alto: litros por dia, horas por semana, número de pessoas.' },
        { id:'g2', texto:'Dá pra ter uma ideia de escala? Mesmo um número aproximado já ajuda bastante.' }
      ], jaFeitas);
    }
    const indicador = melhor.indicadores[Math.floor(Math.random() * melhor.indicadores.length)];
    return escolherForma(1, [
      { id:'a', texto:`Consegue estimar o tamanho? Pra ${melhor.rotulo}, algo como "${primeiraMinuscula(indicador)}" já ajuda.` },
      { id:'b', texto:`Dá pra colocar um número nisso? Pensando em ${melhor.rotulo}, "${primeiraMinuscula(indicador)}" seria um jeito de medir.` },
      { id:'c', texto:`Tem alguma estimativa de tamanho? Nem precisa ser exata — "${primeiraMinuscula(indicador)}" já dá um norte.` }
    ], jaFeitas);
  }

  return escolherForma(2, [
    { id:'a', texto:'Consegue me contar mais um pouco? O que muda na prática, e dá pra estimar o tamanho do ganho?' },
    { id:'b', texto:'Me ajuda a entender melhor: o que exatamente fica diferente no dia a dia com essa ideia?' },
    { id:'c', texto:'Falta só mais um detalhe: o que muda na prática depois que isso for implementado?' }
  ], jaFeitas);
}

function temSinalSuficiente(texto){
  const t = simplificar(texto);
  for (const letra of ['E','S','G']){
    let peso = 0, achouForte = false;
    for (const tema of Object.values(TEMAS[letra].temas)){
      const casados = tema.termos.filter(termo => casaTermo(t, termo));
      if (casados.length){
        peso += casados.length;
        if (casados.some(x => FORTES.has(x))) achouForte = true;
      }
    }
    if (peso >= 2 || achouForte) return true;
  }
  return false;
}

/* CORREÇÃO 12/08/2026 — "pergunta coisa que já está óbvia": o
   próprio código já reconhecia que um texto completo (com número e
   unidade) não precisa de pergunta de acompanhamento — é exatamente
   o motivo dos EXEMPLOS de demonstração pularem a conversa e irem
   direto pra análise (ver comentário "Textos completos de propósito"
   em app.js). Mas esse atalho só existia pro botão de demonstração;
   quem digitava uma ideia já completa do próprio punho, em
   app.js/enviar(), continuava recebendo as MIN_PERGUNTAS=2 perguntas
   obrigatórias mesmo já tendo respondido tudo. Esta função expõe o
   mesmo critério de maturidade que triagemLocal já calcula pra
   decidir o nível (temNumero + temUnidade), mais o mesmo piso de
   sinal ESG de temSinalSuficiente, pra enviar() poder pular a
   pergunta obrigatória quando não há nada de útil a perguntar. */
function ideiaBemDetalhada(texto){
  if (!temSinalSuficiente(texto)) return false;
  const t = simplificar(texto);
  const temNumero  = /\d/.test(t);
  const temUnidade = /(litro|m3|m³|kg|tonelada|ton\b|kwh|hora|minuto|%|reais|r\$|milhao|milhoes|mil\b|db|peca|unidade|dia|mes|semana)/.test(t);
  const palavras = texto.trim().split(/\s+/).filter(Boolean).length;
  return temNumero && temUnidade && palavras >= 12;
}

function triagemLocal(texto){
  const t = simplificar(texto);
  const dimensoes = [];

  for (const letra of ['E','S','G']){
    const achados = [];
    for (const [chave, tema] of Object.entries(TEMAS[letra].temas)){
      const casados = tema.termos.filter(termo => casaTermo(t, termo));
      if (casados.length) achados.push({ chave, tema, peso: casados.length, casados });
    }
    if (!achados.length) continue;
    achados.sort((a,b)=>b.peso-a.peso);
    const peso = achados.reduce((s,a)=>s+a.peso,0);
    if (peso >= 1) dimensoes.push({ letra, nome:TEMAS[letra].nome, peso, principal:achados[0], achados });
  }
  dimensoes.sort((a,b)=>b.peso-a.peso);

  /* Uma dimensão só se sustenta com dois termos casados ou com um termo
     forte. É o que separa uma ideia de verdade de "o café do refeitório"
     ou "o peso da papelada" — palavras que existem em qualquer conversa.
     A regra vale para cada dimensão isoladamente: duas dimensões fracas
     não viram uma classificação boa. */
  const sustenta = d => d.peso >= 2 || d.achados.some(a => a.casados.some(t => FORTES.has(t)));
  for (let i = dimensoes.length - 1; i >= 0; i--){
    if (!sustenta(dimensoes[i])) dimensoes.splice(i, 1);
  }

  if (!dimensoes.length){
    return {
      motor:'local', titulo: resumir(texto), dimensoes:[],
      justificativas:[{ dim:'—', texto:'Não achei ligação clara com Ambiental, Social ou Governança no que foi descrito. Pode ser que só falte detalhe: conte o que muda na prática — o que se gasta a menos, quem passa a trabalhar melhor, ou o que passa a ficar registrado.' }],
      beneficios:[], indicadores:[], areas:[], riscos:[], ods:[], nivel:'BAIXO',
      passos:['Descrever o que a ideia muda na rotina de hoje','Estimar o tamanho do ganho, mesmo que por alto','Reapresentar para nova leitura'],
      encaminhamento:'', lucro:'', lucroValorAnual:null
    };
  }

  /* Maturidade: quem descreve com número e unidade já pensou no ganho.
     É o que separa "dava pra reusar a água" de "são 800 litros por dia". */
  const temNumero  = /\d/.test(t);
  const temUnidade = /(litro|m3|m³|kg|tonelada|ton\b|kwh|hora|minuto|%|reais|r\$|milhao|milhoes|mil\b|db|peca|unidade|dia|mes|semana)/.test(t);
  const palavras   = texto.trim().split(/\s+/).length;
  const temaForte  = dimensoes.some(d => d.principal.peso >= 4);

  /* Valor em dinheiro é o sinal mais forte de maturidade: quem diz
     "pagamos 10 milhões de conta de luz" já dimensionou o caso de
     negócio, mesmo descrevendo em poucas palavras. Antes o texto curto
     e muito quantificado era penalizado por vocabulário. */
  const temDinheiro = /(r\$|reais|milh[ao]|mil\b)/.test(t);

  let pontos = dimensoes.reduce((s,d)=>s+Math.min(d.peso*2,12), 0);
  if (temNumero && temUnidade) pontos += 6;   // ideia quantificada
  else if (temNumero) pontos += 2;
  if (temNumero && temDinheiro) pontos += 4;  // caso de negócio dimensionado
  if (palavras > 25) pontos += 2;
  if (dimensoes.length > 1) pontos += 4;      // ganho em mais de uma frente
  if (temaForte) pontos += 3;                 // tema bem caracterizado

  const nivel = pontos >= 14 ? 'ALTO' : pontos >= 6 ? 'MÉDIO' : 'BAIXO';
  const principal = dimensoes[0].principal.tema;

  /* Junta os temas de todas as dimensões achadas, sem repetir, para que
     uma ideia E+S traga indicador das duas frentes. */
  const juntar = (campo, limite) => {
    const saida = [];
    for (const d of dimensoes){
      for (const item of d.principal.tema[campo]){
        if (!saida.includes(item) && saida.length < limite) saida.push(item);
      }
    }
    return saida;
  };

  // ODS ligados aos temas principais de cada dimensão encontrada
  const ods = [];
  for (const d of dimensoes){
    const o = ODS[d.principal.chave];
    if (o && !ods.some(x=>x.n === o.n)) ods.push(o);
  }

  const areas = juntar('areas', 3);

  /* lucroPara agora devolve {texto, valorAnual} em vez de só uma
     string — ver comentário na função. O painel usa lucroValorAnual
     pra ranquear "maior potencial financeiro" (calcularRanking em
     app.js); a ficha continua mostrando só o texto, igual antes. */
  const lucroCalc = lucroPara(juntar('beneficios', 4), dimensoes[0].principal.chave, texto);

  return {
    motor:'local',
    titulo: resumir(texto),
    dimensoes: dimensoes.map(d=>d.letra),
    justificativas: dimensoes.map(d=>({
      dim: d.letra,
      texto: `A descrição fala de ${d.principal.tema.rotulo} (aparece "${d.principal.casados[0]}"), e é isso que liga a ideia à dimensão ${d.nome}.`
    })),
    beneficios: juntar('beneficios', 4),
    indicadores: juntar('indicadores', 3),
    areas,
    riscos: juntar('riscos', 3),
    ods,
    nivel,
    passos: [
      `Medir ${primeiraMinuscula(principal.indicadores[0])} como está hoje, para ter base de comparação`,
      'Testar em uma linha ou setor antes de levar para a fábrica toda',
      `Levar o resultado de 30 dias para ${paraSetor(principal.areas[0])}`,
      temNumero ? 'Estimar o investimento e o retorno com o número já levantado'
                : 'Levantar o número que falta para dimensionar o ganho',
      'Se aprovado, implementar por completo e acompanhar o resultado nos meses seguintes'
    ],
    encaminhamento: encaminhamentoPara(areas, nivel),
    lucro: lucroCalc.texto,
    lucroValorAnual: lucroCalc.valorAnual
  };
}

/* "Empresa sempre quer lucro" — sem isto, o ganho fica descrito como
   benefício genérico e ninguém traduz pra resultado financeiro. Reusa
   o primeiro benefício (o mais direto) em vez de inventar um segundo
   texto do zero, e nunca inventa valor em R$ que a ideia não trouxe —
   quem quiser o número exato já tem em "Como medir". */
/* Quando a pessoa já diz quanto custa ("gastamos 10 mil reais por mês
   de energia"), esse número vale mais que qualquer estimativa nossa —
   é a conta real da empresa. Antes isso era ignorado e caía na faixa
   genérica de tarifa, que é o pior resultado: a pessoa deu o dado
   exato e recebeu uma resposta vaga. */
function extrairDinheiro(textoOriginal){
  const t = simplificar(textoOriginal);

  /* O marcador de dinheiro tem que estar COLADO no número, e o número
     não pode ser seguido de unidade física. Antes bastava a frase ter
     "gasta" em qualquer lugar, e "gastando uns 300 kwh" virava R$ 300.
     Aceita: "R$ 10.000" · "8500 reais" · "10 mil reais" · "2 milhoes". */
  const m = t.match(/(r\$\s*)?(\d{1,3}(?:\.\d{3})+|\d+(?:,\d+)?)\s*(milhoes|milhao|mil|mi)?\b\s*(reais|reai|conto)?/);
  if (!m) return null;

  const temCifrao  = !!m[1];
  const escala     = m[3];
  const temReais   = !!m[4];
  if (!temCifrao && !temReais && !escala) return null;

  // Se logo depois do número vem unidade física, não é dinheiro
  const depois = t.slice(m.index + m[0].length).trimStart();
  if (/^(kwh|litros?|l\b|ml|m3|m³|kg|quilos?|toneladas?|ton\b|horas?|h\b|dias?|pessoas?|pecas?|caixas?)/.test(depois)) return null;

  let valor = parseFloat(m[2].replace(/\./g, '').replace(',', '.'));
  if (!isFinite(valor) || valor <= 0) return null;

  if (escala === 'mil') valor *= 1000;
  else if (escala === 'milhao' || escala === 'milhoes' || escala === 'mi') valor *= 1000000;

  let mult = 1;
  if (/\bpor dia\b|\bao dia\b|\bdiari/.test(t)) mult = 30;
  else if (/\bpor semana\b|\bsemanal/.test(t)) mult = 4.33;
  else if (/\bpor ano\b|\banual/.test(t)) mult = 1/12;

  const mensal = valor * mult;
  if (mensal < 1 || mensal > 50000000) return null;
  return { mensal };
}

/* ---------- PREÇO UNITÁRIO × QUANTIDADE (correção de 12/08/2026) ----
   Faltava por completo: quando a pessoa descreve um ITEM contável —
   "200 copos plásticos por dia" — e diz quanto custa cada um —
   "cada copo custa R$0,20" —, essa é a conta mais confiável que
   existe pro "Lucro pra empresa", porque não é tarifa média de
   referência, é o preço que a própria empresa já paga por aquele
   item específico.

   RAIZ DO PROBLEMA (evidência): extrairQuantidade() só reconhece
   unidade FÍSICA — ml, litro, m³, kWh, tonelada, kg, hora, dia, vaga
   (ver a tabela CONVERSAO acima e a regex logo abaixo dela). "Copo"
   não é nenhuma dessas, então pra esse relato extrairQuantidade()
   sempre devolvia null. lucroPara() caía direto no último fallback
   ("Pra ter noção de escala: R$150 a R$500 por tonelada, Classe
   IIA..."), que é exatamente o texto genérico visto na ficha — o
   valor de tonelada de resíduo não perigoso, sem nenhum cálculo com
   os dois números que a pessoa deu. Esta função preenche essa
   lacuna; extrairQuantidade() não foi alterada, porque continua
   certa para litro/kg/kWh — o caso que faltava é outro, não um
   defeito no que já existia. */
function extrairPrecoUnitario(textoOriginal){
  const t = simplificar(textoOriginal);

  /* CORREÇÃO 12/08/2026 — "usando 40 copos, não consegue ver o preço
     de cada copo": a primeira versão só reconhecia "R$X cada/por
     item/unitário" e "cada X custa R$Y". Testei outras 10 formas
     naturais de escrever a mesma coisa e 4 falhavam: verbo diferente
     de "custa" ("o copo SAI R$0,50", "cada copo É R$0,50", "cada
     copo FICA/VALE R$0,50"), preço antes do item ("custa R$0,50 o
     copo"), barra ("R$0,50/copo") e dois-pontos ("Cada copo: R$0,50").
     Ordem continua do mais específico pro mais genérico — cada padrão
     comentado abaixo com o motivo de existir.

     CORREÇÃO seguinte, mesmo dia — "e com metro cúbico, converte?":
     "m³" tem o caractere "³" (expoente), que NÃO é reconhecido por
     \w (só letra/número/underscore ASCII) — "cada m³ custa" quebrava
     porque \w+ parava em "m" e nunca chegava em "custa". Troquei \w+
     por [a-z0-9³²] nos trechos que capturam o NOME do item (não nos
     verbos), pra "m³" contar como uma palavra só igual "copo" conta.
     Também faltava "por m³"/"por m3"/"por kg"/"por litro" etc. na
     lista de marcadores depois de "R$X" — só tinha nome de item
     contável (copo, peça, caixa...), nunca unidade de medida. */
  const mCentavos = t.match(/(\d+)\s*centavos\s*(?:cada|a unidade|por unidade)?\b/);

  // "R$X/copo" ou "R$X/m³" — barra como separador. Nunca período
  // (dia/semana/mês/ano) depois da barra: "R$500/mês" é valor TOTAL
  // mensal (outra função, extrairDinheiro), não preço de um item.
  const mPrecoBarra = t.match(/r\$\s*(\d+(?:[.,]\d+)?)\s*\/\s*(?!dias?\b|semanas?\b|mes\b|meses\b|anos?\b)[a-z0-9³²]+/);

  const mPrecoDepois = t.match(/r\$\s*(\d+(?:[.,]\d+)?)\s*(?:cada|a unidade|unitario|por\s+(?:unidade|copo|peca|item|caixa|embalagem|saco|garrafa|metro|metros|tonelada|litro|quilo|m3|m³|kg|kwh))(?![a-z0-9³²])/);

  // "cada <item> custa/sai/fica/vale/é R$X" ou "cada <item>: R$X" —
  // exige "cada" antes do item, senão "a solução custa R$4000" (um
  // investimento total, não preço por unidade) também casaria.
  const mPrecoCusta = t.match(/cada\s+[a-z0-9³²]+\s*(?::|\bcusta\b|\bsai\b|\bfica\b|\bvale\b|\be\b)\s*(?:por\s+)?r?\$?\s*(\d+(?:[.,]\d+)?)/);

  // "custa/sai/fica/vale R$X o/a <item>" — verbo antes, item depois,
  // sem "cada". Exige "o/a <item>" logo em seguida, e nunca "a
  // prazo"/"a vista"/"a granel" (forma de pagamento, não item).
  const mPrecoAntes = t.match(/\b(?:custa|sai|fica|vale)\b\s*(?:por\s+)?r?\$?\s*(\d+(?:[.,]\d+)?)\s+(?:o|a)\s+(?!prazo\b|vista\b|granel\b)[a-z0-9³²]+/);

  let preco = null, precoIdx = -1, precoLen = 0;
  if (mCentavos){ preco = parseInt(mCentavos[1], 10) / 100; precoIdx = mCentavos.index; precoLen = mCentavos[0].length; }
  else if (mPrecoBarra){ preco = parseFloat(mPrecoBarra[1].replace(',', '.')); precoIdx = mPrecoBarra.index; precoLen = mPrecoBarra[0].length; }
  else if (mPrecoDepois){ preco = parseFloat(mPrecoDepois[1].replace(',', '.')); precoIdx = mPrecoDepois.index; precoLen = mPrecoDepois[0].length; }
  else if (mPrecoCusta){ preco = parseFloat(mPrecoCusta[1].replace(',', '.')); precoIdx = mPrecoCusta.index; precoLen = mPrecoCusta[0].length; }
  else if (mPrecoAntes){ preco = parseFloat(mPrecoAntes[1].replace(',', '.')); precoIdx = mPrecoAntes.index; precoLen = mPrecoAntes[0].length; }
  else {
    // "o/a <item> custa/sai/fica/vale R$X" sem "cada" — o mais solto
    // de todos os padrões, então só aceita com uma prova a mais: a
    // MESMA palavra do item tem que aparecer de novo em outro trecho
    // do texto (confirma que é o item repetido — "40 copos ... o
    // copo sai R$0,50" — e não coincidência — "a lâmpada custa R$50
    // ... 30 postos por mês", onde "lâmpada" não tem nada a ver com
    // "postos"). Testado: sem essa checagem, a frase da lâmpada virava
    // R$1.500/mês inventado; com ela, corretamente não calcula nada.
    const mItemVerbo = t.match(/\b(?:o|a)\s+([a-z0-9³²]+)\s+\b(?:custa|sai|fica|vale)\b\s*(?:por\s+)?r?\$?\s*(\d+(?:[.,]\d+)?)/);
    if (mItemVerbo){
      const stem = mItemVerbo[1].replace(/s$/, '');
      const resto = t.slice(0, mItemVerbo.index) + t.slice(mItemVerbo.index + mItemVerbo[0].length);
      if (stem.length >= 3 && new RegExp('\\b' + stem).test(resto)){
        preco = parseFloat(mItemVerbo[2].replace(',', '.'));
        precoIdx = mItemVerbo.index; precoLen = mItemVerbo[0].length;
      }
    }
  }
  if (preco === null || !isFinite(preco) || preco <= 0 || preco > 5000) return null;

  /* Quantidade: primeiro número da frase que não é o próprio preço já
     capturado acima (senão "R$0,20 cada" contaria "0,20" de novo como
     se fosse a quantidade de itens). */
  let qtd = null;
  for (const m of t.matchAll(/\d+(?:[.,]\d+)?/g)){
    if (m.index >= precoIdx && m.index < precoIdx + precoLen) continue;
    const v = parseFloat(m[0].replace(',', '.'));
    if (isFinite(v) && v > 0){ qtd = v; break; }
  }
  if (qtd === null) return null;

  /* Exige período explícito no texto — sem ele, não dá pra saber se
     "200 copos" é por dia, por semana ou por mês, e arriscar um
     multiplicador errado é pior do que não mostrar valor nenhum
     (mesmo princípio já usado em extrairQuantidade/extrairDinheiro). */
  let mult = null;
  if (/\bpor dia\b|\bao dia\b|\bdiari/.test(t)) mult = 30;
  else if (/\bpor semana\b|\bsemanal/.test(t)) mult = 4.33;
  else if (/\bpor mes\b|\bmensal/.test(t)) mult = 1;
  else if (/\bpor ano\b|\banual/.test(t)) mult = 1/12;
  if (mult === null) return null;

  const mensal = qtd * preco * mult;
  if (!isFinite(mensal) || mensal < 1 || mensal > 50000000) return null;
  return { qtd, preco, mensal, anual: mensal * 12 };
}

/* Frase comum aos casos com número CALCULADO (não estimativa de
   tarifa): deixa explícito que é economia — custo que deixa de sair
   do caixa —, não lucro líquido contábil. Sem isto a ficha dizia
   "lucro" e mostrava um valor de custo evitado como se fosse lucro
   extra, o que é a confusão que a empresa mais cobra clareza. */
const NOTA_ECONOMIA = ' É economia — o custo deixa de sair do caixa —, não lucro líquido contábil, mas pesa igual no resultado da empresa.';

/* Devolve { texto, valorAnual }. valorAnual só vem preenchido quando
   dá pra apontar um R$/ano concreto e comparável entre ideias — é o
   que o painel usa pra ranquear "maior potencial financeiro" (ver
   calcularRanking em app.js). Fica null nos casos sem número, na
   multa da Lei de Cotas (é risco de uma vez, não economia recorrente
   — somar os dois no ranking compararia coisas diferentes) e no
   exemplo ilustrativo de tempo (é hipotético — "3 pessoas" não veio
   do texto da pessoa, então não pode competir no ranking como se
   fosse dado real de uma ideia). */
function lucroPara(beneficios, temaChave, textoOriginal){
  if (!beneficios.length) return { texto:'', valorAnual:null };
  const base = `${beneficios[0]} — isso é custo a menos saindo da empresa todo mês, o que já é economia direta, mesmo sem virar uma venda nova.`;
  const fmt = v => v.toLocaleString('pt-BR', { minimumFractionDigits: v < 100 ? 2 : 0, maximumFractionDigits: v < 100 ? 2 : 0 });
  const fmtQtd = v => Number.isInteger(v) ? v.toLocaleString('pt-BR') : v.toLocaleString('pt-BR', { maximumFractionDigits:2 });

  /* CASO 1 — quantidade contável E preço unitário, os dois ditos pela
     própria pessoa ("200 copos por dia, cada um custa R$0,20"). Vem
     antes do extrairDinheiro porque é ainda mais direto: dois números
     que a pessoa já deu, sem precisar interpretar frase nenhuma sobre
     "quanto gasta". Ver extrairPrecoUnitario() acima para o porquê
     desse caso não existia antes desta correção. */
  const porUnidade = extrairPrecoUnitario(textoOriginal);
  if (porUnidade){
    return {
      texto: `${base} Pela conta que você mesmo trouxe — ${fmtQtd(porUnidade.qtd)} × R$ ${fmt(porUnidade.preco)} —, hoje isso pesa R$ ${fmt(porUnidade.mensal)} por mês e R$ ${fmt(porUnidade.anual)} em 12 meses.${NOTA_ECONOMIA}`,
      valorAnual: porUnidade.anual
    };
  }

  /* CASO 2 — valor total já em reais citado pela pessoa ("gastamos 10
     mil por mês de energia"). Já existia antes desta correção; só
     ganhou o R$/ano explícito e a mesma nota de economia-vs-lucro. */
  const dinheiro = extrairDinheiro(textoOriginal);
  if (dinheiro){
    const anual = dinheiro.mensal * 12;
    return {
      texto: `${base} Pelo valor que você mesmo citou, isso hoje pesa cerca de R$ ${fmt(dinheiro.mensal)} por mês — R$ ${fmt(anual)} em 12 meses.${NOTA_ECONOMIA}`,
      valorAnual: anual
    };
  }

  let t = REFERENCIA_TARIFA[temaChave];
  /* CORREÇÃO 12/08/2026 — "não está calculando o lucro": 'conformidade'
     e 'fornecedor' (2 dos 14 temas, os dois em Governança) nunca
     tiveram entrada em REFERENCIA_TARIFA — multa ambiental e custo de
     atraso de fornecedor variam demais caso a caso pra virar uma
     faixa de mercado confiável (mesma lógica já usada pra deixar
     combustível fora de escopo mais abaixo, "melhor sem número do
     que com o número errado"). Antes disso, `!t` devolvia só a frase
     base, sem número e sem explicar por quê — pra quem está usando,
     parecia que o cálculo simplesmente não rodou. Agora diz
     explicitamente que não há referência de mercado pra esse tipo de
     risco e convida a pessoa a dar o valor dela — que aí entra pelos
     casos 1/2 acima (extrairPrecoUnitario/extrairDinheiro), que não
     dependem de tarifa nenhuma. */
  if (!t) return {
    texto: `${base} Não existe uma referência de mercado confiável pra esse tipo de risco — varia demais por caso pra virar uma faixa útil. Se souber o custo de uma multa, atraso ou perda que a empresa já teve com isso, me conta o valor que eu calculo em cima do número real.`,
    valorAnual: null
  };

  /* Caldeira e forno costumam ser a gás CANALIZADO, não elétricos: aí
     o m³ vale pela tarifa da ES Gás, não pelo kWh da EDP. GLP e
     botijão ficam de fora de propósito — é outro produto, vendido por
     botijão de 13kg, não por m³, e não achei preço confiável e atual
     do ES pra citar. Melhor sem número do que com o número errado. */
  if (temaChave === 'energia' && /gas natural|gas canalizado/.test(simplificar(textoOriginal))){
    t = REFERENCIA_GAS;
  }

  const q = extrairQuantidade(textoOriginal, t.tipo);

  /* Valor de uma vez (multa), não economia recorrente: não faz sentido
     dizer "por mês" nem multiplicar por 12, e não entra no ranking do
     painel como "potencial financeiro" — é risco, não economia. */
  if (t.unico){
    if (q && isFinite(q.mensal)){
      const minimo = q.mensal * t.valor;
      if (minimo >= 1 && minimo <= 50000000){
        return {
          texto: `${base} Tem risco financeiro junto: pela Lei de Cotas isso é multa de no mínimo R$ ${fmt(minimo)}, e pode chegar a muito mais conforme a gravidade (${t.fonte}).`,
          valorAnual: null
        };
      }
    }
    return { texto: `${base} Tem risco financeiro junto: ${t.faixa} (${t.fonte}).`, valorAnual: null };
  }

  if (q && isFinite(q.mensal)){
    const rs = q.mensal * t.valor;
    // fora de qualquer faixa plausível pra "chão de fábrica" = não arrisca mostrar
    if (rs >= 1 && rs <= 500000){
      const anual = rs * 12;
      return {
        texto: `${base} Pela referência média do ES (${t.faixa}, ${t.fonte}), fica em torno de R$ ${fmt(rs)} por mês — R$ ${fmt(anual)} em 12 meses. É estimativa a partir do que foi descrito, vale confirmar com a conta real.${NOTA_ECONOMIA}`,
        valorAnual: anual
      };
    }
  }
  /* Sem quantidade no texto, mostra a escala. Para tempo de trabalho,
     "cerca de R$18 por hora" sozinho não diz nada a um gestor — vira
     conta de mês, que é como orçamento é discutido. valorAnual fica
     null aqui: "3 pessoas" é exemplo ilustrativo, não dado da ideia. */
  if (t.tipo === 'tempo'){
    const porMes3 = CUSTO_HORA_ES * 8 * 3;   // 3 pessoas × 1 dia recuperado
    return {
      texto: `${base} Pra ter noção de escala: cada hora de trabalho custa cerca de R$ ${fmt(CUSTO_HORA_ES)} no ES (${t.fonte}). Se a ideia devolver um dia de trabalho por mês para 3 pessoas, já são cerca de R$ ${fmt(porMes3)} por mês — R$ ${fmt(porMes3 * 12)} em 12 meses.`,
      valorAnual: null
    };
  }
  return { texto: `${base} Pra ter noção de escala: ${t.faixa} (${t.fonte}).`, valorAnual: null };
}

/* CORREÇÃO 12/08/2026 — "Levar o resultado de 30 dias para Meio
   Ambiente" (print anexado pela equipe): o nome do setor, sozinho
   numa frase, lê como se o resultado fosse entregue ao "Meio
   Ambiente" em si, não a quem cuida dele. Como pílula solta em
   "Quem precisa entrar" (desenharFicha, em app.js) o nome cru funciona
   bem — é só uma etiqueta ali. O problema é só quando o mesmo nome é
   encaixado dentro de uma frase de ação (passos, encaminhamento) sem
   nenhuma palavra de ligação. Esta função existe só pra isso: junta o
   nome do setor com "o setor responsável por", do jeito que a equipe
   pediu, em todo lugar que constrói frase (não em pílula/etiqueta). */
function paraSetor(area){
  return area ? `o setor responsável por ${area}` : 'o setor responsável';
}

/* Sem isto, a ficha lista passos soltos e para sem dizer pra quem a
   ideia vai — foi exatamente essa lacuna que a equipe apontou vendo a
   ficha ao vivo. O funil da própria AEVO é Coleta → Triagem → Seleção
   → Projeto → Resultado; isto é a ponte entre a triagem (o que este
   motor faz) e a seleção (o que vem depois). */
function encaminhamentoPara(areas, nivel){
  const area = areas[0] ? paraSetor(areas[0]) : 'a área responsável';
  if (nivel === 'ALTO'){
    return `Leve para ${area} como proposta formal, com prazo de resposta definido — o ganho já é claro o bastante para pedir prioridade.`;
  }
  if (nivel === 'MÉDIO'){
    return `Leve para ${area} como proposta a avaliar — vale rodar o teste piloto antes de formalizar.`;
  }
  return `Converse com ${area} para entender se dá para aprofundar antes de formalizar como projeto.`;
}

function primeiraMinuscula(s){ return s.charAt(0).toLowerCase() + s.slice(1); }

function resumir(texto){
  const limpo = texto.trim().replace(/\s+/g,' ');
  if (limpo.length <= 62) return limpo;
  // tira pontuação da ponta antes das reticências, senão sai "caderno...."
  return limpo.slice(0,60).replace(/\s\S*$/,'').replace(/[.,;:!?…]+$/,'') + '…';
}

/* ---------- ODS a partir de dimensões, para o resultado da IA ----------
   A IA devolve letras E/S/G; aqui casamos o texto dela com os temas do
   dicionário para achar o ODS correspondente sem pedir isso ao modelo. */
function odsPorTexto(texto, dimensoes){
  const t = simplificar(texto);
  const saida = [];
  for (const letra of dimensoes){
    if (!TEMAS[letra]) continue;
    let melhor = null, maior = 0;
    for (const [chave, tema] of Object.entries(TEMAS[letra].temas)){
      const peso = tema.termos.filter(x=>casaTermo(t,x)).length;
      if (peso > maior){ maior = peso; melhor = chave; }
    }
    const o = melhor && ODS[melhor];
    if (o && !saida.some(x=>x.n === o.n)) saida.push(o);
  }
  return saida;
}
