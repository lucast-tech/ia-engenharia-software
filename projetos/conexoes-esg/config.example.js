/* ==========================================================
   CONEXÕES ESG · configuração (ARQUIVO DE EXEMPLO)
   InovaHACK SENAI Porto 2026 — desafio AEVO

   COMO USAR:
     1. Copie este arquivo para "config.js" (na mesma pasta).
     2. Cole suas próprias chaves nas listas abaixo.
     3. O "config.js" está no .gitignore, então suas chaves
        nunca vão para o GitHub.

   Onde gerar as chaves:
     Gemini → aistudio.google.com/apikey
     Groq   → console.groq.com/keys

   Sem nenhuma chave o app continua funcionando: ele cai
   sozinho na triagem local (motor-local.js).
   ========================================================== */

const CONFIG = {
  /* CHAVES EM LISTA. Cada motor aceita várias: se a primeira estourar
     a cota (HTTP 429), a próxima assume automaticamente, sem mexer em
     código. Para adicionar, é só colar mais uma string na lista —
     idealmente de OUTRA conta Google/Groq, porque a cota é por conta,
     não por chave. Lista vazia desliga aquele motor. */
  GEMINI_API_KEYS: [
    'COLE_SUA_CHAVE_GEMINI_AQUI'
    // , 'cole aqui a segunda chave do Gemini (outra conta Google)'
  ],
  GEMINI_MODELO:  'gemini-flash-latest',

  // Groq entra se o Gemini falhar — segundo nível antes da triagem local
  GROQ_API_KEYS: [
    'COLE_SUA_CHAVE_GROQ_AQUI'
    // , 'cole aqui a segunda chave do Groq (outra conta)'
  ],
  // llama-3.3-70b-versatile foi descontinuado pela Groq (aviso em
  // 17/06/2026, desligamento em 16/08/2026 — três dias depois da
  // entrega do dia 13/08). Troquei para o substituto que a própria
  // Groq recomenda para esse modelo. Se quiser testar o mais rápido
  // (menor, mas ainda recomendado pela Groq para o mesmo caso), a
  // opção é 'qwen/qwen3.6-27b'.
  GROQ_MODELO:  'openai/gpt-oss-120b',

  /* Ordem de tentativa. Se todos falharem ou passarem do tempo limite,
     cai na triagem local sozinho.

     Groq vem primeiro por VELOCIDADE: a infraestrutura dele responde
     bem mais rápido que a do Gemini, e num pitch de 3 minutos cada
     segundo de tela parada pesa. Se a qualidade do texto do Groq
     decepcionar em algum teste, inverta para ['gemini', 'groq'] — é a
     única mudança necessária. */
  ORDEM: ['groq', 'gemini']
};
