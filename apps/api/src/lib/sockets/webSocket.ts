import { WebSocketServer, WebSocket } from "ws";
import { IMessageBus } from "./messageBus";
import { sessionMiddleware } from "../../app";

interface ClientWithIngenio extends WebSocket {
	ingenioId?: number;
}

export class WebSocketBus implements IMessageBus {
	private clients = new Set<ClientWithIngenio>();

	constructor(private wss: WebSocketServer) {
		this.wss.on("connection", (ws, req: any) => {
			sessionMiddleware(req, {} as any, () => {
				const user = req.session?.user;
				if (!user || !user.ingenioId) {
					console.error("❌ Cliente conectado sin ingenioId");
					ws.close();
					return;
				}

				(ws as ClientWithIngenio).ingenioId = user.ingenioId;
				this.clients.add(ws as ClientWithIngenio);
			});
			console.log("✅ Cliente conectado al WebSocket");

			ws.on("close", () => {
				this.clients.delete(ws as ClientWithIngenio);
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

	publishToIngenio(event: string, payload: any, ingenioId: number): void {
		const msg = JSON.stringify({ type: event, payload });
		for (const client of this.clients) {
			if (client.readyState === WebSocket.OPEN && client.ingenioId === ingenioId) {
				client.send(msg);
			}
		}
	}
}
