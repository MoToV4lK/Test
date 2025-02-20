const WebSocket = require("ws");
const fs = require("fs");
const http = require("http");

const PORT = process.env.PORT || 3000;  // ✅ Render выдаст свой порт

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let messageHistory = [];

// ✅ Сохраняем сообщения во временной папке Render
const FILE_PATH = "/tmp/messages.json"; 

if (fs.existsSync(FILE_PATH)) {
    const fileData = fs.readFileSync(FILE_PATH, "utf-8");
    messageHistory = JSON.parse(fileData);
}

// ✅ Функция сохранения сообщений
function saveMessages() {
    fs.writeFileSync(FILE_PATH, JSON.stringify(messageHistory, null, 2));
}

wss.on("connection", (ws) => {
    console.log("🔗 Новый пользователь подключился!");

    // ✅ Отправляем историю сообщений новому пользователю
    messageHistory.forEach(message => ws.send(message));

    ws.on("message", (message) => {
        console.log("💬 Сообщение:", message);

        messageHistory.push(message);
        saveMessages();

        // ✅ Отправляем сообщение всем клиентам
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on("close", () => console.log("❌ Пользователь отключился."));
});

// ✅ Теперь сервер слушает PORT от Render
server.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
