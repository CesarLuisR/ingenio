import { WebSocketServer, WebSocket } from "ws";
import { IMessageBus } from "./messageBus";

export class WebSocketBus implements IMessageBus {
	private clients = new Set<WebSocket>();

	constructor(private wss: WebSocketServer) {
		this.wss.on("connection", (ws) => {
			console.log("✅ Cliente conectado al WebSocket");
			this.clients.add(ws);

			ws.on("close", () => {
				this.clients.delete(ws);
				console.log("❌ Cliente desconectado del WebSocket");
			});
		});
	}

	publish(event: string, payload: any): void {
		const msg = JSON.stringify({ type: event, payload });
		for (const client of this.clients) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(msg);
			}
		}
	}
}
