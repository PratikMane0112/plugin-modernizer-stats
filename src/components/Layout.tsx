import { useState, useCallback, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { LayoutDashboard, List as ListIcon, Beaker, Menu, X } from 'lucide-react';

const SIDEBAR_WIDTH = 256;

const NAV_ITEMS = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/plugins', label: 'Plugins', icon: ListIcon },
    { to: '/recipes', label: 'Recipes', icon: Beaker },
] as const;

const GithubIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

const sidebarBg = '#1a1d21';
const borderColor = '#1e293b';

const setFooterSkipReport = (el: HTMLElement | null) => {
    if (el && 'skipReportIssue' in el) {
        (el as HTMLElement & { skipReportIssue: boolean }).skipReportIssue = true;
    }
};

const SidebarContent = ({ onClose }: { onClose: () => void }) => {
    const location = useLocation();
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: sidebarBg }}>
            {/* Logo / Title */}
            <Box sx={{ p: 3, borderBottom: `1px solid ${borderColor}` }}>
                <Box
                    component={Link}
                    to="/"
                    onClick={onClose}
                    sx={{ display: 'block', textDecoration: 'none' }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box component="img" src="/jenkins.svg" alt="Jenkins Logo" sx={{ width: 112, height: 112 }} />
                        <Typography
                            variant="h6"
                            sx={{ color: '#f1f5f9', fontWeight: 700, fontFamily: 'Georgia, serif', lineHeight: 1.3 }}
                        >
                            Jenkins Plugin Modernizer Statistics
                        </Typography>
                    </Box>
                </Box>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
                    A visualization dashboard for tracking the modernization progress of the Jenkins plugin modernizer tool.
                </Typography>
            </Box>

            {/* Nav links */}
            <List sx={{ p: 1.5, flexGrow: 1 }}>
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
                    return (
                        <ListItemButton
                            key={to}
                            component={Link}
                            to={to}
                            onClick={onClose}
                            aria-current={isActive ? 'page' : undefined}
                            sx={{
                                borderRadius: '8px',
                                mb: 0.5,
                                px: 2,
                                py: 1.25,
                                bgcolor: isActive ? '#2563eb' : 'transparent',
                                color: isActive ? '#fff' : '#94a3b8',
                                boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.2)' : 'none',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: isActive ? '#2563eb' : 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                                <Icon size={20} aria-hidden="true" />
                            </ListItemIcon>
                            <ListItemText
                                primary={label}
                                slotProps={{ primary: { sx: { fontWeight: 500, fontSize: '0.9375rem' } } }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            {/* Footer data source link */}
            <Box sx={{ p: 2, borderTop: `1px solid #334155` }}>
                <Box
                    component="a"
                    href="https://github.com/jenkins-infra/metadata-plugin-modernizer"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: '#94a3b8',
                        fontSize: '0.8125rem',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                        '&:hover': { color: '#f1f5f9' },
                    }}
                >
                    <GithubIcon size={16} />
                    Data Source
                </Box>
            </Box>
        </Box>
    );
};

export const Layout = ({ children }: { children: ReactNode }) => {
    const theme = useTheme();
    const location = useLocation();
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const footerRef = useCallback((el: HTMLElement | null) => {
        setFooterSkipReport(el);
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Jenkins.io chrome + mobile app toolbar (replaces duplicate MUI AppBar) */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: theme.zIndex.drawer + 1,
                    bgcolor: '#15171a',
                }}
            >
                <jio-navbar
                    property="https://www.jenkins.io"
                    theme="dark"
                    locationPathname={location.pathname}
                    showSearchBox={false}
                />
                {!isDesktop && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            minHeight: 48,
                            px: 1,
                            borderBottom: `1px solid ${borderColor}`,
                            bgcolor: sidebarBg,
                        }}
                    >
                        <Box
                            component={Link}
                            to="/"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', minWidth: 0 }}
                            aria-label="Home"
                        >
                            <Box component="img" src="/jenkins.svg" alt="" sx={{ width: 28, height: 28, flexShrink: 0 }} />
                            <Typography sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Plugin Modernizer Stats
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={() => setMobileOpen(o => !o)}
                            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                            aria-expanded={mobileOpen}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#f1f5f9', bgcolor: '#334155' } }}
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </IconButton>
                    </Box>
                )}
            </Box>

            <Box sx={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0 }}>
                {/* Desktop permanent sidebar */}
                {isDesktop ? (
                    <Box
                        component="aside"
                        aria-label="Main navigation"
                        sx={{
                            width: SIDEBAR_WIDTH,
                            flexShrink: 0,
                            borderRight: `1px solid ${borderColor}`,
                        }}
                    >
                        <Box sx={{ position: 'sticky', top: 0, height: '100%', maxHeight: '100vh', overflowY: 'auto' }}>
                            <SidebarContent onClose={() => { }} />
                        </Box>
                    </Box>
                ) : (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={() => setMobileOpen(false)}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            zIndex: theme.zIndex.drawer,
                            '& .MuiDrawer-paper': {
                                width: SIDEBAR_WIDTH,
                                bgcolor: sidebarBg,
                                border: 'none',
                                borderRight: `1px solid ${borderColor}`,
                            },
                        }}
                        aria-label="Navigation drawer"
                    >
                        <SidebarContent onClose={() => setMobileOpen(false)} />
                    </Drawer>
                )}

                <Box
                    component="main"
                    role="main"
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        overflowX: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            flex: 1,
                            p: { xs: 2, md: 3, lg: 4 },
                            overflowX: 'hidden',
                        }}
                    >
                        <Box sx={{ maxWidth: '1400px', mx: 'auto', width: '100%' }}>
                            {children}
                        </Box>
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                        <jio-footer
                            ref={footerRef}
                            property="https://www.jenkins.io"
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
