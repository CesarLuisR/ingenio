import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
    MobileMenuOverlay,
    MobileMenuSheet,
    MobileMenuHeader,
    MobileMenuAvatar,
    MobileMenuUserInfo,
    MobileMenuSectionTitle,
    MobileMenuGrid,
    MobileMenuLink,
    MobileMenuActionRow,
    MobileMenuButton,
    GlobalHeaderControls,
    GlobalBackButton
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
    const navigate = useNavigate();
    const { mode, toggleTheme } = useTheme();
    
    // Sidebar logic (Desktop)
    const [showSidebar, setShowSidebar] = useState(false);

    // Mobile Menu logic
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    
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

    // --- Navigation Config ---

    // Full Links List (for Sidebar & Mobile Menu Grid)
    const renderNavLinks = () => {
        if (user?.role === ROLES.SUPERADMIN) {
            return (
                <>
                    <NavLinkStyled to="/" $active={isActive("/")} onClick={() => setShowSidebar(false)}><span>🏠</span> Dashboard</NavLinkStyled>
                    <NavLinkStyled to="/ingenios" $active={isActive("/ingenios")} onClick={() => setShowSidebar(false)}><span>🏭</span> Ingenios</NavLinkStyled>
                    <NavLinkStyled to="/usuarios" $active={isActive("/usuarios")} onClick={() => setShowSidebar(false)}><span>👥</span> Usuarios</NavLinkStyled>
                    <NavLinkStyled to="/maquinas" $active={isActive("/maquinas")} onClick={() => setShowSidebar(false)}><span>⚙️</span> Máquinas</NavLinkStyled>
                    <NavLinkStyled to="/sensores" $active={isActive("/sensores")} onClick={() => setShowSidebar(false)}><span>📊</span> Sensores</NavLinkStyled>
                </>
            );
        }
        return (
            <>
                <NavLinkStyled to="/" $active={isActive("/")} onClick={() => setShowSidebar(false)}><span>🏠</span> Dashboard</NavLinkStyled>
                <NavLinkStyled to="/maquinas" $active={isActive("/maquinas")} onClick={() => setShowSidebar(false)}><span>⚙️</span> Máquinas</NavLinkStyled>
                <NavLinkStyled to="/sensores" $active={isActive("/sensores")} onClick={() => setShowSidebar(false)}><span>📊</span> Sensores</NavLinkStyled>
                <NavLinkStyled to="/mantenimientos" $active={isActive("/mantenimientos")} onClick={() => setShowSidebar(false)}><span>🔧</span> Mantenimientos</NavLinkStyled>
                <NavLinkStyled to="/fallos" $active={isActive("/fallos")} onClick={() => setShowSidebar(false)}><span>⚠️</span> Fallos</NavLinkStyled>
                <NavLinkStyled to="/tecnicos" $active={isActive("/tecnicos")} onClick={() => setShowSidebar(false)}><span>👷‍♂️</span> Técnicos</NavLinkStyled>
                <NavLinkStyled to="/usuarios" $active={isActive("/usuarios")} onClick={() => setShowSidebar(false)}><span>👥</span> Usuarios</NavLinkStyled>
                <NavLinkStyled to="/reportes" $active={isActive("/reportes")} onClick={() => setShowSidebar(false)}><span>📑</span> Reportes</NavLinkStyled>
                <NavLinkStyled to="/analisis" $active={isActive("/analisis")} onClick={() => setShowSidebar(false)}><span>📈</span> Análisis</NavLinkStyled>
                <NavLinkStyled to="/historial" $active={isActive("/historial")} onClick={() => setShowSidebar(false)}><span>🧾</span> Historial</NavLinkStyled>
            </>
        );
    };

    // Mobile Bottom Tabs (Priority Items)
    const getMobileTabs = () => {
        if (user?.role === ROLES.SUPERADMIN) {
            return [
                { to: "/", icon: "🏠", label: "Inicio" },
                { to: "/ingenios", icon: "🏭", label: "Ingenios" },
                { to: "/usuarios", icon: "👥", label: "Usuarios" },
                { to: "/maquinas", icon: "⚙️", label: "Máquinas" },
            ];
        }
        return [
            { to: "/", icon: "🏠", label: "Inicio" },
            { to: "/maquinas", icon: "⚙️", label: "Máquinas" },
            { to: "/sensores", icon: "📊", label: "Sensores" },
            { to: "/analisis", icon: "📈", label: "Análisis" },
        ];
    };

    const mobileTabs = getMobileTabs();

    // Mobile Menu Grid Items (All available links)
    const getAllLinks = () => {
         if (user?.role === ROLES.SUPERADMIN) {
            return [
                { to: "/", icon: "🏠", label: "Dashboard" },
                { to: "/ingenios", icon: "🏭", label: "Ingenios" },
                { to: "/usuarios", icon: "👥", label: "Usuarios" },
                { to: "/maquinas", icon: "⚙️", label: "Máquinas" },
                { to: "/sensores", icon: "📊", label: "Sensores" },
            ];
        }
        return [
            { to: "/", icon: "🏠", label: "Dashboard" },
            { to: "/maquinas", icon: "⚙️", label: "Máquinas" },
            { to: "/sensores", icon: "📊", label: "Sensores" },
            { to: "/mantenimientos", icon: "🔧", label: "Manten." },
            { to: "/fallos", icon: "⚠️", label: "Fallos" },
            { to: "/tecnicos", icon: "👷‍♂️", label: "Técnicos" },
            { to: "/usuarios", icon: "👥", label: "Usuarios" },
            { to: "/reportes", icon: "📑", label: "Reportes" },
            { to: "/analisis", icon: "📈", label: "Análisis" },
            { to: "/historial", icon: "🧾", label: "Historial" },
        ];
    }

    const allLinks = getAllLinks();

    const handleLogout = () => {
        useSessionStore.getState().logout();
    };

    // --- Global Back Button Logic ---
    // Show back button if deeper than 2 levels (e.g. /sensores/123)
    // or if the current path is NOT one of the main root paths.
    // Simplest approach: count slashes. Root paths usually have 1 slash (e.g. /sensores).
    // Detail pages have 2 slashes (e.g. /sensores/123).
    // Dashboard is just /.
    const showBackButton = location.pathname.split('/').filter(Boolean).length >= 2;

    return (
        <Container>
            {/* SIDEBAR (Desktop/Tablet) */}
            <Sidebar $isOpen={showSidebar}>
                <SidebarHeader>
                    <Title>
                        <span>📡</span>
                        {user?.role === ROLES.SUPERADMIN ? "Panel Superadmin" : (ingenio?.name || "Cargando...")}
                    </Title>
                    <Subtitle>Sistema de Monitoreo</Subtitle>
                </SidebarHeader>

                <Nav>
                    {renderNavLinks()}
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

                        <LogoutButton onClick={handleLogout} title="Cerrar Sesión">
                            🚪
                        </LogoutButton>
                    </div>
                </SidebarFooter>
            </Sidebar>

            {/* MAIN CONTENT */}
            <MainContent>
                {showBackButton && (
                    <GlobalHeaderControls>
                        <GlobalBackButton onClick={() => navigate(-1)} aria-label="Volver atrás">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </GlobalBackButton>
                    </GlobalHeaderControls>
                )}
                <Outlet />
            </MainContent>

            {/* MOBILE BOTTOM NAV */}
            <MobileBottomNav>
                {mobileTabs.map((item) => (
                    <MobileNavItem 
                        key={item.to}
                        to={item.to} 
                        $active={isActive(item.to) && !showMobileMenu}
                        onClick={() => setShowMobileMenu(false)}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </MobileNavItem>
                ))}
                
                {/* MENU TAB */}
                <MobileNavItem 
                    as="button" 
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    to=""
                    $active={showMobileMenu}
                >
                    <span className="icon">☰</span>
                    <span className="label">Menú</span>
                </MobileNavItem>
            </MobileBottomNav>

            {/* MOBILE MENU SHEET & OVERLAY */}
            <MobileMenuOverlay 
                $isOpen={showMobileMenu} 
                onClick={() => setShowMobileMenu(false)} 
            />
            
            <MobileMenuSheet $isOpen={showMobileMenu}>
                <MobileMenuHeader>
                    <MobileMenuAvatar>{initials}</MobileMenuAvatar>
                    <MobileMenuUserInfo>
                        <strong>{user?.name || "Usuario"}</strong>
                        <span>{user?.role || "Rol"}</span>
                    </MobileMenuUserInfo>
                </MobileMenuHeader>

                <MobileMenuSectionTitle>Navegación</MobileMenuSectionTitle>
                <MobileMenuGrid>
                    {allLinks.map(link => (
                        <MobileMenuLink 
                            key={link.to} 
                            to={link.to} 
                            $active={isActive(link.to)}
                            onClick={() => setShowMobileMenu(false)}
                        >
                            <span>{link.icon}</span>
                            {link.label}
                        </MobileMenuLink>
                    ))}
                </MobileMenuGrid>

                <MobileMenuSectionTitle>Configuración</MobileMenuSectionTitle>
                <MobileMenuActionRow>
                    <MobileMenuButton 
                        className="primary" 
                        onClick={toggleTheme}
                    >
                        {mode === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
                    </MobileMenuButton>
                    <MobileMenuButton 
                        onClick={() => {
                            setShowPasswordModal(true);
                            setShowMobileMenu(false);
                        }}
                    >
                        🔑 Password
                    </MobileMenuButton>
                </MobileMenuActionRow>
                
                <MobileMenuButton 
                    className="danger" 
                    onClick={handleLogout}
                >
                    🚪 Cerrar Sesión
                </MobileMenuButton>
            </MobileMenuSheet>


            {/* Modals */}
            {showPasswordModal && (
                <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
            )}
        </Container>
    );
}