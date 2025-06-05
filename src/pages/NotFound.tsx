import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-extrabold text-blue-600 dark:text-blue-400">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('notFound.title')}
          </h2>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            {t('notFound.message')}
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="mr-2 h-4 w-4" />
              {t('notFound.backHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}