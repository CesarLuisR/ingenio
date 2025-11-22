import { create } from "zustand";
import { api } from "../lib/api";

interface SessionUser {
	id: number;
	email: string;
	name: string;
	role: string;
	ingenioId?: number | null;
}

interface SessionState {
	user: SessionUser | null;
	setUser: (u: SessionUser | null) => void;
	logout: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
	user: null,
	setUser: (u) => set({ user: u }),

	logout: async () => {
		try {
			await api.logout();
		} catch (e) {
			console.error("Logout failed", e);
		}
		set({ user: null });
		// Force reload to clear all states and prevent "back" navigation
		window.location.href = "/login";
	},
}));
