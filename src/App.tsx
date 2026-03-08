import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkeletonPage, SkeletonTable, SkeletonDetail } from './components/Skeleton';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const RecipeList = lazy(() => import('./pages/RecipeList').then(m => ({ default: m.RecipeList })));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail').then(m => ({ default: m.RecipeDetail })));
const PluginList = lazy(() => import('./pages/PluginList').then(m => ({ default: m.PluginList })));
const PluginDetail = lazy(() => import('./pages/PluginDetail').then(m => ({ default: m.PluginDetail })));

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <ErrorBoundary>
                    <Routes>
                        <Route path="/" element={<Suspense fallback={<SkeletonPage />}><Dashboard /></Suspense>} />
                        <Route path="/plugins" element={<Suspense fallback={<SkeletonTable />}><PluginList /></Suspense>} />
                        <Route
                            path="/plugins/:name"
                            element={
                                <Suspense fallback={<SkeletonDetail />}>
                                    <PluginDetail />
                                </Suspense>
                            }
                        />
                        <Route path="/recipes" element={<Suspense fallback={<SkeletonTable />}><RecipeList /></Suspense>} />
                        <Route path="/recipes/:id" element={<Suspense fallback={<SkeletonDetail />}><RecipeDetail /></Suspense>} />
                    </Routes>
                </ErrorBoundary>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
