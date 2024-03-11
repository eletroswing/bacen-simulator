const SERVER_PORT = Number(process.env.PORT) || 8080;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

export default Object.freeze({
    SERVER_PORT,
    SERVER_URL,
});