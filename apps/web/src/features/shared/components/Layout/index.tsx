import { Outlet, useLocation } from "react-router-dom";
import {
    Container,
    MainContent,
    Nav,
    NavLinkStyled,
    Sidebar,
    SidebarHeader,
    Subtitle,
    Title,
    SidebarFooter,
    UserAvatar,
    UserInfo,
    LogoutButton,
} from "./styled";
import { useSessionStore } from "../../../../store/sessionStore";
import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import type { Ingenio } from "../../../../types";
import { ROLES } from "../../../../types";

// Importamos el nuevo modal (ajusta la ruta si lo guardaste en otro lado)
import ChangePasswordModal from "./ChangePasswordModal"; 

export default function Layout() {
    const location = useLocation();
    
    // Detectar si la ruta empieza con el path (para subrutas activas)
    const isActive = (path: string) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    const user = useSessionStore((s) => s.user);
    const [ingenio, setIngenio] = useState<Ingenio>();
    
    // Estado para controlar el modal de cambio de contraseña
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        const getIngenioInfo = async () => {
            if (user?.ingenioId) {
                try {
                    const data = await api.getIngenio(user?.ingenioId);
                    setIngenio(data);
                } catch (e) {
                    console.error("Error cargando ingenio", e);
                }
            }
        }
        getIngenioInfo();
    }, [user?.ingenioId]);

    // Obtener iniciales del usuario para el avatar
    const initials = user?.name 
        ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
        : "U";

    return (
        <Container>
            <Sidebar>
                <SidebarHeader>
                    <Title>
                        <span>📡</span>
                        {user?.role === ROLES.SUPERADMIN ? "Panel Superadmin" : (ingenio?.name || "Cargando...")}
                    </Title>
                    <Subtitle>Sistema de Monitoreo</Subtitle>
                </SidebarHeader>

                <Nav>
                    {user?.role === ROLES.SUPERADMIN ? (
                        <>
                            <NavLinkStyled to="/" $active={isActive("/")}>
                                <span>🏠</span> Dashboard
                            </NavLinkStyled>
                            <NavLinkStyled to="/ingenios" $active={isActive("/ingenios")}>
                                <span>🏭</span> Ingenios
                            </NavLinkStyled>
                            <NavLinkStyled to="/usuarios" $active={isActive("/usuarios")}>
                                <span>👥</span> Usuarios
                            </NavLinkStyled>
                            <NavLinkStyled to="/maquinas" $active={isActive("/maquinas")}>
                                <span>⚙️</span> Máquinas
                            </NavLinkStyled>
                            <NavLinkStyled to="/sensores" $active={isActive("/sensores")}>
                                <span>📊</span> Sensores
                            </NavLinkStyled>
                        </>
                    ) : (
                        <>
                            <NavLinkStyled to="/" $active={isActive("/")}>
                                <span>🏠</span> Dashboard
                            </NavLinkStyled>
                            
                            <NavLinkStyled to="/maquinas" $active={isActive("/maquinas")}>
                                <span>⚙️</span> Máquinas
                            </NavLinkStyled>
                            
                            <NavLinkStyled to="/sensores" $active={isActive("/sensores")}>
                                <span>📊</span> Sensores
                            </NavLinkStyled>
                            
                            <NavLinkStyled to="/mantenimientos" $active={isActive("/mantenimientos")}>
                                <span>🔧</span> Mantenimientos
                            </NavLinkStyled>
                            
                            <NavLinkStyled to="/fallos" $active={isActive("/fallos")}>
                                <span>⚠️</span> Fallos
                            </NavLinkStyled>
                            
                            <NavLinkStyled to="/tecnicos" $active={isActive("/tecnicos")}>
                                <span>👷‍♂️</span> Técnicos
                            </NavLinkStyled>
                            
                            <NavLinkStyled to="/usuarios" $active={isActive("/usuarios")}>
                                <span>👥</span> Usuarios
                            </NavLinkStyled>
                            
                            <NavLinkStyled to="/analisis" $active={isActive("/analisis")}>
                                <span>📈</span> Análisis
                            </NavLinkStyled>
                        </>
                    )}
                </Nav>

                {/* Footer con información del usuario logueado */}
                <SidebarFooter>
                    <div style={{display: 'flex', alignItems: 'center', gap: 12, width: '100%'}}>
                        {/* Hacemos clickable el área del usuario */}
                        <div 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 12, 
                                flex: 1, 
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '8px',
                                transition: 'background 0.2s'
                            }}
                            onClick={() => setShowPasswordModal(true)}
                            title="Cambiar contraseña"
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <UserAvatar>{initials}</UserAvatar>
                            <UserInfo>
                                <span className="name">{user?.name || "Usuario"}</span>
                                <span className="role">{user?.role || "Invitado"}</span>
                            </UserInfo>
                        </div>

                        <LogoutButton 
                            onClick={() => useSessionStore.getState().logout()}
                            title="Cerrar Sesión"
                        >
                            🚪
                        </LogoutButton>
                    </div>
                </SidebarFooter>
            </Sidebar>

            <MainContent>
                <Outlet />
            </MainContent>

            {/* Renderizamos el modal si el estado es true */}
            {showPasswordModal && (
                <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
            )}
        </Container>
    );
}