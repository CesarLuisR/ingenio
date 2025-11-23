import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import type { User } from "../../../types";
import { useSessionStore } from "../../../store/sessionStore";

export default function useUsers(ingenioId?: number) {
    const sessionUser = useSessionStore((s) => s.user);

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, [ingenioId]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers(ingenioId);
            setUsers(data);
        } catch (err) {
            console.error("Error cargando usuarios:", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: number) => {
        // TODO: Lo poco de roles que tenemos y no funciona porque tiene que ser "ADMIN", usar el tipo de roles por mas seguridad
        if (!sessionUser || sessionUser.role !== "admin") {
            alert("No tienes permisos");
            return;
        }

        if (!confirm("¿Eliminar usuario permanentemente?")) return;

        try {
            await api.deleteUser(id.toString());
            loadUsers();
        } catch (err) {
            console.error("Error eliminando usuario:", err);
        }
    };

    return {
        users,
        loading,
        showForm,
        setShowForm,

        editing,
        setEditing,

        loadUsers,
        deleteUser,
    };
}
