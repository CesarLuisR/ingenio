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
    ThemeToggleButton,
    MobileBottomNav,
    MobileNavItem,
    MobileHeader,
    MobileMenuButton,
    MobileOverlay,
} from "./styled";
import { useSessionStore } from "../../../../store/sessionStore";
import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import type { Ingenio } from "../../../../types";
import { ROLES } from "../../../../types";
import { useTheme } from "../../../../context/ThemeContext";
import ChangePasswordModal from "./ChangePasswordModal"; 

export default function Layout() {
    const location = useLocation();
    const { mode, toggleTheme } = useTheme();
    const [showSidebar, setShowSidebar] = useState(false);
    
    const isActive = (path: string) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    const user = useSessionStore((s) => s.user);
    const [ingenio, setIngenio] = useState<Ingenio>();
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

    const initials = user?.name 
        ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
        : "U";

    // Navegación para usuarios normales (móvil)
    const normalUserNavItems = [
        { to: "/", icon: "🏠", label: "Inicio" },
        { to: "/maquinas", icon: "⚙️", label: "Máquinas" },
        { to: "/sensores", icon: "📊", label: "Sensores" },
        { to: "/mantenimientos", icon: "🔧", label: "Manten." },
        { to: "/fallos", icon: "⚠️", label: "Fallos" },
    ];

    // Navegación para superadmin (móvil)
    const superadminNavItems = [
        { to: "/", icon: "🏠", label: "Inicio" },
        { to: "/ingenios", icon: "🏭", label: "Ingenios" },
        { to: "/usuarios", icon: "👥", label: "Usuarios" },
        { to: "/maquinas", icon: "⚙️", label: "Máquinas" },
        { to: "/sensores", icon: "📊", label: "Sensores" },
    ];

    const mobileNavItems = user?.role === ROLES.SUPERADMIN ? superadminNavItems : normalUserNavItems;

    return (
        <Container>
            {/* MOBILE HEADER */}
            <MobileHeader>
                <MobileMenuButton onClick={() => setShowSidebar(!showSidebar)}>
                    <span>{showSidebar ? "✕" : "☰"}</span>
                </MobileMenuButton>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <Title style={{ fontSize: '16px', margin: 0 }}>
                        <span>📡</span>
                        {user?.role === ROLES.SUPERADMIN ? "Panel Superadmin" : (ingenio?.name || "Sistema")}
                    </Title>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <ThemeToggleButton onClick={toggleTheme} title={`Cambiar a modo ${mode === 'light' ? 'oscuro' : 'claro'}`}>
                        {mode === 'light' ? '🌙' : '☀️'}
                    </ThemeToggleButton>
                </div>
            </MobileHeader>

            {/* SIDEBAR DESKTOP/TABLET */}
            <Sidebar $isOpen={showSidebar}>
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
                            <NavLinkStyled to="/" $active={isActive("/")} onClick={() => setShowSidebar(false)}>
                                <span>🏠</span> Dashboard
                            </NavLinkStyled>
                            <NavLinkStyled to="/ingenios" $active={isActive("/ingenios")} onClick={() => setShowSidebar(false)}>
                                <span>🏭</span> Ingenios
                            </NavLinkStyled>
                            <NavLinkStyled to="/usuarios" $active={isActive("/usuarios")} onClick={() => setShowSidebar(false)}>
                                <span>👥</span> Usuarios
                            </NavLinkStyled>
                            <NavLinkStyled to="/maquinas" $active={isActive("/maquinas")} onClick={() => setShowSidebar(false)}>
                                <span>⚙️</span> Máquinas
                            </NavLinkStyled>
                            <NavLinkStyled to="/sensores" $active={isActive("/sensores")} onClick={() => setShowSidebar(false)}>
                                <span>📊</span> Sensores
                            </NavLinkStyled>
                        </>
                    ) : (
                        <>
                            <NavLinkStyled to="/" $active={isActive("/")} onClick={() => setShowSidebar(false)}>
                                <span>🏠</span> Dashboard
                            </NavLinkStyled>
                            <NavLinkStyled to="/maquinas" $active={isActive("/maquinas")} onClick={() => setShowSidebar(false)}>
                                <span>⚙️</span> Máquinas
                            </NavLinkStyled>
                            <NavLinkStyled to="/sensores" $active={isActive("/sensores")} onClick={() => setShowSidebar(false)}>
                                <span>📊</span> Sensores
                            </NavLinkStyled>
                            <NavLinkStyled to="/mantenimientos" $active={isActive("/mantenimientos")} onClick={() => setShowSidebar(false)}>
                                <span>🔧</span> Mantenimientos
                            </NavLinkStyled>
                            <NavLinkStyled to="/fallos" $active={isActive("/fallos")} onClick={() => setShowSidebar(false)}>
                                <span>⚠️</span> Fallos
                            </NavLinkStyled>
                            <NavLinkStyled to="/tecnicos" $active={isActive("/tecnicos")} onClick={() => setShowSidebar(false)}>
                                <span>👷‍♂️</span> Técnicos
                            </NavLinkStyled>
                            <NavLinkStyled to="/usuarios" $active={isActive("/usuarios")} onClick={() => setShowSidebar(false)}>
                                <span>👥</span> Usuarios
                            </NavLinkStyled>
                            <NavLinkStyled to="/reportes" $active={isActive("/reportes")} onClick={() => setShowSidebar(false)}>
                                <span>📑</span> Reportes
                            </NavLinkStyled>
                            <NavLinkStyled to="/analisis" $active={isActive("/analisis")} onClick={() => setShowSidebar(false)}>
                                <span>📈</span> Análisis
                            </NavLinkStyled>
                            <NavLinkStyled to="/historial" $active={isActive("/historial")} onClick={() => setShowSidebar(false)}>
                                <span>🧾</span> Historial
                            </NavLinkStyled>
                        </>
                    )}
                </Nav>

                <SidebarFooter>
                    <div style={{display: 'flex', alignItems: 'center', gap: 12, width: '100%'}}>
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
                            onClick={() => {
                                setShowPasswordModal(true);
                                setShowSidebar(false);
                            }}
                            title="Cambiar contraseña"
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(125,125,125,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <UserAvatar>{initials}</UserAvatar>
                            <UserInfo>
                                <span className="name">{user?.name || "Usuario"}</span>
                                <span className="role">{user?.role || "Invitado"}</span>
                            </UserInfo>
                        </div>

                        <ThemeToggleButton onClick={toggleTheme} title={`Cambiar a modo ${mode === 'light' ? 'oscuro' : 'claro'}`}>
                            {mode === 'light' ? '🌙' : '☀️'}
                        </ThemeToggleButton>

                        <LogoutButton 
                            onClick={() => useSessionStore.getState().logout()}
                            title="Cerrar Sesión"
                        >
                            🚪
                        </LogoutButton>
                    </div>
                </SidebarFooter>
            </Sidebar>

            {/* MOBILE BOTTOM NAVIGATION */}
            <MobileBottomNav>
                {mobileNavItems.map((item) => (
                    <MobileNavItem 
                        key={item.to}
                        to={item.to} 
                        $active={isActive(item.to)}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </MobileNavItem>
                ))}
            </MobileBottomNav>

            <MainContent>
                <Outlet />
            </MainContent>

            {showPasswordModal && (
                <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
            )}

            {/* Overlay para cerrar sidebar en móvil */}
            {showSidebar && (
                <MobileOverlay onClick={() => setShowSidebar(false)} />
            )}
        </Container>
    );
}