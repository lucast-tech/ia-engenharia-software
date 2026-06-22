const users = [];

function register(username, password) {
    users.push({ username, password });
}

function login(username, password) {
    return users.find(
        user => user.username === username && user.password === password
    );
}

module.exports = { register, login };
