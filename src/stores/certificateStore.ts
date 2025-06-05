import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Certificate = {
  id: string;
  name: string;
  domain: string;
  issuedDate: string;
  expiryDate: string;
  isRevoked: boolean;
  revokedBy?: string;
  revokedDate?: string;
};

type HistoryEntry = {
  id: string;
  action: 'create' | 'revoke';
  certificateName: string;
  username: string;
  timestamp: string;
};

type CertificateStore = {
  certificates: Certificate[];
  history: HistoryEntry[];
  addCertificate: (name: string, domain: string, username: string) => void;
  revokeCertificate: (id: string, username: string) => void;
  fetchCertificates: () => Promise<void>;
};

// Mock data - In a real app, this would come from an API
const mockCertificates: Certificate[] = [
  {
    id: '1',
    name: 'example.com',
    domain: 'example.com',
    issuedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
    isRevoked: false
  },
  {
    id: '2',
    name: 'api.example.com',
    domain: 'api.example.com',
    issuedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000).toISOString(),
    isRevoked: true,
    revokedBy: 'admin',
    revokedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'dev.example.com',
    domain: 'dev.example.com',
    issuedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000).toISOString(),
    isRevoked: false
  }
];

export const useCertificateStore = create<CertificateStore>()(
  persist(
    (set, get) => ({
      certificates: [],
      history: [],
      
      fetchCertificates: async () => {
        // In a real app, this would be an API call
        // Mock initial data if the store is empty
        const { certificates } = get();
        if (certificates.length === 0) {
          set({ certificates: mockCertificates });
        }
      },
      
      addCertificate: (name, domain, username) => {
        const { certificates, history } = get();
        
        // Create new certificate
        const newCertificate: Certificate = {
          id: Date.now().toString(),
          name,
          domain,
          issuedDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          isRevoked: false
        };
        
        // Create history entry
        const historyEntry: HistoryEntry = {
          id: Date.now().toString(),
          action: 'create',
          certificateName: name,
          username,
          timestamp: new Date().toISOString()
        };
        
        set({
          certificates: [...certificates, newCertificate],
          history: [...history, historyEntry]
        });
      },
      
      revokeCertificate: (id, username) => {
        const { certificates, history } = get();
        
        const updatedCertificates = certificates.map(cert => {
          if (cert.id === id) {
            return {
              ...cert,
              isRevoked: true,
              revokedBy: username,
              revokedDate: new Date().toISOString()
            };
          }
          return cert;
        });
        
        const revokedCert = certificates.find(cert => cert.id === id);
        
        if (revokedCert) {
          const historyEntry: HistoryEntry = {
            id: Date.now().toString(),
            action: 'revoke',
            certificateName: revokedCert.name,
            username,
            timestamp: new Date().toISOString()
          };
          
          set({
            certificates: updatedCertificates,
            history: [...history, historyEntry]
          });
        }
      }
    }),
    {
      name: 'certificate-storage',
      partialize: (state) => ({ certificates: state.certificates, history: state.history }),
    }
  )
);