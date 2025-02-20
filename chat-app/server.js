const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 3000 });

let clients = new Set();
let messageHistory = []; // ✅ Хранилище для сообщений

server.on("connection", (ws) => {
    clients.add(ws);
    console.log("Новый пользователь подключился!");

    // ✅ При подключении нового клиента отправляем ему историю сообщений
    messageHistory.forEach(message => {
        ws.send(message);
    });

    ws.on("message", (message) => {
        console.log("Получено сообщение:", message);

        messageHistory.push(message); // ✅ Сохраняем сообщение в историю

        // ✅ Отправляем сообщение всем клиентам
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on("close", () => {
        clients.delete(ws);
        console.log("Пользователь отключился.");
    });
});

console.log("WebSocket сервер запущен на ws://localhost:3000");