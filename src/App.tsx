
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PluginList } from './pages/PluginList';
import { PluginDetail } from './pages/PluginDetail';
import { RecipeList } from './pages/RecipeList';
import { RecipeDetail } from './pages/RecipeDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plugins" element={<PluginList />} />
          <Route path="/plugins/:name" element={<PluginDetail />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
