import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore, User } from '../stores/authStore';
import { UserPlus, Trash2, User as UserIcon } from 'lucide-react';

type FormData = {
  username: string;
  password: string;
  role: 'admin' | 'user';
};

type UserWithPassword = User & {
  password?: string;
};

export default function UserManagement() {
  const { t } = useTranslation();
  const { users, addUser, deleteUser, user: currentUser } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    role: 'user'
  });
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Only admins can access this page
  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
          {t('userManagement.unauthorized')}
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          {t('userManagement.adminOnly')}
        </p>
      </div>
    );
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(formData.username, formData.password, formData.role);
    // Reset form
    setFormData({
      username: '',
      password: '',
      role: 'user'
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('userManagement.title')}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('userManagement.subtitle')}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {t('userManagement.addUser')}
          </h3>
          
          <form onSubmit={handleAddUser} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('userManagement.form.username')}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="username"
                    id="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('userManagement.form.password')}
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('userManagement.form.role')}
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  >
                    <option value="user">{t('userManagement.form.roles.user')}</option>
                    <option value="admin">{t('userManagement.form.roles.admin')}</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UserPlus size={16} className="mr-2" />
                  {t('userManagement.form.submit')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {t('userManagement.usersList')}
          </h3>
        </div>
        
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.filter(u => (u as UserWithPassword).password).map((user) => (
            <li key={user.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.role === 'admin' 
                        ? t('userManagement.form.roles.admin')
                        : t('userManagement.form.roles.user')
                      }
                    </div>
                  </div>
                </div>
                
                <div>
                  {/* Don't allow deleting yourself */}
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => setUserToDelete(user)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setUserToDelete(null)}></div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full z-10">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      {t('userManagement.modal.title')}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('userManagement.modal.description', { username: userToDelete.username })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    deleteUser(userToDelete.id);
                    setUserToDelete(null);
                  }}
                >
                  {t('userManagement.modal.confirm')}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setUserToDelete(null)}
                >
                  {t('userManagement.modal.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}