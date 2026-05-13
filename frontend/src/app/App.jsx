import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { pageKeys } from '@/app/config/pageKeys';
import { Home } from '@/features/home/pages/Home';
import { JobSearch } from '@/features/jobs/pages/JobSearch';
import { CompanyList } from '@/features/companies/pages/CompanyList';
import { CompanyDetail } from '@/features/companies/pages/CompanyDetail';
import { Dashboard } from '@/features/dashboard/pages/Dashboard';
import { AdminPanel } from '@/features/admin/pages/AdminPanel';
import { JobDetail } from '@/features/jobs/pages/JobDetail';
import { Login } from '@/features/auth/pages/Login';
import { Signup } from '@/features/auth/pages/Signup';
import { About } from '@/features/about/pages/About';
import { PrivacyPolicy } from '@/features/legal/pages/PrivacyPolicy';
import { TermsOfService } from '@/features/legal/pages/TermsOfService';
import { CookiePolicy } from '@/features/legal/pages/CookiePolicy';
import { CookieConsent } from '@/features/legal/components/CookieConsent';
import { useAuth } from '@/features/auth/context/AuthContext';

const pageRoutes = {
  [pageKeys.home]: '/',
  [pageKeys.about]: '/sobre-nosotros',
  [pageKeys.jobs]: '/practicas',
  [pageKeys.companies]: '/empresas',
  [pageKeys.dashboard]: '/dashboard',
  [pageKeys.admin]: '/admin',
  [pageKeys.login]: '/login',
  [pageKeys.signup]: '/registro',
  [pageKeys.privacy]: '/privacidad',
  [pageKeys.terms]: '/terminos',
  [pageKeys.cookies]: '/cookies',
};

function buildUrlWithParams(path, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
        <p className="text-gray-700">Cargando...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function NotFound({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-md shadow-sm">
        <p className="text-sm text-purple-600 mb-2">404</p>
        <h1 className="text-2xl mb-3">Pagina no encontrada</h1>
        <p className="text-gray-600 mb-6">La ruta que has abierto no existe o ha cambiado.</p>
        <button
          type="button"
          onClick={() => onNavigate(pageKeys.home)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

function JobDetailRoute({ onNavigate }) {
  const { jobSlug } = useParams();
  const navigate = useNavigate();

  return <JobDetail jobId={jobSlug} onNavigate={onNavigate} onBack={() => navigate('/practicas')} />;
}

function CompanyDetailRoute({ onNavigate }) {
  const { companySlug } = useParams();
  return <CompanyDetail companyId={companySlug} onNavigate={onNavigate} />;
}

function LegacySharedJobRedirect() {
  const [searchParams] = useSearchParams();
  const sharedJob = searchParams.get('job');

  if (sharedJob) {
    return <Navigate to={`/practicas/${sharedJob}`} replace />;
  }

  return null;
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = (page, id, options = {}) => {
    if (page === pageKeys.jobDetail || page === 'job-detail') {
      navigate(id ? `/practicas/${id}` : '/practicas');
      return;
    }

    if (page === pageKeys.companyDetail || page === 'company-detail') {
      navigate(id ? `/empresas/${id}` : '/empresas');
      return;
    }

    if (page === pageKeys.jobs || page === 'jobs') {
      navigate(buildUrlWithParams('/practicas', options.filters || {}));
      return;
    }

    if (page === pageKeys.companies || page === 'companies') {
      navigate(buildUrlWithParams('/empresas', options.filters || {}));
      return;
    }

    navigate(pageRoutes[page] || pageRoutes[pageKeys.home]);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <LegacySharedJobRedirect />
      <Routes>
        <Route path="/" element={<Home onNavigate={navigateTo} />} />
        <Route path="/sobre-nosotros" element={<About onNavigate={navigateTo} />} />
        <Route path="/practicas" element={<JobSearch onNavigate={navigateTo} />} />
        <Route path="/practicas/:jobSlug" element={<JobDetailRoute onNavigate={navigateTo} />} />
        <Route path="/empresas" element={<CompanyList onNavigate={navigateTo} />} />
        <Route path="/empresas/:companySlug" element={<CompanyDetailRoute onNavigate={navigateTo} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard onNavigate={navigateTo} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel onNavigate={navigateTo} />
            </AdminRoute>
          }
        />
        <Route path="/login" element={<Login onNavigate={navigateTo} onSwitchToSignup={() => navigateTo(pageKeys.signup)} />} />
        <Route path="/registro" element={<Signup onNavigate={navigateTo} onSwitchToLogin={() => navigateTo(pageKeys.login)} />} />
        <Route path="/privacidad" element={<PrivacyPolicy onNavigate={navigateTo} />} />
        <Route path="/terminos" element={<TermsOfService onNavigate={navigateTo} />} />
        <Route path="/cookies" element={<CookiePolicy onNavigate={navigateTo} />} />
        <Route path="/jobs" element={<Navigate to="/practicas" replace />} />
        <Route path="/jobs/:jobSlug" element={<Navigate to={`/practicas/${location.pathname.split('/').pop()}`} replace />} />
        <Route path="/companies" element={<Navigate to="/empresas" replace />} />
        <Route path="/companies/:companySlug" element={<Navigate to={`/empresas/${location.pathname.split('/').pop()}`} replace />} />
        <Route path="/signup" element={<Navigate to="/registro" replace />} />
        <Route path="/privacy" element={<Navigate to="/privacidad" replace />} />
        <Route path="/terms" element={<Navigate to="/terminos" replace />} />
        <Route path="*" element={<NotFound onNavigate={navigateTo} />} />
      </Routes>
      <CookieConsent />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
