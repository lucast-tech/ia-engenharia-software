/* ==========================================================
   CONEXÕES ESG · filtro de entrada
   InovaHACK SENAI Porto 2026 — desafio AEVO

   Roda ANTES de qualquer análise e antes de qualquer envio.
   Existe por dois motivos:

   1. Um copiloto usado no chão de fábrica recebe de tudo.
      Ofensa, teste, texto aleatório. Se o sistema classifica
      "asdfghjk" como ideia de Governança, ele perde a
      credibilidade na primeira demonstração.

   2. O que é bloqueado aqui não é enviado para a IA. Menos
      custo, menos exposição, e a recusa acontece no navegador.

   Devolve { ok: true } ou { ok: false, motivo, resposta }.
   ========================================================== */

/* Termos ofensivos e sexuais em português. Comparados sobre o
   texto sem acento e em minúsculas. A lista cobre o que aparece
   com frequência; não pretende ser exaustiva. */
const OFENSIVO = [
  'caralho','porra','buceta','boceta','xoxota','pica','piroca','rola','pinto',
  'foder','fuder','foda-se','fodase','crl','pqp','vsf','vtnc','arrombad',
  'puta','putinha','viado','viadinho','bicha','veado','corno','cuzao','cuzinho',
  'merda','bosta','cacete','desgraca','filho da puta','fdp','otari','babaca',
  'idiota','imbecil','retardad','mongoloide','burro','escroto','vagabund',
  'safad','piranha','vadia','cachorra','gostosa','tesao','punheta','siririca',
  'transar','trepar','chupar','mamar','boquete','gozar','pau duro','penis',
  'vagina','bunda','cu','xereca','viadagem'
];

/* Palavras curtas de conversa que sozinhas não são ideia nenhuma. */
const SO_CONVERSA = new Set([
  'oi','ola','ei','eae','eai','opa','bom dia','boa tarde','boa noite','tudo bem',
  'tudo bom','beleza','blz','ok','okay','certo','sim','nao','talvez','obrigado',
  'obrigada','valeu','vlw','tchau','ate mais','teste','testando','test','aaa',
  'kkk','kkkk','haha','rs','sla','sei la','nada','?','!','...'
]);

/* ---------- PERGUNTAS SOBRE O PRÓPRIO SISTEMA --------------------
   Quem usa um copiloto pela primeira vez pergunta o que ele é antes de
   contar uma ideia — e a banca vai fazer exatamente isso na
   demonstração. Sem este tratamento, "o que você faz?" era lido como
   ideia e recebia "onde isso acontece hoje?" de volta.

   Só vale para mensagem curta: uma ideia de verdade tem mais de 15
   palavras e não deve ser confundida com pergunta sobre o sistema. */
const META = [
  { teste: /\b(o que voce (faz|foi treinad|pode fazer|sabe fazer)|p(a)?ra que (voce )?serve|qual (e |eh )?(a )?sua funcao|o que (e|eh) (isso|esse (site|app|sistema))|como (voce |eu )?(funciona|usa|uso|utilizo)|quem (e|eh) voce|voce (e|eh) (uma |um )?(ia|robo|bot|maquina))/,
    resposta: 'Sou o copiloto da equipe Conexões ESG. Leio a ideia que um colaborador escreve com as próprias palavras e mostro a que dimensões de sustentabilidade ela se conecta — Ambiental, Social ou Governança. Explico por que se conecta, aponto o que dá para medir e listo os próximos passos para a ideia virar projeto.\n\nPode me contar uma ideia agora.' },

  { teste: /\b(que (ia|modelo|tecnologia|inteligencia)|qual (ia|modelo|tecnologia)|voce (usa|roda) (qual|que|com)|voce (e|eh) o (chatgpt|gpt|gemini|claude)|como (e|eh) feito|tem internet|precisa de internet)/,
    resposta: 'Uso o Gemini para analisar o texto. Se a internet ou a API falhar, passo sozinho para uma triagem local que roda aqui no navegador, com um dicionário de chão de fábrica — assim a análise sai de qualquer jeito. A ficha mostra qual dos dois respondeu.' },

  { teste: /\b(quem (te |os |as )?(criou|fez|desenvolveu|programou|construiu)|quem sao voces|de quem (e|eh)|qual (e |eh )?(a )?equipe)/,
    resposta: 'Fui feito pela equipe Conexões ESG para o InovaHACK SENAI Porto 2026, no desafio da AEVO.' },

  { teste: /(^(me )?ajuda|^help|^socorro|nao sei (o que |como )?(escrever|falar|colocar|comecar)|me d[ea] (um )?exemplo|quero (um )?exemplo|pode dar (um )?exemplo|tem exemplo|como comeco)/,
    resposta: 'Escreva o que incomoda hoje na fábrica e o que você mudaria. Por exemplo: "a água do resfriamento das injetoras vai fora, dava pra reusar na limpeza do pátio". Não precisa de termo técnico nem de texto bonito — se faltar alguma informação, eu pergunto.' }
];

/** Devolve a resposta pronta se a mensagem for sobre o sistema, ou null. */
function responderSobreOSistema(texto){
  const cru = texto.trim();
  if (cru.split(/\s+/).length > 15) return null;   // ideia de verdade é mais longa
  const t = semAcento(cru);
  for (const m of META) if (m.teste.test(t)) return m.resposta;
  return null;
}

function semAcento(t){
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

/* respondendoPergunta: true quando o copiloto acabou de fazer uma
   pergunta de acompanhamento (PERGUNTAS, em app.js) e esta mensagem é
   a resposta a ela. Nesse caso "500ml por dia" ou "20 pessoas" SÃO a
   resposta certa — só que curtas — e não podem cair nas regras de
   tamanho mínimo feitas para pegar mensagem solta tipo "oi" ou "teste"
   digitada sem contexto nenhum. */
function validarEntrada(texto, respondendoPergunta){
  const cru = texto.trim();
  const t = semAcento(cru);
  const palavras = cru.split(/\s+/).filter(Boolean);

  // 1. vazio
  if (!cru){
    return { ok:false, motivo:'vazio', resposta:'Não veio nada. Descreva a ideia em uma ou duas frases.' };
  }

  // 2. ofensa — barra antes de qualquer envio
  for (const termo of OFENSIVO){
    // limite de palavra, para "pica" não casar dentro de "picada" nem
    // "preta" dentro de "prateleira"
    const re = new RegExp('(^|[^a-z0-9])' + termo.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '([^a-z0-9]|$)');
    if (re.test(t)){
      return {
        ok:false, motivo:'ofensivo',
        resposta:'Detectei linguagem ofensiva e não vou analisar esse texto. Este canal é para ideias de melhoria da fábrica — descreva o que você mudaria na rotina e eu sigo daqui.'
      };
    }
  }

  // 3. só cumprimento, mesmo combinando dois ("olá boa noite"). As duas
  // primeiras condições valem sempre — "oi" nunca é resposta válida a
  // uma pergunta de acompanhamento. Só a terceira (tamanho mínimo) é
  // pulada quando é resposta, porque "3 pessoas" tem 2 palavras e 9
  // caracteres e cairia aqui por engano.
  const CUMPRIMENTOS = /^(oi|ola|ei|eae|eai|opa|salve|bom dia|boa tarde|boa noite|tudo bem|tudo bom|beleza|blz|e ai|como vai)([\s,!.]+(oi|ola|bom dia|boa tarde|boa noite|tudo bem|tudo bom|beleza|pessoal|gente|galera))*[\s,!.?]*$/;
  if (SO_CONVERSA.has(t) || CUMPRIMENTOS.test(t) || (!respondendoPergunta && palavras.length <= 2 && t.length < 12)){
    return {
      ok:false, motivo:'conversa',
      resposta:'Isso ainda não é uma ideia. Me conte o que acontece hoje e o que você mudaria — pode ser em uma frase.'
    };
  }

  // 4. teclado amassado: pouca vogal ou letra repetida demais
  const letras = t.replace(/[^a-z]/g,'');
  if (letras.length >= 6){
    const vogais = (letras.match(/[aeiou]/g) || []).length;
    if (vogais / letras.length < 0.2){
      return {
        ok:false, motivo:'sem sentido',
        resposta:'Não consegui ler isso como texto. Escreva a ideia com suas palavras, do jeito que você contaria para um colega.'
      };
    }
  }
  if (/(.)\1{4,}/.test(t)){
    return {
      ok:false, motivo:'sem sentido',
      resposta:'Não consegui ler isso como texto. Escreva a ideia com suas palavras, do jeito que você contaria para um colega.'
    };
  }

  // 5. nenhuma palavra de verdade (tudo com 1 ou 2 letras)
  if (!palavras.some(p => p.replace(/[^a-zA-ZÀ-ÿ]/g,'').length >= 3)){
    return {
      ok:false, motivo:'sem sentido',
      resposta:'Não consegui entender o texto. Descreva a ideia em uma frase completa.'
    };
  }

  /* Curto demais para analisar — mas NÃO é lixo. Antes devolvia sempre
     a mesma frase ("Preciso de um pouco mais. O que acontece hoje e o
     que você mudaria?"), que é justamente a pergunta fixa que a gente
     quer eliminar. Agora sinaliza `curto` e quem chama gera uma
     pergunta em cima do que a pessoa escreveu. */
  if (!respondendoPergunta && palavras.length < 4 && cru.length < 20){
    return { ok:false, motivo:'curto', perguntar:true };
  }

  return { ok:true };
}
