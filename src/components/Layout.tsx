import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import ViewListOutlined from '@mui/icons-material/ViewListOutlined';
import ScienceOutlined from '@mui/icons-material/ScienceOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { colors } from '../theme';

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardOutlined /> },
  { label: 'Plugins', path: '/plugins', icon: <ViewListOutlined /> },
  { label: 'Recipes', path: '/recipes', icon: <ScienceOutlined /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    if (!isDesktop) setMobileOpen(false);
  };

  const sidebar = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.bg.sidebar,
        borderRight: `1px solid ${colors.border.default}`,
      }}
    >
      <Box sx={{ px: 2.5, pt: 3, pb: 2, position: 'relative' }}>
        {!isDesktop && (
          <IconButton
            onClick={() => setMobileOpen(false)}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, color: colors.text.secondary }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src={`${import.meta.env.BASE_URL}jenkins.svg`}
            alt="Jenkins"
            sx={{ width: 80, height: 110, flexShrink: 0 }}
          />
          <Box sx={{ fontWeight: 800, fontSize: '1.3rem', color: colors.text.primary, lineHeight: 1.2 }}>
            Jenkins Plugin Modernizer Statistics
          </Box>
        </Box>
        <Box sx={{ fontSize: '0.90rem', color: colors.text.secondary, mt: 5, lineHeight: 1.4 }}>
          A visualization dashboard for tracking the modernization progress of the Jenkins plugin modernizer tool.
        </Box>
      </Box>

      <List sx={{ flex: 1, pt: 1, borderTop: `1px solid ${colors.border.default}` }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => handleNav(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                mb: 0.5,
                color: active ? colors.white : colors.text.secondary,
                bgcolor: active ? colors.primary.main : 'transparent',
                '&:hover': {
                  bgcolor: active ? colors.primary.dark : colors.bg.hoverSubtle,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: '0.875rem' } } }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <jio-navbar property="https://plugins.jenkins.io/" theme="dark" />

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flex: 1 }}>
        {isDesktop ? (
          <Box component="nav" sx={{ width: 240, flexShrink: 0 }}>
            {sidebar}
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                bgcolor: colors.bg.paper,
                borderBottom: `1px solid ${colors.border.default}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="img"
                  src={`${import.meta.env.BASE_URL}jenkins.svg`}
                  alt="Jenkins"
                  sx={{ width: 32, height: 40 }}
                />
                <Box sx={{ fontWeight: 700, fontSize: '1rem', color: colors.text.primary }}>
                  Plugin Modernizer Stats
                </Box>
              </Box>
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: colors.text.primary }}>
                <MenuIcon />
              </IconButton>
            </Box>
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={() => setMobileOpen(false)}
              ModalProps={{ keepMounted: true }}
              sx={{ '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' } }}
            >
              {sidebar}
            </Drawer>
          </>
        )}

        <Box component="main" sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>

      <jio-footer
        property="https://plugins.jenkins.io/"
        githubRepo="jenkins-infra/plugin-modernizer-stats"
        githubBranch="main"
      />
    </Box>
  );
}
