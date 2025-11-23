import { useState, useEffect } from "react";
import {
    Container,
    Header,
    Title,
    Button,
    LoadingText,
    TableContainer,
    Table,
    TableHead,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    UserName,
    RoleBadge,
    Actions,
    ActionButton,
    Select,
} from "./styled";

import useUsers from "./hooks/useUsers";
import UserForm from "./components/UserForm";
import { ROLES, type Ingenio } from "../../types";
import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";
import { api } from "../../lib/api";

export default function Usuarios() {
    const { user } = useSessionStore();
    const isSuperAdmin = user?.role === ROLES.SUPERADMIN;
    const canManage = hasPermission(user?.role || "", ROLES.ADMIN);

    const [ingenios, setIngenios] = useState<Ingenio[]>([]);
    const [selectedIngenioId, setSelectedIngenioId] = useState<number | undefined>(undefined);

    // Cargar ingenios si es superadmin
    useEffect(() => {
        if (isSuperAdmin) {
            api.getAllIngenios().then(setIngenios).catch(console.error);
        }
    }, [isSuperAdmin]);

    const {
        users,
        loading,
        showForm,
        setShowForm,
        editing,
        setEditing,
        loadUsers,
        deleteUser,
    } = useUsers(selectedIngenioId);

    if (loading && !users.length) return <LoadingText>Cargando usuarios...</LoadingText>;

    return (
        <Container>
            <Header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Title>Gestión de Usuarios</Title>
                    {isSuperAdmin && (
                        <Select
                            value={selectedIngenioId || ""}
                            onChange={(e) => setSelectedIngenioId(e.target.value ? Number(e.target.value) : undefined)}
                            style={{ width: '200px', margin: 0 }}
                        >
                            <option value="">Todos los Ingenios</option>
                            {ingenios.map(ing => (
                                <option key={ing.id} value={ing.id}>{ing.name}</option>
                            ))}
                        </Select>
                    )}
                </div>
                
                {canManage && (
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                    >
                        + Nuevo Usuario
                    </Button>
                )}
            </Header>

            <TableContainer>
                <Table>
                    <TableHead>
                        <tr>
                            <TableHeader>Nombre</TableHeader>
                            <TableHeader>Email</TableHeader>
                            <TableHeader>Rol</TableHeader>
                            <TableHeader>Ingenio</TableHeader>
                            <TableHeader>Fecha Creación</TableHeader>
                            {canManage && <TableHeader>Acciones</TableHeader>}
                        </tr>
                    </TableHead>

                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell>
                                    <UserName>{u.name}</UserName>
                                </TableCell>

                                <TableCell>{u.email}</TableCell>

                                <TableCell>
                                    <RoleBadge role={u.role}>
                                        {u.role === ROLES.ADMIN ? "Administrador" :
                                         u.role === ROLES.TECNICO ? "Técnico" :
                                         "Visualizador"}
                                    </RoleBadge>
                                </TableCell>

                                <TableCell>
                                    <span style={{color: '#64748b', fontSize: 13}}>
                                        {u.ingenio ? u.ingenio.name : (u.ingenioId ? `#${u.ingenioId}` : "-")}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </TableCell>

                                {canManage && (
                                    <TableCell>
                                        <Actions>
                                            <ActionButton
                                                onClick={() => {
                                                    setEditing(u);
                                                    setShowForm(true);
                                                }}
                                            >
                                                Editar
                                            </ActionButton>

                                            <ActionButton
                                                $danger
                                                onClick={() => {
                                                    if(confirm('¿Estás seguro de eliminar este usuario?')) {
                                                        deleteUser(u.id);
                                                    }
                                                }}
                                            >
                                                Eliminar
                                            </ActionButton>
                                        </Actions>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {showForm && (
                <UserForm
                    initialData={editing}
                    onClose={() => {
                        setShowForm(false);
                        setEditing(null);
                    }}
                    onSave={() => {
                        loadUsers();
                        setShowForm(false);
                        setEditing(null);
                    }}
                />
            )}
        </Container>
    );
}