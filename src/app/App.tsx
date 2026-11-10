import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import { RolePreviewProvider } from '../contexts/RolePreviewContext';
import { ToastProvider } from '../components/common/Toast';
import { AppRoutes } from '../routes/AppRoutes';
import { AuthModal } from '../components/common/AuthModal';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <RolePreviewProvider>
            <AppRoutes />
            <AuthModal />
          </RolePreviewProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;

