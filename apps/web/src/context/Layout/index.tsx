import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useSessionStore } from "../../store/sessionStore";
import { api } from "../../lib/api";
import { ROLES, type Ingenio } from "../../types";
import { useTheme } from "../ThemeContext";
import ChangePasswordModal from "./ChangePasswordModal";

// --- ICONOS PROFESIONALES (LUCIDE) ---
import { 
    LuLayoutDashboard, 
    LuFactory, 
    LuUsers, 
    LuSettings2, // Para Máquinas
    LuActivity, // Para Sensores
    LuWrench, // Mantenimiento
    LuTriangleAlert,
    LuHardHat, // Técnicos
    LuFileText, // Reportes
    LuChartLine, // Análisis
    LuHistory, // Historial
    LuLogOut, 
    LuMoon, 
    LuSun, 
    LuKeyRound, 
    LuMenu, 
    LuArrowLeft,
    LuRadio // Icono del Header
} from "react-icons/lu";

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

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { mode, toggleTheme } = useTheme();
    
    // Sidebar & Mobile Menu State
    const [showSidebar, setShowSidebar] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    
    const user = useSessionStore((s) => s.user);
    const [ingenio, setIngenio] = useState<Ingenio>();
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // --- Cargar datos del Ingenio ---
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

    // --- Helpers ---
    const initials = user?.name 
        ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
        : "U";

    const isActive = (path: string) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        useSessionStore.getState().logout();
    };

    // --- CONFIGURACIÓN DE NAVEGACIÓN ---
    // Definimos los menús aquí para mantener el JSX limpio
    const NAV_ITEMS = useMemo(() => {
        const common = [
            { to: "/", label: "Dashboard", icon: LuLayoutDashboard },
            { to: "/maquinas", label: "Máquinas", icon: LuSettings2 },
            { to: "/sensores", label: "Sensores", icon: LuActivity },
        ];

        if (user?.role === ROLES.SUPERADMIN) {
            return [
                { to: "/", label: "Dashboard", icon: LuLayoutDashboard },
                { to: "/ingenios", label: "Ingenios", icon: LuFactory },
                { to: "/usuarios", label: "Usuarios", icon: LuUsers },
                { to: "/maquinas", label: "Máquinas", icon: LuSettings2 },
                { to: "/sensores", label: "Sensores", icon: LuActivity },
            ];
        }

        return [
            ...common,
            { to: "/mantenimientos", label: "Mantenimientos", icon: LuWrench },
            { to: "/fallos", label: "Fallos", icon: LuTriangleAlert},
            { to: "/tecnicos", label: "Técnicos", icon: LuHardHat },
            { to: "/usuarios", label: "Usuarios", icon: LuUsers },
            { to: "/reportes", label: "Reportes", icon: LuFileText },
            { to: "/analisis", label: "Análisis", icon: LuChartLine },
            { to: "/historial", label: "Historial", icon: LuHistory },
        ];
    }, [user?.role]);

    // Items para el Bottom Nav (Móvil) - Prioridad
    const MOBILE_TABS = useMemo(() => {
        const base = [
            { to: "/", label: "Inicio", icon: LuLayoutDashboard },
        ];

        if (user?.role === ROLES.SUPERADMIN) {
            return [
                ...base,
                { to: "/ingenios", label: "Ingenios", icon: LuFactory },
                { to: "/usuarios", label: "Usuarios", icon: LuUsers },
                { to: "/maquinas", label: "Máquinas", icon: LuSettings2 },
            ];
        }

        return [
            ...base,
            { to: "/maquinas", label: "Máquinas", icon: LuSettings2 },
            { to: "/sensores", label: "Sensores", icon: LuActivity },
            { to: "/analisis", label: "Análisis", icon: LuChartLine },
        ];
    }, [user?.role]);

    // Lógica del botón de volver atrás
    const showBackButton = location.pathname.split('/').filter(Boolean).length >= 2;

    return (
        <Container>
            {/* --- SIDEBAR (Desktop) --- */}
            <Sidebar $isOpen={showSidebar}>
                <SidebarHeader>
                    <Title>
                        <LuRadio size={24} color="var(--accent-primary)" />
                        <span>
                            {user?.role === ROLES.SUPERADMIN 
                                ? "Panel Superadmin" 
                                : (ingenio?.name || "Cargando...")}
                        </span>
                    </Title>
                    <Subtitle>Sistema de Monitoreo</Subtitle>
                </SidebarHeader>

                <Nav>
                    {NAV_ITEMS.map((item) => (
                        <NavLinkStyled 
                            key={item.to}
                            to={item.to} 
                            $active={isActive(item.to)} 
                            onClick={() => setShowSidebar(false)}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLinkStyled>
                    ))}
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
                                padding: '6px',
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

                        <ThemeToggleButton onClick={toggleTheme} title="Cambiar tema">
                            {mode === 'light' ? <LuMoon size={18} /> : <LuSun size={18} />}
                        </ThemeToggleButton>

                        <LogoutButton onClick={handleLogout} title="Cerrar Sesión">
                            <LuLogOut size={18} />
                        </LogoutButton>
                    </div>
                </SidebarFooter>
            </Sidebar>

            {/* --- MAIN CONTENT --- */}
            <MainContent>
                {showBackButton && (
                    <GlobalHeaderControls>
                        <GlobalBackButton onClick={() => navigate(-1)} aria-label="Volver atrás">
                            <LuArrowLeft size={20} />
                        </GlobalBackButton>
                    </GlobalHeaderControls>
                )}
                <Outlet />
            </MainContent>

            {/* --- MOBILE BOTTOM NAV --- */}
            <MobileBottomNav>
                {MOBILE_TABS.map((item) => (
                    <MobileNavItem 
                        key={item.to}
                        to={item.to} 
                        $active={isActive(item.to) && !showMobileMenu}
                        onClick={() => setShowMobileMenu(false)}
                    >
                        <item.icon size={20} className="icon" />
                        <span className="label">{item.label}</span>
                    </MobileNavItem>
                ))}
                
                {/* MENU TOGGLE */}
                <MobileNavItem 
                    as="button" 
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    to=""
                    $active={showMobileMenu}
                >
                    <LuMenu size={24} className="icon" />
                    <span className="label">Menú</span>
                </MobileNavItem>
            </MobileBottomNav>

            {/* --- MOBILE MENU SHEET --- */}
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
                    {NAV_ITEMS.map(link => (
                        <MobileMenuLink 
                            key={link.to} 
                            to={link.to} 
                            $active={isActive(link.to)}
                            onClick={() => setShowMobileMenu(false)}
                        >
                            <link.icon size={24} style={{ marginBottom: 4 }} />
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
                        {mode === 'light' 
                            ? <><LuMoon size={16} /> Modo Oscuro</> 
                            : <><LuSun size={16} /> Modo Claro</>
                        }
                    </MobileMenuButton>
                    <MobileMenuButton 
                        onClick={() => {
                            setShowPasswordModal(true);
                            setShowMobileMenu(false);
                        }}
                    >
                        <LuKeyRound size={16} /> Password
                    </MobileMenuButton>
                </MobileMenuActionRow>
                
                <MobileMenuButton 
                    className="danger" 
                    onClick={handleLogout}
                    style={{ marginTop: 12 }}
                >
                    <LuLogOut size={16} /> Cerrar Sesión
                </MobileMenuButton>
            </MobileMenuSheet>

            {/* --- MODALS --- */}
            {showPasswordModal && (
                <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
            )}
        </Container>
    );
}