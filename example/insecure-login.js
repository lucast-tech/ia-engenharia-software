/* Exemplo didático e INSEGURO: senha guardada em texto puro e usuários só em memória.
   Serve para mostrar o risco; não use em produção (use hash com bcrypt/argon2 e banco de dados). */
const users = [];

// Cadastra o usuário guardando a senha SEM criptografia (problema!)
function register(username, password) {
    users.push({ username, password });
}

// Login comparando senha em texto puro; sem limite de tentativas (problema!)
function login(username, password) {
    return users.find(
        user => user.username === username && user.password === password
    );
}

module.exports = { register, login };
