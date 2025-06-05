import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateCertificate from './pages/CreateCertificate';
import UserManagement from './pages/UserManagement';
import History from './pages/History';
import NotFound from './pages/NotFound';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { i18n } = useTranslation();
  const { initialize } = useAuthStore();
  const { isDarkMode, setDarkMode } = useThemeStore();
  
  useEffect(() => {
    // Initialize auth store
    initialize();
    
    // Set browser language or default to English
    const userLanguage = navigator.language.split('-')[0];
    const supportedLanguages = ['fr', 'en', 'de', 'it', 'pt', 'es'];
    const language = supportedLanguages.includes(userLanguage) ? userLanguage : 'en';
    i18n.changeLanguage(language);
  }, [i18n, initialize]);
  
  // Apply dark mode class to html element on mount
  useEffect(() => {
    // Apply initial dark mode class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Listen for system preference changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };
    
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, [isDarkMode, setDarkMode]);
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="create" element={<CreateCertificate />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="history" element={<History />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;