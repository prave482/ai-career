'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#112034',
            color: '#f7f3ea',
            border: '1px solid rgba(240, 159, 65, 0.25)',
            borderRadius: '16px',
          },
        }}
      />
    </QueryClientProvider>
  );
}
