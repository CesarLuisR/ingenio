import { Table, TableHead, TableHeader, TableBody, TableCell } from "./styledTable";
import {
    Container,
    Header,
    Title,
    Button,
    LoadingText,
    UserName,
    RoleBadge,
    TableContainer,
    Actions,
    ActionButton,
} from "./styled";

import useUsers from "./hooks/useUsers";
import UserForm from "./components/UserForm";
import { ROLES } from "../../types";

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

    if (loading) return <LoadingText>Cargando usuarios...</LoadingText>;

    return (
        <Container>
            <Header>
                <Title>Gestión de Usuarios</Title>

                <Button
                    onClick={() => {
                        setEditing(null);
                        setShowForm(true);
                    }}
                >
                    + Nuevo Usuario
                </Button>
            </Header>

            <TableContainer>
                <Table>
                    <TableHead>
                        <tr>
                            <TableHeader>Nombre</TableHeader>
                            <TableHeader>Email</TableHeader>
                            <TableHeader>Rol</TableHeader>
                            <TableHeader>Fecha Creación</TableHeader>
                            <TableHeader>Acciones</TableHeader>
                        </tr>
                    </TableHead>

                    <TableBody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <TableCell>
                                    <UserName>{u.name}</UserName>
                                </TableCell>

                                <TableCell>{u.email}</TableCell>

                                <TableCell>
                                    <RoleBadge role={u.role}>
                                        {
                                            u.role === ROLES.ADMIN
                                                ? "Administrador"
                                                : u.role === ROLES.TECNICO
                                                    ? "Técnico"
                                                    : "Lector"
                                        }
                                    </RoleBadge>
                                </TableCell>

                                <TableCell>
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </TableCell>

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
                                            onClick={() => deleteUser(u.id)}
                                        >
                                            Eliminar
                                        </ActionButton>
                                    </Actions>
                                </TableCell>
                            </tr>
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
