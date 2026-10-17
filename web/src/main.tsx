import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import { RequireAuth } from './components/ui';
import { AuthProvider } from './lib/auth';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Explore from './pages/Explore';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import WorkPage from './pages/WorkPage';
import './styles.css';

/** laud.pro/@name → profile. laud.pro/name (no @) redirects to the @ form. */
function HandleRoute() {
  const { handle = '' } = useParams();
  if (handle.startsWith('@')) return <Profile />;
  if (/^[a-z0-9_]{3,30}$/i.test(handle)) return <Navigate to={`/@${handle.toLowerCase()}`} replace />;
  return <NotFound />;
}

function HandleWorkRoute() {
  const { handle = '' } = useParams();
  return handle.startsWith('@') ? <WorkPage /> : <NotFound />;
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/explore', element: <Explore /> },
      { path: '/how-it-works', element: <HowItWorks /> },
      { path: '/login', element: <Login /> },
      { path: '/dashboard', element: <RequireAuth><Dashboard /></RequireAuth> },
      { path: '/settings', element: <RequireAuth><Settings /></RequireAuth> },
      { path: '/new', element: <RequireAuth><Editor key="new" /></RequireAuth> },
      { path: '/edit/:id', element: <RequireAuth><Editor /></RequireAuth> },
      { path: '/:handle', element: <HandleRoute /> },
      { path: '/:handle/:slug', element: <HandleWorkRoute /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
