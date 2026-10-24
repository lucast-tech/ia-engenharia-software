# Conexões ESG

MVP do **InovaHACK SENAI Porto 2026** (10 a 13/08/2026), desafio "Copiloto ESG" da AEVO: um chatbot que recebe ideias de colaboradores, classifica entre Ambiental, Social e Governança e devolve um plano de ação com indicadores, riscos e ROI.

**Demo online:** https://aevosenai.netlify.app/ (fora do ar no momento; em correção)

## O problema
A AEVO recebe mais ideias de melhoria de colaboradores do que a equipe consegue analisar à mão. A solução automatiza a triagem: indica se a ideia é viável e se está dentro dos parâmetros ESG, economizando tempo da empresa.

## Como funciona
1. `filtro.js` barra textos ofensivos, aleatórios ou perguntas sobre o sistema antes de qualquer envio.
2. `app.js` tenta a IA (Groq e depois Gemini, nessa ordem — configurável em `config.js`).
3. Se a IA falhar ou demorar, `motor-local.js` faz uma triagem local no navegador.

## Sobre as chaves de API
Durante o hackathon tivemos que deixar as chaves de API no código-fonte, por ser uma demonstração rápida. Depois do evento elas foram retiradas do código publicado aqui.

## Configuração das chaves
As chaves de API **não estão neste repositório**. Copie `config.example.js` para `config.js` e cole as suas (`config.js` está no `.gitignore`). Sem chaves, o app usa só a triagem local.

## Hospedagem
`netlify.toml` publica a pasta diretamente e adiciona cabeçalhos de segurança básicos.
