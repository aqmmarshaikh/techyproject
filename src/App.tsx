import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CyberpunkBackground } from './components/CyberpunkBackground';
import { AuthProvider } from './context/AuthContext';
import { VisitorProvider } from './context/VisitorContext';

import { ProtectedRoute } from './components/ProtectedRoute';
 
 // Lazy loaded pages
 const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
 const SubmitPage = lazy(() => import('./pages/SubmitPage').then(module => ({ default: module.SubmitPage })));
 const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage').then(module => ({ default: module.ProjectDetailPage })));
 const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
 const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
 const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
 const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
 const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
 const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
 const MyDashboard = lazy(() => import('./pages/MyDashboard').then(module => ({ default: module.MyDashboard })));
 
 const PageLoader = () => (
   <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
     <div className="loader"></div>
   </div>
 );
 
 const AnimatedRoutes = () => {
   const location = useLocation();
   
   useEffect(() => {
     console.log("AnimatedRoutes mounted");
     return () => {
       console.log("AnimatedRoutes unmounted");
     };
   }, []);
   
   return (
     <AnimatePresence>
       <Suspense fallback={<PageLoader />}>
         <Routes location={location} key={location.pathname}>
           <Route path="/" element={<HomePage />} />
           <Route path="/login" element={<LoginPage />} />
           <Route path="/register" element={<RegisterPage />} />
           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
           <Route path="/dashboard" element={<ProtectedRoute><MyDashboard /></ProtectedRoute>} />
           <Route path="/submit" element={<ProtectedRoute><SubmitPage /></ProtectedRoute>} />
           <Route path="/project/:id" element={<ProjectDetailPage />} />
           <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
           <Route path="/contact" element={<ContactPage />} />
           <Route path="*" element={<NotFoundPage />} />
         </Routes>
       </Suspense>
     </AnimatePresence>
   );
 };

function App() {
  return (
    <AuthProvider>
      <VisitorProvider>
        <Router>
          <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <CyberpunkBackground />
            <Navbar />
            <main className="main-content" style={{ flex: 1 }}>
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </VisitorProvider>
    </AuthProvider>
  );
}

export default App;
