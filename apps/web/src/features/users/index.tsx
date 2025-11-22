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
} from "./styled";

import useUsers from "./hooks/useUsers";
import UserForm from "./components/UserForm";
import { ROLES } from "../../types";
import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";

export default function Usuarios() {
    const {
        users,
        loading,
        showForm,
        setShowForm,
        editing,
        setEditing,
        loadUsers,
        deleteUser,
    } = useUsers();

    const { user } = useSessionStore();
    const canManage = hasPermission(user?.role || "", ROLES.ADMIN);

    if (loading) return <LoadingText>Cargando usuarios...</LoadingText>;

    return (
        <Container>
            <Header>
                <Title>Gestión de Usuarios</Title>
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
                            <TableHeader>Ingenio ID</TableHeader>
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
                                        #{u.ingenioId ?? "-"}
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