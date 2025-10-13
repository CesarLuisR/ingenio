import { WebSocketServer } from "ws";

declare global {
    namespace Express {
        interface Request {
            wss?: WebSocketServer;
            broadcast?: (data: unknown) => void;
        }
    }
}
