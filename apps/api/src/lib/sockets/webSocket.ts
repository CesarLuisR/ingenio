import { WebSocketServer } from "ws";

export function createWebSocketServer(server: any) {
    const wss = new WebSocketServer({ server, path: "/ws" });

    wss.on("connection", (socket) => {
        console.log("Nuevo cliente conectado al WebSocket");
        socket.on("close", () => console.log("Cliente desconectado"));
    });

    return wss;
}

export function broadcast(data: unknown, wss: WebSocketServer) {
    const msg = JSON.stringify(data);
    for (const client of wss.clients) {
        if (client.readyState === 1) client.send(msg);
    }
}