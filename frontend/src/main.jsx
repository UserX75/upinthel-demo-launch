import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import { CartProvider } from './context/CartContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MusicPlayerProvider>
        <CartProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </CartProvider>
      </MusicPlayerProvider>
    </AuthProvider>
  </React.StrictMode>
);