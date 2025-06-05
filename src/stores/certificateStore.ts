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

export const useCertificateStore = create<CertificateStore>()(
  persist(
    (set, get) => ({
      certificates: [],
      history: [],
      
      fetchCertificates: async () => {
        try {
          // In a real app, this would call the actual API
          // For now, we'll still use the mock data but pretend it's fetching from an API
          const response = await fetch('/api/certificates');
          const data = await response.json();
          set({ certificates: data.certificates });
          
          // Also fetch history
          const historyResponse = await fetch('/api/history');
          const historyData = await historyResponse.json();
          set({ history: historyData.history });
        } catch (error) {
          console.error('Error fetching certificates:', error);
          // If API fails, use mock data
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
          set({ certificates: mockCertificates });
        }
      },
      
      addCertificate: (name, domain, username) => {
        try {
          // Call the API to create a certificate
          fetch('/api/certificate/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              domain: name,
              additionalParam: domain,
              username: username
            }),
          }).then(response => {
            if (!response.ok) {
              throw new Error('Failed to create certificate');
            }
            // Refresh certificates after creating
            get().fetchCertificates();
          });
        } catch (error) {
          console.error('Error creating certificate:', error);
          
          // Fallback to local state update if API fails
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
        }
      },
      
      revokeCertificate: (id, username) => {
        try {
          // Call the API to revoke a certificate
          fetch('/api/certificate/revoke', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: id,
              username: username
            }),
          }).then(response => {
            if (!response.ok) {
              throw new Error('Failed to revoke certificate');
            }
            // Refresh certificates after revoking
            get().fetchCertificates();
          });
        } catch (error) {
          console.error('Error revoking certificate:', error);
          
          // Fallback to local state update if API fails
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
      }
    }),
    {
      name: 'certificate-storage',
      partialize: (state) => ({ certificates: state.certificates, history: state.history }),
    }
  )
);