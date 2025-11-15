import { create } from "zustand";

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
		await fetch("/logout", {
			method: "POST",
			credentials: "include",
		});
		set({ user: null });
	},
}));
