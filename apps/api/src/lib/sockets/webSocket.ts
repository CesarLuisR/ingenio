import { WebSocketServer, WebSocket } from "ws";
import { IMessageBus } from "./messageBus";
import { sessionMiddleware } from "../../app";

interface ClientWithIngenio extends WebSocket {
	ingenioId?: number;
	isSuperAdmin?: boolean;
}

export class WebSocketBus implements IMessageBus {
	private clients = new Set<ClientWithIngenio>();

	constructor(private wss: WebSocketServer) {
		this.wss.on("connection", (ws, req: any) => {
			sessionMiddleware(req, {} as any, () => {
				const user = req.session?.user;

				// Permitir conexión si tiene ingenioId O es Superadmin
				if (!user || (!user.ingenioId && user.role !== "SUPERADMIN")) {
					console.error("❌ Cliente conectado sin permisos (sin ingenioId y no es Superadmin)");
					ws.close();
					return;
				}

				const client = ws as ClientWithIngenio;
				client.ingenioId = user.ingenioId;
				client.isSuperAdmin = user.role === "SUPERADMIN";

				this.clients.add(client);
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
			// Enviar si pertenece al ingenio O si es Superadmin (ve todo)
			if (
				client.readyState === WebSocket.OPEN &&
				(client.ingenioId === ingenioId || client.isSuperAdmin)
			) {
				client.send(msg);
			}
		}
	}
}
