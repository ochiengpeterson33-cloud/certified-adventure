import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  </QueryClientProvider>
);


