import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter basename={BASE}>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/plugins" element={<PluginList />} />
              <Route path="/plugins/:name" element={<PluginDetail />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
