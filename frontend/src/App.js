import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import RoleBasedRedirect from './components/RoleBasedRedirect';

// Pages
import LoginPage from './pages/LoginPage';
import ReservasPage from './pages/ReservasPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import CalendarioPage from './pages/CalendarioPage';
import DebugPage from './pages/DebugPage';
import EnvDebugPage from './pages/EnvDebugPage';
import JWTDecoderPage from './pages/JWTDecoderPage';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

// Styles
import './styles/main.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Ruta de debug - TEMPORAL */}
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/env-debug" element={<EnvDebugPage />} />
              <Route path="/jwt-debug" element={<JWTDecoderPage />} />
              
              {/* Rutas públicas */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Rutas protegidas por rol */}
              
              {/* Reservas - accesible para profesores y admins */}
              <Route 
                path="/reservas" 
                element={
                  <ProtectedRoute allowedRoles={['profesor', 'admin']}>
                    <ReservasPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Calendario - accesible para profesores y admins */}
              <Route 
                path="/calendario" 
                element={
                  <ProtectedRoute allowedRoles={['profesor', 'admin']}>
                    <CalendarioPage />
                  </ProtectedRoute>
                } 
              />

              {/* Dashboard/Admin - solo para administradores */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Dashboard general - mantener para compatibilidad */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['profesor', 'admin']}>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Ruta por defecto - redirección basada en rol */}
              <Route path="/" element={<RoleBasedRedirect />} />
              
              {/* Ruta 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Componente 404
const NotFound = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="card shadow">
            <div className="card-body p-5">
              <h1 className="display-1 text-muted">404</h1>
              <h2 className="mb-4">Página no encontrada</h2>
              <p className="text-muted mb-4">
                La página que buscas no existe o ha sido movida.
              </p>
              <a href="/dashboard" className="btn btn-primary">
                <i className="fas fa-home me-2"></i>
                Ir al Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 