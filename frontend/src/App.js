import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import DefaultRedirect from './components/DefaultRedirect';
import LoginPage from './pages/LoginPage';
import ReservasPage from './pages/ReservasPage';
import AdminPage from './pages/AdminPage';
import CalendarioPage from './pages/CalendarioPage';
import MiCuentaPage from './pages/MiCuentaPage';
import DatabaseDebugPage from './pages/DatabaseDebugPage';
import './styles/main.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Ruta de debug - TEMPORAL */}
              <Route path="/db-debug" element={<DatabaseDebugPage />} />
              
              {/* Rutas protegidas */}
              <Route 
                path="/reservas" 
                element={
                  <ProtectedRoute allowedRoles={['profesor', 'admin']}>
                    <ReservasPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calendario" 
                element={
                  <ProtectedRoute allowedRoles={['profesor', 'admin']}>
                    <CalendarioPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mi-cuenta" 
                element={
                  <ProtectedRoute allowedRoles={['profesor', 'admin']}>
                    <MiCuentaPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Ruta por defecto */}
              <Route path="/" element={<DefaultRedirect />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
