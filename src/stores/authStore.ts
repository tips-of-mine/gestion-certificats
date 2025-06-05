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

// Mock user data - in a real app, this would be stored securely on the server
const initialUsers = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' as const },
  { id: '2', username: 'user', password: 'user123', role: 'user' as const }
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: [],
      
      initialize: () => {
        // Check if we have users, if not add the initial ones
        const { users } = get();
        if (users.length === 0) {
          set({ users: initialUsers });
        }
      },
      
      login: async (username: string, password: string) => {
        // In a real app, this would be an API call
        const { users } = get();
        const user = users.find(u => 
          u.username === username && 
          // In a real app, passwords would be hashed
          (u as any).password === password
        );
        
        if (user) {
          // Remove password before storing in state
          const { password: _, ...userWithoutPassword } = user as any;
          set({ user: userWithoutPassword, isAuthenticated: true });
          return true;
        }
        
        return false;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      addUser: (username: string, password: string, role: 'admin' | 'user') => {
        const { users } = get();
        const newUser = {
          id: Date.now().toString(),
          username,
          password,
          role
        };
        
        set({ users: [...users, newUser] });
      },
      
      deleteUser: (id: string) => {
        const { users, user } = get();
        
        // Prevent deleting your own account
        if (user?.id === id) {
          return;
        }
        
        set({ users: users.filter(u => u.id !== id) });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ users: state.users }),
    }
  )
);