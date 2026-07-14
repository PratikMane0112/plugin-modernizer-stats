import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Layout from './components/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const PluginList = lazy(() => import('./pages/PluginList'));
const PluginDetail = lazy(() => import('./pages/PluginDetail'));

const BASE = import.meta.env.BASE_URL;

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <Layout>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plugins" element={<PluginList />} />
            <Route path="/plugins/:name" element={<PluginDetail key={location.pathname} />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter basename={BASE}>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
