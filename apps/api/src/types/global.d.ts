import "express-session";

export type SessionUser = {
    id: number;
    email: string;
    name: string;
    role: string;
    ingenioId: number | null;
}

declare module "express-session" {
    interface SessionData {
        user?: SessionUser
    }
}
