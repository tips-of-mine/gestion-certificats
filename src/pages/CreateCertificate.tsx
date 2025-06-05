import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useCertificateStore } from '../stores/certificateStore';
import { useAuthStore } from '../stores/authStore';
import { Shield } from 'lucide-react';

type FormData = {
  domain: string;
  additionalParam: string;
};

export default function CreateCertificate() {
  const { t } = useTranslation();
  const { addCertificate } = useCertificateStore();
  const { user } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    if (user) {
      // In a real application, this would call an API to run the script
      // /root/scripts/create_cert.sh with the domain and additionalParam
      addCertificate(data.domain, data.domain, user.username);
      
      // Show success message
      setIsSuccess(true);
      
      // Reset form
      reset();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('createCertificate.title')}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('createCertificate.subtitle')}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {isSuccess && (
            <div className="mb-4 p-4 rounded-md bg-green-50 dark:bg-green-900/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-400 dark:text-green-300\" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                    {t('createCertificate.successMessage')}
                  </h3>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('createCertificate.form.domain.label')}
              </label>
              <div className="mt-1">
                <input
                  id="domain"
                  type="text"
                  {...register('domain', {
                    required: t('createCertificate.form.domain.required') as string,
                    pattern: {
                      value: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
                      message: t('createCertificate.form.domain.pattern') as string
                    }
                  })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder="example.com"
                />
                {errors.domain && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.domain.message}</p>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('createCertificate.form.domain.help')}
              </p>
            </div>
            
            <div>
              <label htmlFor="additionalParam" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('createCertificate.form.additionalParam.label')}
              </label>
              <div className="mt-1">
                <input
                  id="additionalParam"
                  type="text"
                  {...register('additionalParam', {
                    required: t('createCertificate.form.additionalParam.required') as string
                  })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
                {errors.additionalParam && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.additionalParam.message}</p>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('createCertificate.form.additionalParam.help')}
              </p>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('common.loading') : t('createCertificate.form.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}