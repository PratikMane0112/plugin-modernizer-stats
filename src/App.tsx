import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Layout from './components/Layout';

const BASE = import.meta.env.BASE_URL;

function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Plugin Modernizer Stats
      </Typography>

      <Typography sx={{ fontSize: '1rem', mt: 2, color: 'text.secondary' }}>
        Work in progress: Dashboard, plugin list and recipe views coming soon…
      </Typography>
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter basename={BASE}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
