import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type User = {
  id: string;
  username: string;
  role: 'admin' | 'user';
};

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  users: User[];
  initialize: () => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (username: string, password: string, role: 'admin' | 'user') => void;
  deleteUser: (id: string) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: [],
      
      initialize: () => {
        // Fetch users from the API
        fetch('/api/users')
          .then(response => {
            if (!response.ok) throw new Error('Failed to fetch users');
            return response.json();
          })
          .then(data => {
            if (data.users && Array.isArray(data.users)) {
              set({ users: data.users });
            }
          })
          .catch(error => {
            console.error('Error initializing users:', error);
            // Fallback to initial users if API fails
            const { users } = get();
            if (users.length === 0) {
              const initialUsers = [
                { id: '1', username: 'admin', role: 'admin' as const },
                { id: '2', username: 'user', role: 'user' as const }
              ];
              set({ users: initialUsers });
            }
          });
      },
      
      login: async (username: string, password: string) => {
        try {
          // In a real app, this would be an API call
          const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });
          
          if (!response.ok) {
            return false;
          }
          
          const data = await response.json();
          if (data.success && data.user) {
            set({ user: data.user, isAuthenticated: true });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Login error:', error);
          
          // Fallback to mock login if API fails
          const { users } = get();
          const user = users.find(u => u.username === username);
          
          if (user) {
            // In a real app, we'd verify the password here
            // For demo purposes, accept any password when API is down
            set({ user, isAuthenticated: true });
            return true;
          }
          
          return false;
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      addUser: (username: string, password: string, role: 'admin' | 'user') => {
        try {
          // Call the API to create a user
          fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, role }),
          }).then(response => {
            if (!response.ok) {
              throw new Error('Failed to create user');
            }
            return response.json();
          }).then(data => {
            if (data.success && data.user) {
              const { users } = get();
              set({ users: [...users, data.user] });
            }
          });
        } catch (error) {
          console.error('Error creating user:', error);
          
          // Fallback to local state update if API fails
          const { users } = get();
          const newUser = {
            id: Date.now().toString(),
            username,
            role
          };
          
          set({ users: [...users, newUser] });
        }
      },
      
      deleteUser: (id: string) => {
        try {
          // Call the API to delete a user
          fetch('/api/users', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
          }).then(response => {
            if (!response.ok) {
              throw new Error('Failed to delete user');
            }
            
            const { users, user } = get();
            
            // Prevent deleting your own account
            if (user?.id === id) {
              return;
            }
            
            set({ users: users.filter(u => u.id !== id) });
          });
        } catch (error) {
          console.error('Error deleting user:', error);
          
          // Fallback to local state update if API fails
          const { users, user } = get();
          
          // Prevent deleting your own account
          if (user?.id === id) {
            return;
          }
          
          set({ users: users.filter(u => u.id !== id) });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ users: state.users }),
    }
  )
);