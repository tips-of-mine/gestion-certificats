import { useTranslation } from 'react-i18next';
import { GitBranch } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-col sm:flex-row gap-2">
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <span>&copy; {new Date().getFullYear()} Tips-Of-Mine</span>
          </div>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <a 
              href="https://github.com/tips-of-mine/certificate-manager" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <GitBranch size={16} className="mr-2" />
              {t('footer.repository')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}