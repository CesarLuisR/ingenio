import { useState, useEffect, useMemo } from "react";
import styled from "styled-components"; // Necesario para el footer
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
    TextInput
} from "./styled";

import useUsers from "./hooks/useUsers";
import UserForm from "./components/UserForm";
import { ROLES, type Ingenio } from "../../types";
import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";
import { api } from "../../lib/api";
import SearchableSelect from "../shared/components/SearchableSelect";

// Estilos de paginación (Pega esto en tu styled.ts si quieres reutilizar)
const PaginationFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding-bottom: 30px;

  button {
    padding: 8px 16px;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    &:hover:not(:disabled) {
      background: #f1f5f9;
    }
  }
  
  span {
    color: #64748b;
    font-size: 14px;
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  /* Cuando la pantalla sea menor a 768px */
  @media (max-width: 768px) {
    flex-direction: column; /* Cambia a columna */
    align-items: stretch;   /* Hace que los hijos ocupen todo el ancho (opcional) */
    width: 100%;            /* Asegura que el contenedor ocupe todo el ancho */
  }
`;

export default function Usuarios() {
    const { user } = useSessionStore();
    const isSuperAdmin = user?.role === ROLES.SUPERADMIN;
    const canManage = hasPermission(user?.role || "", ROLES.ADMIN);

    const [ingenios, setIngenios] = useState<Ingenio[]>([]);
    const [selectedIngenioId, setSelectedIngenioId] = useState<number | undefined>(undefined);

    // Cargar ingenios (Solo SuperAdmin necesita esto para el filtro)
    useEffect(() => {
        if (isSuperAdmin) {
            // Usamos getList (modo simple) para llenar el select
            api.ingenios.getList().then(setIngenios).catch(console.error);
        }
    }, [isSuperAdmin]);

    const ingenioOptions = useMemo(() => {
        const allOption = { id: 0, name: "🏢 Todos los Ingenios", code: "" };
        return [allOption, ...ingenios];
    }, [ingenios]);

    // Hook Paginado
    const {
        users,
        loading,
        meta,       // Info de Paginación
        setPage,
        search,
        setSearch,  // Setter para el filtro de texto
        
        showForm,
        setShowForm,
        editing,
        setEditing,
        refresh,
        deleteUser,
    } = useUsers(selectedIngenioId);

    return (
        <Container>
            <Header>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <Title>Gestión de Usuarios</Title>
                    <p style={{color: '#64748b', fontSize: 14, margin: 0}}>Administración de accesos y roles</p>
                </div>
                
                <Toolbar>
                    {/* BARRRA DE BÚSQUEDA */}
                    <TextInput 
                        placeholder="Buscar usuario..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {/* SELECT DE INGENIO (SOLO SUPERADMIN) */}
                    {isSuperAdmin && (
                        <div className="filter-select-container"> 
                            <SearchableSelect
                                options={ingenioOptions}
                                value={selectedIngenioId || 0}
                                onChange={(val) => setSelectedIngenioId(val === 0 ? undefined : val)}
                                placeholder="Filtrar por Ingenio..."
                            />
                        </div>
                    )}

                    {/* BOTÓN NUEVO */}
                    {canManage && (
                        <Button
                            onClick={() => {
                                setEditing(null);
                                setShowForm(true);
                            }}
                        >
                            + Nuevo
                        </Button>
                    )}
                </Toolbar>
            </Header>

            {loading && users.length === 0 ? (
                <LoadingText>Cargando usuarios...</LoadingText>
            ) : (
                <>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <tr>
                                    <TableHeader>Nombre</TableHeader>
                                    <TableHeader>Email</TableHeader>
                                    <TableHeader>Rol</TableHeader>
                                    <TableHeader>Ingenio</TableHeader>
                                    <TableHeader>Fecha Creación</TableHeader>
                                    {canManage && <TableHeader align="center">Acciones</TableHeader>}
                                </tr>
                            </TableHead>

                            <TableBody>
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} style={{textAlign: 'center', padding: 30, color: '#94a3b8'}}>
                                            No se encontraron usuarios.
                                        </TableCell>
                                    </TableRow>
                                )}
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
                                                 u.role === ROLES.LECTOR ? "Lector" :
                                                 u.role}
                                            </RoleBadge>
                                        </TableCell>

                                        <TableCell>
                                            <span style={{color: '#64748b', fontSize: 13}}>
                                                {/* Usamos el objeto ingenio si viene poblado (include), sino el ID */}
                                                {u.ingenio?.name || (u.ingenioId ? `#${u.ingenioId}` : "N/A")}
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
                                                        onClick={() => deleteUser(u.id)}
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

                    {/* PIE DE PAGINACIÓN */}
                    {users.length > 0 && (
                        <PaginationFooter>
                            <button 
                                disabled={!meta.hasPreviousPage}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                ← Anterior
                            </button>
                            
                            <span>
                                Página <strong>{meta.currentPage}</strong> de {meta.totalPages} 
                                <span style={{marginLeft: 8, fontSize: 12, color: '#94a3b8'}}>
                                    ({meta.totalItems} usuarios)
                                </span>
                            </span>

                            <button 
                                disabled={!meta.hasNextPage}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Siguiente →
                            </button>
                        </PaginationFooter>
                    )}
                </>
            )}

            {showForm && (
                <UserForm
                    initialData={editing}
                    onClose={() => {
                        setShowForm(false);
                        setEditing(null);
                    }}
                    onSave={() => {
                        refresh();
                        setShowForm(false);
                        setEditing(null);
                    }}
                />
            )}
        </Container>
    );
}