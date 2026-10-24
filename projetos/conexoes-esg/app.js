/* ==========================================================
   CONEXÕES ESG · aplicação
   InovaHACK SENAI Porto 2026 — desafio AEVO

   Três caminhos de análise, nesta ordem de preferência:
     1. função Netlify  — chave no servidor, nada exposto
     2. chave na sessão — digitada na hora, só na memória da aba
     3. triagem local   — motor-local.js, sem internet

   Nenhum arquivo deste projeto contém chave de API. Se a demo
   for numa máquina só, use o caminho 2: a chave é digitada no
   momento e some quando a aba fecha.
   ========================================================== */

/* ---------- 1. DEPÓSITO -------------------------------------------
   Guarda em memória. Para persistir no Firebase, troque só o corpo
   destes três métodos — nada mais no projeto toca em armazenamento. */
const Deposito = {
  _itens: [],
  _chave: 'conexoes-esg:ideias',
  persistente: true,

  /* Guarda no armazenamento do navegador, então o painel sobrevive a
     recarregar a página, fechar a aba e reabrir no dia seguinte. Se o
     navegador bloquear (aba anônima, política restritiva), continua
     funcionando só em memória — a demonstração não quebra por isso. */
  carregar(){
    try {
      const bruto = localStorage.getItem(this._chave);
      if (bruto) this._itens = JSON.parse(bruto) || [];
    } catch(e){
      this.persistente = false;
      console.warn('Sem armazenamento local; o painel vale só para esta sessão.');
    }
  },
  _gravar(){
    try { localStorage.setItem(this._chave, JSON.stringify(this._itens)); }
    catch(e){ this.persistente = false; }
  },
  salvar(ideia){
    ideia.id = 'ID' + String(this._itens.length + 1).padStart(3,'0');
    this._itens.push(ideia);
    this._gravar();
    return ideia;
  },
  apagarTudo(){
    this._itens = [];
    try { localStorage.removeItem(this._chave); } catch(e){}
  },
  listar(){ return this._itens.slice().reverse(); },
  todas(){ return this._itens; }
};

/* ---------- 2. SANEAMENTO LGPD ------------------------------------
   Roda antes de mandar qualquer coisa para fora. */
function limpar(texto){
  const achados = [];
  let t = texto;
  const regras = [
    // Traço final agora obrigatório (era -?). Antes, com todo separador
    // opcional, um telefone digitado sem pontuação (11 dígitos corridos,
    // ex. "27999998888") batia nesta regra ANTES de chegar na de
    // telefone, e saía rotulado "[CPF removido]" — o dado sumia
    // corretamente, mas com o rótulo errado. Confirmado rodando dois
    // telefones reais e vendo os dois virarem "CPF" no achados.
    [/\b\d{3}\.?\d{3}\.?\d{3}-\d{2}\b/g, '[CPF removido]', 'CPF'],
    [/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, '[CNPJ removido]', 'CNPJ'],
    [/[\w.+-]+@[\w-]+\.[\w.]+/g, '[e-mail removido]', 'e-mail'],
    [/\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/g, '[telefone removido]', 'telefone'],
    [/\bmatr[ií]cula\s*:?\s*\d+/gi, '[matrícula removida]', 'matrícula']
  ];
  for (const [re, troca, nome] of regras){
    if (re.test(t)){ achados.push(nome); t = t.replace(re, troca); }
  }
  return { texto: t, achados };
}

/* ---------- 3. IDEIA JÁ EXISTENTE ---------------------------------
   Item que a AEVO cobra: apontar se já existe algo próximo antes de
   abrir mais um projeto. Comparação por palavras em comum. */
const VAZIAS = new Set(['a','o','as','os','de','da','do','das','dos','e','em','no','na','nos','nas','um','uma','para','pra','por','com','que','se','ao','à','é','ser','tem','mais','muito','já','pode','dava','gente','hoje','isso','todo','toda','fim','ainda']);



/* ---------- 4. MOTORES DE ANÁLISE ---------------------------------- */
let ultimoMotor = 'local';

const INSTRUCAO = `Você é um analista de ESG que trabalha em indústria brasileira e conversa com quem opera a máquina, não com consultor.

Receberá a ideia de um colaborador, escrita de forma informal e possivelmente com erro de português. Devolva uma análise ESG.

REGRAS
- Português do Brasil, direto, sem jargão. Se usar termo técnico, explique na mesma frase.
- Classifique em uma ou mais dimensões: E (Ambiental), S (Social), G (Governança). Só inclua a dimensão que estiver de fato presente. Melhor uma dimensão certa que três forçadas.
- Pense com generosidade antes de dizer que não há ligação ESG — mas a mesma generosidade vale pras três dimensões, não só pra Ambiental: reduzir plástico descartável ou trocar copo por caneca já é E; um colega relatando risco de acidente ou dificuldade de acesso já é S; um procedimento sem padronização ou um registro que hoje só existe na memória de alguém já é G. Nenhuma das três precisa da pessoa usar o termo técnico. Só devolva "dimensoes" vazio quando a ideia realmente não tiver nenhum ângulo E, S ou G plausível (ex.: pedido de cadeira mais confortável, sem nenhuma leitura ESG honesta) — nesse caso não invente enquadramento.
- Citar um EQUIPAMENTO, SALA ou INSTALAÇÃO, sozinho, não é sinal de nenhuma dimensão ainda — é só o cenário. "A sala elétrica" sem mais nada não vira Ambiental por causa da palavra "elétrica": isso só vira E se o que preocupa é gasto/consumo de energia; vira S se o que preocupa é segurança de quem trabalha perto (choque, fiação exposta, sinalização); vira G se o que preocupa é processo, acesso ou registro (quem entra, como é controlado, o que falta documentar). Se a pessoa não disse ainda O QUE muda ou O QUE preocupa naquele lugar, isso é motivo pra perguntar antes de classificar — não pra supor a leitura mais óbvia (geralmente Ambiental) e seguir em frente.
- Indicadores precisam ter unidade: "m³ de água economizados por mês", não "melhoria no uso de água".
- Próximos passos: exatamente 5, em ordem de execução, cada um uma ação que o colaborador ou a área dele executa — da medição inicial até a implementação com acompanhamento, não conselho genérico. Ao citar um setor/área dentro de uma frase (não como item de lista solto), sempre com uma palavra de ligação — "levar para o setor responsável por Manutenção", nunca "levar para Manutenção" sozinho, que lê como se a ideia fosse entregue à palavra em si, não a quem trabalha lá.
- Riscos são obstáculos reais de fábrica brasileira: licença ambiental, norma regulamentadora, adesão do time, custo de parada.
- Nível: ALTO quando há ganho claro e mensurável; MÉDIO quando depende de validação; BAIXO quando a descrição ainda está vaga.
- Encaminhamento é a frase que fecha a análise: diz para quem a ideia vai e o que essa pessoa faz com ela. Não repita os próximos passos — diga o destino formal, não mais uma tarefa. Mesma regra de citar setor: "leve para o setor responsável por X", nunca "leve para X" sozinho.
- Lucro conecta a ideia ao resultado financeiro da empresa, sempre mostrando por mês E em 12 meses — não uma frase solta, o cálculo. Ordem de preferência, do dado mais confiável para o mais fraco:
  (1) a pessoa deu QUANTIDADE + PREÇO UNITÁRIO do mesmo item ("200 copos por dia, cada um custa R$0,20"): multiplique quantidade × preço = valor da ocorrência; converta a ocorrência para mensal conforme o período dito (por dia ×30, por semana ×4,33, por mês ×1, por ano ÷12); o resultado ×12 dá o valor de 12 meses. Refaça a conta mentalmente antes de responder — é a fonte de erro mais comum. Este é o número mais confiável que existe, mais até que a referência de tarifa abaixo: é o preço que a própria empresa paga.
  (2) a pessoa já citou um valor total em reais ("gastamos 10 mil por mês de energia"): use o número dela, converta o período para mensal e multiplique por 12.
  (3) a pessoa deu só uma quantidade sem preço: calcule pela referência de tarifa abaixo e deixe claro que é estimativa, não conta real.
  (4) sem número nenhum: cite só a faixa como escala, sem calcular nada.
  Nunca invente quantidade, preço ou valor que a pessoa não disse — nos casos (1)-(3) mostre o cálculo (dia/mês → 12 meses), no (4) não. Depois de calcular, deixe explícito que o valor é economia (custo que deixa de sair do caixa), não lucro líquido contábil — as duas coisas pesam igual no caixa, mas não são a mesma linha contábil; se a empresa tiver custo de implementação informado, subtraia-o do valor de 12 meses antes de chamar de benefício líquido. Se faltar um dado essencial para o cálculo, diga isso explicitamente em vez de estimar por cima de uma suposição.
  Referências médias do ES (só para o caso 3, nunca some estas faixas às contas dos casos 1 e 2): água R$10 a R$20 por m³ (CESAN/ARSP); energia R$0,70 a R$0,80 por kWh em baixa tensão (EDP ES/ANEEL); resíduo não perigoso R$150 a R$500 por tonelada (mercado 2026); hora de trabalho cerca de R$18, já com encargos (salário médio do ES no Novo CAGED/MTE) — serve para ideias de ergonomia, segurança, retrabalho e tempo perdido, contando 8h por dia de afastamento.
- lucroValorAnual é o valor numérico de 12 meses em reais, SEM formatação (ex.: 14400, não "R$ 14.400"), preenchido apenas nos casos (1) e (2) acima — nunca a partir da referência de tarifa do caso (3), porque aí é estimativa nossa, não conta da empresa. Sem número real dos casos (1)/(2), devolva null. Este campo alimenta o ranking do painel, então um número inventado aqui distorce a comparação entre ideias — em caso de dúvida, null.

Antes de responder, uma checagem final: cada número no JSON (indicadores, lucro, lucroValorAnual) tem que rastrear até algo que a pessoa escreveu ou até uma das referências médias citadas acima — nunca até um palpite. "Não há dados suficientes para calcular" é uma resposta válida e melhor que um número inventado.

Responda SOMENTE com JSON válido, sem markdown e sem texto fora do objeto:
{"titulo":"até 60 caracteres","dimensoes":["E"],"justificativas":[{"dim":"E","texto":"1 a 2 frases"}],"beneficios":["até 4"],"indicadores":["até 3, com unidade"],"areas":["até 3"],"riscos":["até 3"],"nivel":"ALTO","passos":["exatamente 5"],"encaminhamento":"1 frase","lucro":"2 a 4 frases com o cálculo mês e 12 meses quando houver dado, e a nota de economia-vs-lucro","lucroValorAnual":14400}`;

/** Tira crases de markdown caso o modelo embrulhe o JSON. */
function extrairJSON(bruto){
  const limpo = String(bruto).replace(/```json/gi,'').replace(/```/g,'').trim();
  const i = limpo.indexOf('{'), f = limpo.lastIndexOf('}');
  if (i === -1 || f === -1) throw new Error('o modelo não devolveu JSON');
  return JSON.parse(limpo.slice(i, f + 1));
}

/* Tempo limite: numa apresentação ao vivo, esperar 30 segundos por uma
   resposta é pior do que entregar a análise local em 1. Passou de 8s,
   aborta e o próximo motor assume. */
const LIMITE_MS = 5000;

/* DISJUNTOR — o item mais importante para a demonstração ao vivo.
   Internet desligada falha em milissegundos (o fetch rejeita na hora),
   mas wi-fi congestionado — sala cheia, todo mundo no mesmo ponto de
   acesso — pendura cada requisição até estourar o tempo limite. Sem
   isto, TODA ideia paga o pior caso de novo: 8s por pergunta e 16s na
   análise, ~32s de tela parada por ideia, num pitch de 180s.

   Depois que todos os motores de rede falharem uma vez, assume que a
   rede não está confiável nesta sessão e vai direto para o motor
   local, que responde instantâneo. Recarregar a página zera — mas
   durante a apresentação, previsível vale mais que perfeito. */
let iaIndisponivel = false;

function marcarIaIndisponivel(){
  if (!iaIndisponivel){
    iaIndisponivel = true;
    console.warn('Rede instável: passando a usar só o motor local nesta sessão.');
  }
}

function comTempoLimite(ms){
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, pronto: () => clearTimeout(t) };
}

/* Percorre as chaves de um motor. Cota esgotada devolve HTTP 429 na
   hora (não é timeout), então trocar de chave custa milissegundos.
   Só faz sentido se as chaves forem de CONTAS diferentes — a cota do
   Gemini é por conta, não por chave. */
function chavesDe(nomeMotor){
  const lista = nomeMotor === 'gemini' ? CONFIG.GEMINI_API_KEYS : CONFIG.GROQ_API_KEYS;
  return (Array.isArray(lista) ? lista : []).filter(c => typeof c === 'string' && c.trim());
}

async function tentarComCadaChave(nomeMotor, fn, arg){
  const chaves = chavesDe(nomeMotor);
  if (!chaves.length) throw new Error('sem chave do ' + nomeMotor);
  let ultimoErro;
  for (const chave of chaves){
    try {
      return await fn(arg, chave);
    } catch(e){
      ultimoErro = e;
      console.warn(nomeMotor + ': chave falhou (' + e.message + ')');
    }
  }
  throw ultimoErro;
}

async function analisarComGemini(texto, chave){

  const t = comTempoLimite(LIMITE_MS);
  let r;
  try {
    r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODELO}:generateContent`,
      {
        method:'POST', signal: t.signal,
        headers:{ 'Content-Type':'application/json', 'X-goog-api-key': chave },
        body: JSON.stringify({
          systemInstruction:{ parts:[{ text: INSTRUCAO }] },
          contents:[{ parts:[{ text:'Ideia do colaborador:\n\n' + texto }] }],
          generationConfig:{ temperature:0.3, responseMimeType:'application/json', maxOutputTokens:900 }
        })
      }
    );
  } finally { t.pronto(); }
  if (!r.ok) throw new Error('Gemini respondeu ' + r.status);
  const d = await r.json();
  const txt = d.candidates && d.candidates[0].content.parts[0].text;
  if (!txt) throw new Error('Gemini devolveu resposta vazia');
  return normalizar(extrairJSON(txt));
}

async function analisarComGroq(texto, chave){

  const t = comTempoLimite(LIMITE_MS);
  let r;
  try {
    r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:'POST', signal: t.signal,
    headers:{ 'Content-Type':'application/json', Authorization:'Bearer ' + chave },
    body: JSON.stringify({
      model: CONFIG.GROQ_MODELO,
      temperature:0.3, max_tokens:1200,
      response_format:{ type:'json_object' },
      messages:[
        { role:'system', content: INSTRUCAO },
        { role:'user', content:'Ideia do colaborador:\n\n' + texto }
      ]
    })
    });
  } finally { t.pronto(); }
  if (!r.ok) throw new Error('Groq respondeu ' + r.status);
  const d = await r.json();
  return normalizar(extrairJSON(d.choices[0].message.content));
}

/* Pergunta de acompanhamento não é mais fixa — é gerada pela IA em
   cima do que a pessoa já contou, pra cada ideia ficar com pergunta
   diferente em vez das duas mesmas de sempre. Chamada leve (texto
   puro, sem o JSON grande da análise) e com tempo bem mais curto que
   a análise: é só uma linha de chat, não pode travar a conversa. */
const LIMITE_PERGUNTA_MS = 2500;

async function perguntarGemini(prompt, chave){
  const t = comTempoLimite(LIMITE_PERGUNTA_MS);
  let r;
  try {
    r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODELO}:generateContent`,
      {
        method:'POST', signal: t.signal,
        headers:{ 'Content-Type':'application/json', 'X-goog-api-key': chave },
        body: JSON.stringify({
          contents:[{ parts:[{ text: prompt }] }],
          generationConfig:{ temperature:0.5, maxOutputTokens:80 }
        })
      }
    );
  } finally { t.pronto(); }
  if (!r.ok) throw new Error('Gemini respondeu ' + r.status);
  const d = await r.json();
  const txt = d.candidates && d.candidates[0].content.parts[0].text;
  if (!txt) throw new Error('Gemini devolveu resposta vazia');
  return txt;
}

async function perguntarGroq(prompt, chave){
  const t = comTempoLimite(LIMITE_PERGUNTA_MS);
  let r;
  try {
    r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST', signal: t.signal,
      headers:{ 'Content-Type':'application/json', Authorization:'Bearer ' + chave },
      body: JSON.stringify({
        model: CONFIG.GROQ_MODELO,
        temperature:0.5, max_tokens:80,
        messages:[{ role:'user', content: prompt }]
      })
    });
  } finally { t.pronto(); }
  if (!r.ok) throw new Error('Groq respondeu ' + r.status);
  const d = await r.json();
  const txt = d.choices && d.choices[0].message.content;
  if (!txt) throw new Error('Groq devolveu resposta vazia');
  return txt;
}

/* Tenta os dois motores de IA, na mesma ordem da análise completa.
   Devolve null (nunca lança erro) se os dois falharem — quem chama
   cai pra pergunta local, igual ao plano B da análise. */
/* Modelo de linguagem não obedece formato 100% das vezes: mesmo
   mandando "responda só com a pergunta", às vezes volta com aspas em
   volta, markdown (**Pergunta:**), numeração, um "Claro! Aqui está:"
   na frente, ou uma explicação depois. Qualquer um desses aparecendo
   no chat no meio do pitch parece amador. Devolve null quando não
   sobra uma pergunta utilizável — aí quem chama usa o plano B local. */
function limparPergunta(bruto){
  if (!bruto) return null;

  const linhas = String(bruto)
    .split('\n')
    .map(l => l
      .replace(/\*\*/g, '')                    // negrito do markdown
      .replace(/^\s*[-*•]\s+/, '')             // marcador de lista
      .replace(/^\s*\d+[.)]\s+/, '')           // numeração
      .replace(/^\s*(pergunta|resposta)\s*:\s*/i, '')
      .trim())
    .filter(Boolean);

  /* CORREÇÃO 12/08/2026 — "a IA falou 'ideia legal' e não perguntou
     mais nada": antes, quando NENHUMA linha tinha "?" (o modelo só
     elogiou a ideia sem pedir informação nenhuma — acontece), o
     código caía em `linhas[0]` como último recurso e devolvia esse
     texto como se fosse a pergunta. Passava no teste de tamanho (8 a
     160 caracteres — "Ideia legal!" tem 12) e ia direto pro chat via
     falar(), com aguardandoResposta=true — a pessoa via uma frase
     solta na tela e não tinha o que responder, porque não tinha
     pergunta nenhuma ali. Agora, sem nenhuma linha com "?", devolve
     null direto: quem chama (enviar(), em app.js) já cai no plano B
     local (perguntaLocal), que sempre gera uma pergunta de verdade. */
  const linhaComPergunta = linhas.find(l => l.includes('?'));
  if (!linhaComPergunta) return null;

  // Corta o que vier depois do ponto de interrogação
  let escolhida = linhaComPergunta;
  const fim = escolhida.indexOf('?');
  if (fim !== -1) escolhida = escolhida.slice(0, fim + 1);

  escolhida = escolhida.replace(/^["'“”']+|["'“”']+$/g, '').trim();

  // Sobrou algo estranho (vazio, ou um parágrafo em vez de pergunta)
  if (escolhida.length < 8 || escolhida.length > 160) return null;
  return escolhida;
}

async function perguntaPersonalizada(rascunho, jaFeitas){
  const prompt = `Você é um copiloto ESG conversando com um colaborador de indústria brasileira sobre uma ideia de melhoria, em português informal.

O que a pessoa já contou até agora:
"${rascunho}"
${jaFeitas.length ? '\nVocê já perguntou: ' + jaFeitas.map(p => '"' + p + '"').join(' e ') + '. NÃO repita isso, e conta como repetição pedir a MESMA informação com outras palavras — se já perguntou "onde isso acontece" e a resposta ainda não veio, pergunte outra coisa (tamanho, o que muda, quem é afetado), não reformule a mesma pergunta de novo.' : ''}

Gere UMA pergunta curta de acompanhamento, específica pra essa ideia. Antes de perguntar tamanho ou número, cheque se já dá pra saber POR QUE aquilo é um problema — o que incomoda ali (gasto de recurso? risco pra quem trabalha perto? falta de controle/registro?). Se a pessoa só citou um lugar ou equipamento sem dizer o que quer mudar nele (ex.: "a sala elétrica", sem mais nada), pergunte isso primeiro — não presuma de cara que é sobre consumo de energia, sobre segurança, ou sobre qualquer outro ângulo específico; deixe a pessoa dizer qual é a preocupação real dela, em vez de você adivinhar e formular uma pergunta técnica (kWh, voltagem, m³...) sobre um ângulo que ela ainda nem confirmou. Só peça tamanho/número quando o que está em jogo já estiver claro. Responda só com a pergunta — sem aspas, sem numeração, sem explicação antes ou depois.`;

  // Compartilha o disjuntor com a análise: se a rede já provou estar
  // ruim, a pergunta não repete a espera — vai direto pro plano B.
  if (iaIndisponivel) return null;

  const tentativas = { gemini: perguntarGemini, groq: perguntarGroq };
  for (const nome of (CONFIG.ORDEM || [])){
    const fn = tentativas[nome];
    if (!fn) continue;
    try {
      const resposta = limparPergunta(await tentarComCadaChave(nome, fn, prompt));
      if (resposta) return resposta;
    } catch(e){
      console.warn('Pergunta personalizada falhou em ' + nome + ':', e.message);
    }
  }
  marcarIaIndisponivel();
  return null;
}

/** Garante que todo campo existe e tem o tipo certo, para a tela nunca quebrar. */
function normalizar(a){
  const lista = v => Array.isArray(v) ? v.filter(x => typeof x === 'string' && x.trim()) : [];
  const niveis = ['ALTO','MÉDIO','BAIXO'];

  /* lucroValorAnual vem de um modelo de linguagem fazendo conta — a
     mesma checagem de faixa plausível que motor-local.js já usa em
     todo valor calculado (1 a 50 milhões, mesmo limite de
     extrairDinheiro/extrairQuantidade lá) serve de rede de segurança
     aqui: um número fora disso é descartado (vira null) em vez de
     entrar no ranking do painel e distorcer a comparação entre
     ideias. Não impede o modelo de errar o valor DENTRO da faixa
     plausível — isso é o que os exemplos e a checagem final no
     INSTRUCAO tentam reduzir — só evita um absurdo óbvio (zero,
     negativo, string, ou um número maior que qualquer conta real de
     chão de fábrica) de passar adiante. */
  const valorBruto = Number(a.lucroValorAnual);
  const lucroValorAnual = (isFinite(valorBruto) && valorBruto >= 1 && valorBruto <= 50000000) ? valorBruto : null;

  return {
    titulo: String(a.titulo || 'Ideia sem título').slice(0,80),
    dimensoes: lista(a.dimensoes).map(d=>d.toUpperCase()).filter(d=>['E','S','G'].includes(d)),
    justificativas: Array.isArray(a.justificativas)
      ? a.justificativas.filter(j=>j && j.texto).map(j=>({ dim:String(j.dim||'—').toUpperCase(), texto:String(j.texto) }))
      : [],
    beneficios: lista(a.beneficios).slice(0,4),
    indicadores: lista(a.indicadores).slice(0,3),
    areas: lista(a.areas).slice(0,3),
    riscos: lista(a.riscos).slice(0,3),
    nivel: niveis.includes(String(a.nivel).toUpperCase()) ? String(a.nivel).toUpperCase() : 'MÉDIO',
    passos: lista(a.passos).slice(0,5),
    encaminhamento: String(a.encaminhamento || '').trim(),
    lucro: String(a.lucro || '').trim(),
    lucroValorAnual
  };
}

/* Tenta os motores na ordem do config.js e cai na triagem local se
   todos falharem. A demonstração nunca fica sem resposta. */
async function analisarIdeia(texto){
  if (!iaIndisponivel){
    const tentativas = { gemini: analisarComGemini, groq: analisarComGroq };
    for (const nome of (CONFIG.ORDEM || [])){
      const fn = tentativas[nome];
      if (!fn) continue;
      try {
        const r = await tentarComCadaChave(nome, fn, texto);
        r.motor = nome;
        r.ods = odsPorTexto(texto, r.dimensoes);
        ultimoMotor = 'ia';
        return r;
      } catch(e){
        console.warn('Motor ' + nome + ' falhou:', e.message);
      }
    }
    // chegou aqui = todos os motores de rede falharam
    marcarIaIndisponivel();
  }
  ultimoMotor = 'local';
  return triagemLocal(texto);
}

/* ---------- 5. CONVERSA -------------------------------------------- */
const fluxo    = document.getElementById('fluxo');
const campo    = document.getElementById('texto');
const btEnviar = document.getElementById('btEnviar');

let rascunho = '';
let perguntasFeitas = 0;
let perguntasJaFeitas = [];

/* Só continua a mesma ideia se a última fala do copiloto tiver sido uma
   pergunta. Se no meio veio uma mensagem bloqueada ou uma análise, a
   próxima mensagem começa ideia nova — senão duas ideias diferentes
   acabam analisadas como uma só. */
let aguardandoResposta = false;

/* Conta quantas mensagens o filtro barrou antes de qualquer análise —
   ofensa, sem sentido, só cumprimento, vazio ou curto demais. Hoje esse
   trabalho roda invisível; isto só faz ele aparecer no painel. */
let totalFiltradas = 0;
try { totalFiltradas = parseInt(localStorage.getItem('conexoes-esg:filtradas'), 10) || 0; } catch(e){}
function registrarFiltrada(){
  totalFiltradas++;
  try { localStorage.setItem('conexoes-esg:filtradas', String(totalFiltradas)); } catch(e){}
  desenharPainel();
}

// Mínimo de perguntas antes de analisar (garante interação de verdade
// com o colaborador) e teto absoluto (nunca vira interrogatório).
const MIN_PERGUNTAS = 2;
const MAX_PERGUNTAS = 3;

const espera = ms => new Promise(r => setTimeout(r, ms));

/* No desktop o #fluxo tem rolagem própria; no celular quem rola é a
   página inteira. Esta função descobre qual dos dois é o caso. */
function rolarParaFim(elemento){
  if (fluxo.scrollHeight > fluxo.clientHeight + 4){
    fluxo.scrollTop = fluxo.scrollHeight;
  } else if (elemento){
    elemento.scrollIntoView({ block:'nearest', behavior:'smooth' });
  }
}

function falar(texto, quem='ele'){
  const div = document.createElement('div');
  div.className = 'fala ' + quem;
  div.textContent = texto;
  fluxo.appendChild(div);
  rolarParaFim(div);
  return div;
}

function mostrarDigitando(){
  const div = document.createElement('div');
  div.className = 'fala ele digitando';
  div.innerHTML = '<i></i><i></i><i></i>';
  fluxo.appendChild(div);
  rolarParaFim(div);
  return div;
}

async function enviar(){
  /* btEnviar.disabled bloqueia só o clique — o handler da tecla Enter
     chama enviar() direto. Sem esta guarda, apertar Enter durante uma
     análise ou durante a chamada da pergunta passava por cima do
     botão travado. (analisarDireto já tinha a mesma guarda.) */
  if (btEnviar.disabled) return;

  const bruto = campo.value.trim();
  if (!bruto) return;

  campo.value = '';
  campo.style.height = '';
  document.getElementById('exemplos').classList.add('oculto');
  falar(bruto, 'eu');

  // Pergunta sobre o próprio sistema é respondida na hora e não vira
  // ideia. Sem isso, "o que você faz?" recebia "onde isso acontece hoje?".
  const meta = responderSobreOSistema(bruto);
  if (meta){
    const d = mostrarDigitando();
    await espera(140);
    d.remove();
    falar(meta);
    aguardandoResposta = false;
    campo.focus();
    return;
  }

  // Filtro: ofensa e texto sem sentido não entram no rascunho nem são
  // enviados para a IA. Passo aguardandoResposta pra ele saber se isto
  // é resposta a uma pergunta de acompanhamento — "500ml por dia" é
  // curto, mas é exatamente a resposta certa nesse caso.
  const veredito = validarEntrada(bruto, aguardandoResposta);

  /* Texto curto mas legítimo não é recusado com frase pronta: entra no
     rascunho e recebe uma pergunta feita em cima do que ele escreveu.
     É a diferença entre "Preciso de um pouco mais" repetido sempre e
     uma pergunta que mostra que leu a ideia. */
  if (!veredito.ok && veredito.perguntar){
    // limpa aqui mesmo: `seguro` só é calculado mais abaixo no fluxo
    const { texto: limpo } = limpar(bruto);
    rascunho = aguardandoResposta && rascunho ? rascunho + ' ' + limpo : limpo;
    if (!aguardandoResposta){ perguntasFeitas = 0; perguntasJaFeitas = []; }
    btEnviar.disabled = true;
    const d = mostrarDigitando();
    try {
      let p = null;
      try { p = await perguntaPersonalizada(rascunho, perguntasJaFeitas); } catch(e){}
      if (!p) p = perguntaLocal(rascunho, perguntasFeitas, perguntasJaFeitas);
      falar(p);
      perguntasJaFeitas.push(p);
      perguntasFeitas++;
      aguardandoResposta = true;
    } finally {
      d.remove(); btEnviar.disabled = false; campo.focus();
    }
    return;
  }

  if (!veredito.ok){
    registrarFiltrada();
    const d = mostrarDigitando();
    await espera(120);
    d.remove();
    falar(veredito.resposta, veredito.motivo === 'ofensivo' ? 'sistema' : 'ele');
    aguardandoResposta = false;   // quebra o encadeamento com a ideia anterior
    campo.focus();
    return;
  }

  const { texto: seguro, achados } = limpar(bruto);
  if (achados.length){
    falar(`Removi ${achados.join(', ')} do texto antes de analisar. Esse tipo de dado não precisa sair daqui.`, 'sistema');
  }

  if (aguardandoResposta){
    rascunho += ' ' + seguro;
  } else {
    rascunho = seguro; perguntasFeitas = 0; perguntasJaFeitas = [];
    desenharGrafo([]);
  }

  /* "Já chega de pergunta" é conteúdo, não contagem de palavra: as
     MIN_PERGUNTAS sempre são feitas (garante interação de verdade), e
     se depois disso o texto ainda não tiver sinal claro de nenhuma
     dimensão ESG, pergunta mais uma vez em vez de forçar uma análise
     vazia — até MAX_PERGUNTAS, pra nunca virar interrogatório.

     EXCEÇÃO (correção 12/08/2026): se o rascunho já está bem
     detalhado — número, unidade e sinal de dimensão, o mesmo padrão
     dos textos de exemplo do botão de demonstração —, pula direto
     pra análise mesmo com 0 ou 1 pergunta feita. Sem isto, uma ideia
     já completa digitada de uma vez ainda recebia as 2 perguntas
     obrigatórias pedindo informação que a pessoa já tinha dado. */
  const completa = ideiaBemDetalhada(rascunho);
  const faltaPerguntaFixa = !completa && perguntasFeitas < MIN_PERGUNTAS;
  const aindaVagoDemais = !completa && !temSinalSuficiente(rascunho) && perguntasFeitas < MAX_PERGUNTAS;

  if (faltaPerguntaFixa || aindaVagoDemais){
    /* Trava o botão durante a chamada de rede, igual rodarAnalise faz.
       Sem isto, dois cliques rápidos (ou um duplo-toque no celular)
       dentro da janela de até LIMITE_PERGUNTA_MS disparavam duas
       perguntas seguidas e pulavam perguntasFeitas de 0 para 2. */
    btEnviar.disabled = true;
    const d = mostrarDigitando();
    try {
      // Pergunta gerada em cima do que a pessoa já contou, não mais um
      // texto fixo — cada ideia recebe pergunta diferente. Se a IA
      // falhar ou não tiver chave, cai no plano B por tema (motor-local.js).
      let pergunta = null;
      try { pergunta = await perguntaPersonalizada(rascunho, perguntasJaFeitas); }
      catch(e){ console.warn('pergunta personalizada falhou:', e.message); }
      if (!pergunta) pergunta = perguntaLocal(rascunho, perguntasFeitas, perguntasJaFeitas);

      falar(pergunta);
      perguntasJaFeitas.push(pergunta);
      perguntasFeitas++;
      aguardandoResposta = true;
    } finally {
      d.remove();
      btEnviar.disabled = false;
      campo.focus();
    }
    return;
  }

  await rodarAnalise();
}

/* Atalho de demonstração: analisa um texto completo de uma vez, sem o
   fluxo de perguntas, e leva a tela até a ficha. É o que faz um clique
   virar resultado pronto na frente da banca. */
async function analisarDireto(texto){
  if (btEnviar.disabled) return;
  document.getElementById('exemplos').classList.add('oculto');
  falar(texto, 'eu');
  rascunho = texto;
  perguntasFeitas = MIN_PERGUNTAS;
  await rodarAnalise();
  document.getElementById('ficha').scrollIntoView({ behavior:'smooth', block:'start' });
}

async function rodarAnalise(){
  btEnviar.disabled = true;
  const d = mostrarDigitando();

  /* try/finally pelo mesmo motivo do botão de demonstração: se algo
     aqui lançar, sem isto o campo de texto fica travado e o indicador
     de "digitando" não sai mais da tela. */
  try {
    const resultado = await analisarIdeia(rascunho);
    const ideia = Deposito.salvar({ ...resultado, textoOriginal: rascunho, quando: new Date() });

    falar(resumoFalado(ideia));
    desenharGrafo(ideia.dimensoes);
    desenharFicha(ideia);
    desenharPainel();
  } catch(e){
    console.error('Análise falhou:', e);
    falar('Deu um problema ao analisar essa ideia. Pode tentar de novo, ou contar com outras palavras.', 'sistema');
  } finally {
    d.remove();
    aguardandoResposta = false;   // a próxima mensagem é uma ideia nova
    btEnviar.disabled = false;
    campo.focus();
  }
}

function resumoFalado(i){
  if (!i.dimensoes.length){
    return 'Analisei, mas ainda não consigo apontar uma dimensão ESG com honestidade. A ficha ao lado diz o que falta para eu conseguir.';
  }
  const nomes = i.dimensoes.map(l => ({E:'Ambiental',S:'Social',G:'Governança'}[l])).join(' e ');
  return `Analisei. Esta ideia se conecta a ${nomes}, com potencial ${i.nivel.toLowerCase()}. A ficha ao lado tem os benefícios, o que medir e os próximos passos.`;
}

/* ---------- 6. GRAFO DE CONEXÕES ----------------------------------- */
function desenharGrafo(dimensoes){
  for (const letra of ['E','S','G']){
    const fio = document.getElementById('fio-' + letra);
    const no  = document.getElementById('no-' + letra);
    const viva = dimensoes.includes(letra);
    // remove e recoloca a classe para a animação rodar de novo
    fio.classList.remove('viva'); no.classList.remove('viva');
    if (viva){
      void fio.offsetWidth;
      fio.classList.add('viva'); fio.dataset.d = letra;
      no.classList.add('viva');
    }
  }
}

/* ---------- 7. FICHA ------------------------------------------------ */
function escapar(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

const NOME_MOTOR = { gemini:'Gemini', groq:'Groq', local:'triagem local' };

/* Siglas por extenso. O colaborador do chão de fábrica não é obrigado
   a saber o que é SESMT ou MTR, e a ficha vai parar na mão de gente de
   outras áreas. Mantém a sigla e acrescenta o nome — não substitui,
   porque é pela sigla que a pessoa vai procurar depois.

   ODS entra também: o nome que aparece ao lado é o do objetivo
   específico ("Saúde e bem-estar"), não o que a sigla significa. */
const GLOSSARIO = {
  'ODS':    'Objetivos de Desenvolvimento Sustentável, as 17 metas da ONU para 2030',
  'SESMT':  'Serviços Especializados em Engenharia de Segurança e em Medicina do Trabalho',
  'NR-17':  'Norma Regulamentadora de ergonomia',
  'NR-12':  'Norma Regulamentadora de segurança em máquinas e equipamentos',
  'MTR':    'Manifesto de Transporte de Resíduos',
  'LGPD':   'Lei Geral de Proteção de Dados',
  'GHG':    'Greenhouse Gas, protocolo internacional de contagem de emissões',
  'PCD':    'Pessoa com Deficiência',
  'RH':     'Recursos Humanos',
  'TI':     'Tecnologia da Informação',
  'CESAN':  'Companhia Espírito Santense de Saneamento',
  'ARSP':   'Agência de Regulação de Serviços Públicos do Espírito Santo',
  'ANEEL':  'Agência Nacional de Energia Elétrica',
  'ANP':    'Agência Nacional do Petróleo, Gás Natural e Biocombustíveis',
  'CAGED':  'Cadastro Geral de Empregados e Desempregados',
  'MTE':    'Ministério do Trabalho e Emprego',
  'MPS':    'Ministério da Previdência Social',
  'MF':     'Ministério da Fazenda'
};

/* Expande a PRIMEIRA aparição de cada sigla na ficha. Da segunda em
   diante fica só a sigla, senão o texto vira ladainha — a pessoa já
   foi apresentada ao nome uma vez. O conjunto `vistas` guarda isso e
   reinicia a cada ficha desenhada. */
function expandirSiglas(texto, vistas){
  if (!texto) return texto;
  let saida = String(texto);
  // maiores primeiro, pra "NR-17" não ser partido por uma sigla menor
  const siglas = Object.keys(GLOSSARIO).sort((a, b) => b.length - a.length);
  for (const sigla of siglas){
    if (vistas.has(sigla)) continue;
    const re = new RegExp('\\b' + sigla.replace(/[-/]/g, '\\$&') + '\\b');
    const achou = re.exec(saida);
    if (!achou) continue;

    /* Se a sigla já está dentro de parênteses — "(NR-17)" — usa vírgula
       em vez de abrir outro par, senão sai "(NR-17 (Norma...))". */
    const antes = saida.slice(0, achou.index);
    const dentroDeParenteses = antes.lastIndexOf('(') > antes.lastIndexOf(')');
    const nome = GLOSSARIO[sigla];
    saida = saida.replace(re, dentroDeParenteses
      ? sigla + ', ' + nome
      : sigla + ' (' + nome + ')');
    vistas.add(sigla);
  }
  return saida;
}

function desenharFicha(i){
  const marcas = i.nivel === 'ALTO' ? 5 : i.nivel === 'MÉDIO' ? 3 : 1;
  /* `vistas` é por ficha: cada sigla ganha o nome por extenso na
     primeira vez que aparece nesta ficha, e só nela. */
  const vistas = new Set();
  const sig = x => escapar(expandirSiglas(x, vistas));
  const lista = arr => arr.map(x => `<li>${sig(x)}</li>`).join('');
  const ods = i.ods || [];

  document.getElementById('corpoFicha').innerHTML = `
  <div class="placa">
    <span class="eti">${escapar(i.id)} · ${escapar(NOME_MOTOR[i.motor] || 'triagem local')}</span>
    <p class="tit-ideia">${escapar(i.titulo)}</p>

    <div class="medidor" data-n="${i.nivel}">
      <div class="topo"><span class="eti">Potencial ESG</span><span class="valor">${i.nivel}</span></div>
      <div class="escala">${[1,2,3,4,5].map(n=>`<i data-on="${n<=marcas?1:0}"></i>`).join('')}</div>
    </div>

    <div class="secao">
      <h3>Por que se conecta</h3>
      ${i.justificativas.map(j=>`
        <div class="porque" data-d="${escapar(j.dim)}"><b>${escapar(j.dim)}</b> — ${sig(j.texto)}</div>`).join('')}
    </div>

    ${ods.length ? `
    <div class="secao">
      <h3>Objetivos da ONU alcançados</h3>
      <div class="pilulas">${ods.map(o=>`<span class="pilula">ODS ${o.n} · ${escapar(o.nome)}</span>`).join('')}</div>
    </div>` : ''}

    ${i.beneficios.length ? `<div class="secao"><h3>O que se ganha</h3><ul>${lista(i.beneficios)}</ul></div>` : ''}
    ${i.indicadores.length ? `<div class="secao"><h3>Como medir</h3><ul>${lista(i.indicadores)}</ul></div>` : ''}

    <div class="secao">
      <h3>Próximos passos</h3>
      ${i.passos.map((p,n)=>`<div class="passo"><span class="n">${n+1}</span><span>${sig(p)}</span></div>`).join('')}
    </div>

    ${i.areas.length ? `<div class="secao so-completo"><h3>Quem precisa entrar</h3>
      <div class="pilulas">${i.areas.map(a=>`<span class="pilula">${sig(a)}</span>`).join('')}</div></div>` : ''}
    ${i.riscos.length ? `<div class="secao so-completo"><h3>Pontos de atenção</h3><ul>${lista(i.riscos)}</ul></div>` : ''}

    ${i.lucro ? `
    <div class="destino lucro">
      <b>Lucro pra empresa</b>
      ${sig(i.lucro)}
    </div>` : ''}

    ${i.encaminhamento ? `
    <div class="destino">
      <b>Para onde vai</b>
      ${sig(i.encaminhamento)}
    </div>` : ''}
  </div>
  <div class="rodape-ficha">
    <button class="bt vazado" id="btNova">Analisar outra ideia</button>
    <button class="bt vazado" id="btCopiar">Copiar resumo</button>
  </div>`;

  document.getElementById('btNova').onclick = novaIdeia;
  document.getElementById('btCopiar').onclick = () => copiarResumo(i);
}

/* Texto pronto pra colar em qualquer lugar — e-mail, chat interno, ou
   direto no funil real da AEVO (Ideia → Projeto). Só entram as seções
   que a ideia realmente tem, igual a ficha na tela. */
function resumoTexto(i){
  const vistas = new Set();
  const sig = x => expandirSiglas(x, vistas);
  const linhas = [];
  linhas.push('IDEIA: ' + i.titulo);
  linhas.push('Potencial ESG: ' + i.nivel);

  if (i.justificativas.length){
    linhas.push('');
    linhas.push('Por que se conecta:');
    i.justificativas.forEach(j => linhas.push('- ' + j.dim + ' — ' + sig(j.texto)));
  }
  if (i.ods && i.ods.length){
    linhas.push('');
    linhas.push('ODS alcançados: ' + i.ods.map(o => 'ODS ' + o.n + ' · ' + o.nome).join(', '));
  }
  if (i.beneficios.length){
    linhas.push('');
    linhas.push('O que se ganha:');
    i.beneficios.forEach(b => linhas.push('- ' + sig(b)));
  }
  if (i.indicadores.length){
    linhas.push('');
    linhas.push('Como medir:');
    i.indicadores.forEach(x => linhas.push('- ' + sig(x)));
  }
  if (i.passos.length){
    linhas.push('');
    linhas.push('Próximos passos:');
    i.passos.forEach((p,n) => linhas.push((n+1) + '. ' + sig(p)));
  }
  if (i.areas.length){
    linhas.push('');
    linhas.push('Quem precisa entrar: ' + i.areas.map(sig).join(', '));
  }
  if (i.riscos.length){
    linhas.push('');
    linhas.push('Pontos de atenção:');
    i.riscos.forEach(r => linhas.push('- ' + sig(r)));
  }
  if (i.lucro){
    linhas.push('');
    linhas.push('Lucro pra empresa: ' + sig(i.lucro));
  }
  if (i.encaminhamento){
    linhas.push('');
    linhas.push('Para onde vai: ' + sig(i.encaminhamento));
  }

  linhas.push('');
  linhas.push('— Analisado pelo Conexões ESG · InovaHACK SENAI Porto 2026 · ' + i.id);
  return linhas.join('\n');
}

/* navigator.clipboard exige contexto seguro (https ou localhost). Se a
   página for aberta direto como arquivo (file://), ele pode nem
   existir — por isso o if abaixo, pra nunca quebrar a tela por causa
   de um botão de apoio. */
function copiarResumo(i){
  const botao = document.getElementById('btCopiar');
  const rotulo = botao.textContent;

  function avisar(msg){
    botao.textContent = msg;
    botao.disabled = true;
    setTimeout(() => { botao.textContent = rotulo; botao.disabled = false; }, 1800);
  }

  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(resumoTexto(i)).then(
      () => avisar('Copiado ✓'),
      () => avisar('Não deu pra copiar')
    );
  } else {
    avisar('Não deu pra copiar');
  }
}

function novaIdeia(){
  rascunho = ''; perguntasFeitas = 0; perguntasJaFeitas = []; aguardandoResposta = false;
  desenharGrafo([]);
  trocarAba('conversa');
  falar('Manda a próxima ideia.');
  campo.focus();
}

/* ---------- 8. RANKING DE OPORTUNIDADES -----------------------------
   Pedido da equipe depois de ver o painel: além de listar as ideias,
   apontar qual é a melhor em cada frente — igual ao painel do
   Netflixy que serviu de referência (🏆 melhor oportunidade, 💰 maior
   potencial financeiro, 🌱/👥/🏛️ maior impacto por pilar, ⚙️ mais
   fácil de implementar).

   Cada categoria usa só campo que a ideia JÁ TEM de verdade — nivel,
   dimensoes, riscos, areas, lucroValorAnual (a correção acima) — não
   pede nem inventa nenhum dado novo. "Melhor oportunidade" não é só
   a ideia mais cara: soma nível + alcance ESG + valor financeiro (com
   teto, pra um valor gigante não dominar sozinho) e SUBTRAI risco —
   é a mesma regra do documento de referência ("não escolha
   automaticamente a ideia com maior impacto financeiro"). Ficou de
   fora "melhor custo-benefício": exigiria um valor de investimento
   que a ideia não tem — mostrar isso seria inventar um número. */
const PESO_NIVEL = { ALTO:3, 'MÉDIO':2, BAIXO:1 };

/** Maior pontuação entre as ideias; pontuar() pode devolver null para excluir uma ideia da categoria. */
function melhorPor(ideias, pontuar){
  let vencedora = null, melhorPontos = -Infinity;
  for (const i of ideias){
    const p = pontuar(i);
    if (p === null || p === undefined || !isFinite(p)) continue;
    if (p > melhorPontos){ melhorPontos = p; vencedora = i; }
  }
  return vencedora;
}

function pontuarOportunidade(i){
  let p = (PESO_NIVEL[i.nivel] || 1) * 10;
  p += i.dimensoes.length * 3;
  if (i.lucroValorAnual) p += Math.min(i.lucroValorAnual / 1000, 15);
  p -= (i.riscos ? i.riscos.length : 0) * 1.5;
  return p;
}

const fmtMoeda = v => v.toLocaleString('pt-BR', { minimumFractionDigits:0, maximumFractionDigits:0 });

function calcularRanking(ideias){
  if (!ideias.length) return [];
  const cartoes = [];

  const oportunidade = melhorPor(ideias, pontuarOportunidade);
  if (oportunidade) cartoes.push({ emoji:'🏆', rotulo:'Melhor oportunidade', ideia:oportunidade,
    detalhe:`Potencial ${oportunidade.nivel.toLowerCase()} · ${oportunidade.dimensoes.join('+') || 'sem dimensão definida'}` });

  const financeira = melhorPor(ideias, i => i.lucroValorAnual || null);
  if (financeira) cartoes.push({ emoji:'💰', rotulo:'Maior potencial financeiro', ideia:financeira,
    detalhe:`R$ ${fmtMoeda(financeira.lucroValorAnual)} em 12 meses` });

  const porDimensao = (letra) => melhorPor(ideias.filter(i => i.dimensoes.includes(letra)), i => PESO_NIVEL[i.nivel] || 1);
  const ambiental = porDimensao('E');
  if (ambiental) cartoes.push({ emoji:'🌱', rotulo:'Maior impacto ambiental', ideia:ambiental, detalhe:`Potencial ${ambiental.nivel.toLowerCase()}` });
  const social = porDimensao('S');
  if (social) cartoes.push({ emoji:'👥', rotulo:'Maior impacto social', ideia:social, detalhe:`Potencial ${social.nivel.toLowerCase()}` });
  const governanca = porDimensao('G');
  if (governanca) cartoes.push({ emoji:'🏛️', rotulo:'Maior impacto de governança', ideia:governanca, detalhe:`Potencial ${governanca.nivel.toLowerCase()}` });

  const facil = melhorPor(ideias, i => -((i.riscos ? i.riscos.length : 0) + (i.areas ? i.areas.length : 0)));
  if (facil) cartoes.push({ emoji:'⚙️', rotulo:'Mais fácil de implementar', ideia:facil,
    detalhe:`${facil.areas ? facil.areas.length : 0} área(s) envolvida(s) · ${facil.riscos ? facil.riscos.length : 0} ponto(s) de atenção` });

  return cartoes;
}

function desenharRanking(ideias){
  const caixa = document.getElementById('ranking');
  const cartoes = calcularRanking(ideias);
  if (!cartoes.length){ caixa.innerHTML = ''; caixa.classList.add('oculto'); return; }
  caixa.classList.remove('oculto');
  caixa.innerHTML = cartoes.map(c => `
    <div class="card-rank clicavel" data-id="${escapar(c.ideia.id)}">
      <span class="rot">${c.emoji} ${escapar(c.rotulo)}</span>
      <span class="tit">${escapar(c.ideia.titulo)}</span>
      <span class="det">${escapar(c.detalhe)}</span>
    </div>`).join('');
  caixa.querySelectorAll('.card-rank').forEach(el => {
    el.onclick = () => abrirIdeia(el.dataset.id);
  });
}

/* ---------- 9. PAINEL GERENCIAL ------------------------------------ */
function desenharPainel(){
  const todas = Deposito.todas();
  document.getElementById('qtdIdeias').textContent = todas.length;

  const conta = l => todas.filter(i => i.dimensoes.includes(l)).length;
  const altas = todas.filter(i => i.nivel === 'ALTO').length;

  document.getElementById('numeros').innerHTML = `
    <div class="numero"><div class="n">${todas.length}</div><div class="r">ideias analisadas</div></div>
    <div class="numero" data-d="E"><div class="n">${conta('E')}</div><div class="r">E · Ambiental</div></div>
    <div class="numero" data-d="S"><div class="n">${conta('S')}</div><div class="r">S · Social</div></div>
    <div class="numero" data-d="G"><div class="n">${conta('G')}</div><div class="r">G · Governança</div></div>
    <div class="numero" data-d="alto"><div class="n">${altas}</div><div class="r">potencial alto</div></div>
    <div class="numero"><div class="n">${totalFiltradas}</div><div class="r">barradas pelo filtro</div></div>`;

  desenharRanking(todas);

  const btLimpar = document.getElementById('btLimpar');
  btLimpar.classList.toggle('oculto', !todas.length);

  const corpo = document.getElementById('tabelaIdeias');
  if (!todas.length){
    corpo.innerHTML = `<tr><td class="principal" colspan="4" style="color:var(--fraco);padding:26px 4px">
      Nenhuma ideia ainda. Analise uma na aba Conversa e ela aparece aqui.</td></tr>`;
    return;
  }

  const ordem = { ALTO:3, 'MÉDIO':2, BAIXO:1 };
  corpo.innerHTML = Deposito.listar()
    .sort((a,b) => ordem[b.nivel] - ordem[a.nivel])
    .map(i => `
      <tr class="clicavel" data-id="${escapar(i.id)}">
        <td class="principal"><strong>${escapar(i.titulo)}</strong><br><span class="eti">${escapar(i.id)}</span></td>
        <td data-rotulo="Conexões">${i.dimensoes.length ? i.dimensoes.map(l=>`<span class="selo" data-d="${l}">${l}</span>`).join('') : '<span style="color:var(--fraco)">—</span>'}</td>
        <td data-rotulo="Potencial"><span class="nivel" data-n="${i.nivel}">${i.nivel}</span></td>
        <td data-rotulo="Área">${escapar((i.areas && i.areas[0]) || '—')}</td>
      </tr>`).join('');

  corpo.querySelectorAll('tr.clicavel').forEach(tr => {
    tr.onclick = () => abrirIdeia(tr.dataset.id);
  });
}

function abrirIdeia(id){
  const i = Deposito.todas().find(x => x.id === id);
  if (!i) return;
  trocarAba('conversa');
  desenharGrafo(i.dimensoes);
  desenharFicha(i);
}

/* ---------- 10. CONTROLES ------------------------------------------ */
function trocarAba(nome){
  document.querySelectorAll('nav.abas button').forEach(b =>
    b.setAttribute('aria-selected', String(b.dataset.aba === nome)));
  document.getElementById('aba-conversa').classList.toggle('oculto', nome !== 'conversa');
  document.getElementById('aba-painel').classList.toggle('oculto', nome !== 'painel');
}
document.querySelectorAll('nav.abas button').forEach(b => b.onclick = () => trocarAba(b.dataset.aba));

document.getElementById('btFoco').onclick = function(){
  const ligado = document.body.dataset.foco === 'sim';
  document.body.dataset.foco = ligado ? 'nao' : 'sim';
  this.setAttribute('aria-pressed', String(!ligado));
};

document.getElementById('btLimpar').onclick = () => {
  if (!confirm('Apagar todas as ideias do painel?')) return;
  Deposito.apagarTudo();
  /* Zera também o contador de mensagens barradas: sem isto o painel
     ficava incoerente depois de limpar — "0 ideias" ao lado de "7
     barradas pelo filtro", sobra do ensaio. */
  totalFiltradas = 0;
  try { localStorage.removeItem('conexoes-esg:filtradas'); } catch(e){}
  /* Traz de volta o botão de demonstração. Ele se esconde depois de
     usado (o painel já está cheio, a função dele acabou), mas se a
     equipe ensaia, limpa e vai apresentar, precisa dele de novo — e
     antes disso a única saída era recarregar a página. */
  restaurarBotaoDemo();
  desenharPainel();
};

/* ---------- 11. ENTRADA E ABERTURA --------------------------------- */
btEnviar.onclick = enviar;
campo.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); enviar(); }
});
campo.addEventListener('input', function(){
  this.style.height = 'auto';
  this.style.height = Math.max(50, Math.min(this.scrollHeight + 2, 140)) + 'px';
});

/* Textos completos de propósito: já trazem o número e o detalhe, então
   a análise sai direto, sem o copiloto pedir mais informação. É o que
   permite demonstrar o resultado num clique só. */
const EXEMPLOS = [
  { curto:'Reuso da água das injetoras',
    completo:'Hoje a gente joga fora a água do resfriamento das injetoras, uns 800 litros por dia. Dava pra reusar na limpeza do pátio — passa por separador de óleo antes.' },
  { curto:'Caixas de 20 kg na expedição',
    completo:'O pessoal da expedição levanta caixa de 20 kg do chão o dia todo. Ano passado teve gente afastada 15 dias por dor na coluna. Uma mesa elevatória resolvia.' },
  { curto:'Parada de máquina sem registro',
    completo:'Cada turno anota a parada de máquina num caderno diferente. A gente perde umas 4 horas por semana só juntando isso pra fechar o relatório. Um registro único no sistema resolvia.' }
];

const caixaEx = document.getElementById('exemplos');
EXEMPLOS.forEach(ex => {
  const b = document.createElement('button');
  b.textContent = ex.curto;
  b.title = ex.completo;
  b.onclick = () => analisarDireto(ex.completo);
  caixaEx.appendChild(b);
});

/* Enche o painel gerencial de uma vez. O edital dá 3 minutos de pitch:
   não sobra tempo para digitar três ideias na frente da banca só para a
   tela de gestão não aparecer vazia. */
const btDemo = document.createElement('button');
btDemo.className = 'bt-demo';
btDemo.textContent = 'Rodar demonstração completa';
btDemo.onclick = async () => {
  btDemo.disabled = true;
  btDemo.textContent = 'Analisando as três…';
  btEnviar.disabled = true;
  document.getElementById('exemplos').classList.add('oculto');

  /* As três chamadas saem juntas, não em fila. Em fila a espera era a
     soma das três; assim é a da mais lenta. */
  EXEMPLOS.forEach(ex => falar(ex.completo, 'eu'));
  const digitando = mostrarDigitando();

  /* try/finally: se qualquer coisa aqui dentro lançar, sem isto o
     indicador de "digitando" ficava na tela para sempre e o campo de
     texto ficava travado — no meio do pitch, só recarregando. */
  try {
    const resultados = await Promise.all(EXEMPLOS.map(ex => analisarIdeia(ex.completo)));

    let ultima = null;
    for (let n = 0; n < resultados.length; n++){
      const ideia = Deposito.salvar({
        ...resultados[n],
        textoOriginal: EXEMPLOS[n].completo
      });
      falar(resumoFalado(ideia));
      ultima = ideia;
    }

    desenharGrafo(ultima.dimensoes);
    desenharFicha(ultima);
    desenharPainel();
    btDemo.classList.add('oculto');   // escondido, não removido — btLimpar traz de volta
    document.getElementById('ficha').scrollIntoView({ behavior:'smooth', block:'start' });
  } catch(e){
    console.error('Demonstração falhou:', e);
    falar('Não consegui rodar a demonstração completa agora. Pode contar uma ideia no campo abaixo que eu analiso normalmente.', 'sistema');
  } finally {
    digitando.remove();
    aguardandoResposta = false;
    btEnviar.disabled = false;
    btDemo.disabled = false;
    btDemo.textContent = 'Rodar demonstração completa';
  }
};
caixaEx.appendChild(btDemo);

function restaurarBotaoDemo(){
  btDemo.classList.remove('oculto');
  btDemo.disabled = false;
  btDemo.textContent = 'Rodar demonstração completa';
  caixaEx.classList.remove('oculto');
}

/* Restaura o que já foi analisado antes de a página ser recarregada. */
Deposito.carregar();

falar('Oi. Somos o Conexões ESG — leio a ideia de um colaborador e mostro a que dimensões de sustentabilidade ela se liga: Ambiental, Social ou Governança.\n\nConte uma ideia com suas palavras. Não precisa ficar bonito nem usar termo técnico: eu faço as perguntas que faltarem.');
desenharPainel();

/* ---------- 12. ACESSIBILIDADE --------------------------------------
   Modo TDAH (menos estímulo, foco bem visível, régua de leitura) e
   modo daltônico (4 filtros SVG, defs no início do index.html).
   Mesmos dois recursos do site pessoal do Lucas
   (lucastorrestecnologia.com.br), portados pro padrão deste projeto:
   sem framework, tenta guardar no localStorage mas não quebra sem
   ele — igual ao Deposito lá em cima. */
const btAcess = document.getElementById('btAcess');
const painelAcess = document.getElementById('painelAcess');

function fecharAcess(){
  painelAcess.hidden = true;
  btAcess.setAttribute('aria-expanded', 'false');
}
btAcess.onclick = () => {
  const vaiAbrir = painelAcess.hidden;
  painelAcess.hidden = !vaiAbrir;
  btAcess.setAttribute('aria-expanded', String(vaiAbrir));
};
// Clique fora fecha o painel. Confere se o alvo está dentro do botão
// também (não só do painel), senão o próprio clique que abre já fecharia
// em seguida, porque o evento sobe até o document depois do onclick.
document.addEventListener('click', e => {
  if (!painelAcess.hidden && !painelAcess.contains(e.target) && !btAcess.contains(e.target)) fecharAcess();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !painelAcess.hidden){ fecharAcess(); btAcess.focus(); }
});

/* TDAH: sem transições/animações, foco reforçado, e uma régua de
   leitura.

   No computador a régua acompanha o cursor. No celular NÃO: não existe
   cursor, mousemove nunca dispara, e touchmove só dispara enquanto o
   dedo arrasta — que no celular é rolar a tela. O resultado era a
   régua perseguindo o dedo durante a rolagem (posição sem sentido) e
   congelando onde o dedo soltasse. Em tela de toque o certo é ancorar
   a régua num ponto confortável de leitura e deixar o conteúdo rolar
   por baixo dela, que é como régua de leitura funciona de verdade. */
const btTdah = document.getElementById('btTdah');
const reguaFoco = document.getElementById('reguaFoco');
const temCursor = window.matchMedia('(pointer: fine)').matches;
let tdahLigado = false;
try { tdahLigado = localStorage.getItem('conexoes-esg:tdah') === '1'; } catch(e){}

function alturaRegua(){
  return parseFloat(getComputedStyle(document.body).fontSize) * 1.9;
}
function posicionarRegua(y){
  const altura = alturaRegua();
  reguaFoco.style.height = altura + 'px';
  reguaFoco.style.top = (y - altura / 2) + 'px';
}
/* Ponto de repouso: 42% da altura da tela. Um pouco acima do meio, que
   é onde o olho descansa naturalmente ao ler. */
function ancorarRegua(){
  posicionarRegua(window.innerHeight * 0.42);
}

function aplicarTdah(v){
  tdahLigado = v;
  document.body.classList.toggle('tdah', v);
  btTdah.setAttribute('aria-pressed', String(v));
  btTdah.textContent = v ? 'Desativar' : 'Ativar';
  // Posiciona ao ligar: o CSS não define `top`, então sem isto a régua
  // aparecia num lugar imprevisível até o primeiro movimento do mouse
  // — e no celular, como não há mousemove, nunca saía de lá.
  if (v) ancorarRegua();
  try { localStorage.setItem('conexoes-esg:tdah', v ? '1' : '0'); } catch(e){}
}
aplicarTdah(tdahLigado);
btTdah.onclick = () => aplicarTdah(!tdahLigado);

if (temCursor){
  document.addEventListener('mousemove', e => {
    if (document.body.classList.contains('tdah')) posicionarRegua(e.clientY);
  });
} else {
  // Sem cursor: fica ancorada e reancora quando a tela muda de tamanho
  // (girar o aparelho, teclado virtual abrindo/fechando).
  window.addEventListener('resize', () => {
    if (document.body.classList.contains('tdah')) ancorarRegua();
  });
}

/* Baixa visão: amplia conteúdo e reforça contraste (ver style.css).
   Separado do TDAH de propósito — são necessidades diferentes e a
   pessoa pode precisar de um sem o outro, ou dos dois juntos. */
const btBaixaVisao = document.getElementById('btBaixaVisao');
let baixaVisaoLigada = false;
try { baixaVisaoLigada = localStorage.getItem('conexoes-esg:baixa-visao') === '1'; } catch(e){}

function aplicarBaixaVisao(v){
  baixaVisaoLigada = v;
  document.body.classList.toggle('baixa-visao', v);
  btBaixaVisao.setAttribute('aria-pressed', String(v));
  btBaixaVisao.textContent = v ? 'Desativar' : 'Ativar';
  // A régua do TDAH é posicionada em px por JS; com o conteúdo
  // ampliado a altura de referência muda, então reancora.
  if (document.body.classList.contains('tdah')) ancorarRegua();
  try { localStorage.setItem('conexoes-esg:baixa-visao', v ? '1' : '0'); } catch(e){}
}
aplicarBaixaVisao(baixaVisaoLigada);
btBaixaVisao.onclick = () => aplicarBaixaVisao(!baixaVisaoLigada);

/* Daltônico: 4 filtros SVG (defs em index.html), um de cada vez. */
const CB_MODOS = ['deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia'];
const botoesCor = document.querySelectorAll('#grupoCor .chave');
let cbModo = null;
try { cbModo = localStorage.getItem('conexoes-esg:cb') || null; } catch(e){}

function aplicarCb(modo){
  CB_MODOS.forEach(m => document.body.classList.remove('cb-' + m));
  if (modo) document.body.classList.add('cb-' + modo);
  botoesCor.forEach(b => b.setAttribute('aria-pressed', String((b.dataset.cb || null) === modo)));
  cbModo = modo;
  try { modo ? localStorage.setItem('conexoes-esg:cb', modo) : localStorage.removeItem('conexoes-esg:cb'); } catch(e){}
}
botoesCor.forEach(b => { b.onclick = () => aplicarCb(b.dataset.cb || null); });
aplicarCb(cbModo && CB_MODOS.includes(cbModo) ? cbModo : null);
