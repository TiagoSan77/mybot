import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './components/Landing';
import Login from './components/login';
import Dashboard from './components/Dashboard';
import QRPage from './components/QRPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Rota inicial - Landing Page */}
      <Route 
        path="/" 
        element={
          user ? <Navigate to="/dashboard" replace /> : <Landing />
        } 
      />
      
      {/* Rota pública - Login */}
      <Route 
        path="/login" 
        element={
          user ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />
      
      {/* Rotas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/qr" 
        element={
          <ProtectedRoute>
            <QRPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Rota 404 - redireciona para home ou dashboard */}
      <Route 
        path="*" 
        element={
          <Navigate to={user ? "/dashboard" : "/"} replace />
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
