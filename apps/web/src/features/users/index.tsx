import { useState, useEffect, useMemo } from "react";
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
    // Select ya no es necesario importarlo si usas SearchableSelect
} from "./styled";

import useUsers from "./hooks/useUsers";
import UserForm from "./components/UserForm";
import { ROLES, type Ingenio } from "../../types";
import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";
import { api } from "../../lib/api";
import SearchableSelect from "../shared/components/SearchableSelect";

export default function Usuarios() {
    const { user } = useSessionStore();
    const isSuperAdmin = user?.role === ROLES.SUPERADMIN;
    const canManage = hasPermission(user?.role || "", ROLES.ADMIN);

    const [ingenios, setIngenios] = useState<Ingenio[]>([]);
    const [selectedIngenioId, setSelectedIngenioId] = useState<number | undefined>(undefined);

    // Cargar ingenios si es superadmin
    useEffect(() => {
        if (isSuperAdmin) {
            api.ingenios.getList().then(setIngenios).catch(console.error);
        }
    }, [isSuperAdmin]);

    // Preparamos las opciones para el SearchableSelect
    const ingenioOptions = useMemo(() => {
        // Opción 0 representa "Todos"
        const allOption = { id: 0, name: "🏢 Todos los Ingenios", code: "" };
        return [allOption, ...ingenios];
    }, [ingenios]);

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
                    
                    {/* IMPLEMENTACIÓN DEL SEARCHABLE SELECT */}
                    {isSuperAdmin && (
                        <div style={{ zIndex: 50, width: 220 }}> 
                            <SearchableSelect
                                options={ingenioOptions}
                                value={selectedIngenioId || 0} // Si es undefined, mostramos 0 (Todos)
                                onChange={(val) => setSelectedIngenioId(val === 0 ? undefined : val)}
                                placeholder="🔍 Buscar ingenio..."
                            />
                        </div>
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