import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../components/common/Toast';
import { AppRoutes } from '../routes/AppRoutes';
import { AuthModal } from '../components/common/AuthModal';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
          <AuthModal />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;

