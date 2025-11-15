import { Navigate, Outlet } from "react-router-dom";
import { useSessionStore } from "../../../store/sessionStore";

export default function ProtectedRoute() {
	const user = useSessionStore((s) => s.user);

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}
