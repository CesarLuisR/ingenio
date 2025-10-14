import { WebSocketServer } from "ws";
import { IMessageBus } from "./messageBus";

export class WebSocketBus implements IMessageBus {
    constructor(private wss: WebSocketServer) {}

    publish(event: string, payload: any): void {
        const msg = JSON.stringify({ type: event, ...payload });
        for (const client of this.wss.clients) {
            if (client.readyState === 1) client.send(msg);
        }
    }
}