import { Navigate, Outlet } from "react-router-dom";
import { useSessionStore } from "../../../store/sessionStore";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

export default function ProtectedRoute() {
	const user = useSessionStore((s) => s.user);
	const [isLoading, setIsLoading] = useState(true);

	const getSession = async () => {
		const u = await api.getSession();
		useSessionStore.getState().setUser(u);
		setIsLoading(false);
	};

	useEffect(() => {
		if (!user) {
			getSession();
		} else {
			setIsLoading(false);
		}
	}, []);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}
