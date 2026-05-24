import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Páginas de Autenticación y Home
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

// Páginas de Torneos
import TournamentListPage from './pages/tournaments/TournamentListPage';
import TournamentDetailPage from './pages/tournaments/TournamentDetailPage';

// Páginas de Tienda
import ShopPage from './pages/shop/ShopPage';
import InventoryPage from './pages/shop/InventoryPage';

// Páginas de Administración
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCreateTournamentPage from './pages/admin/AdminCreateTournamentPage';
import AdminDisputesPage from './pages/admin/AdminDisputesPage';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          },
          success: { duration: 3000 },
          error: { duration: 4000 }
        }} 
      />
      
      <Layout>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Rutas Protegidas - Usuario */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/tournaments" element={
            <ProtectedRoute>
              <TournamentListPage />
            </ProtectedRoute>
          } />
          
          <Route path="/tournaments/:id" element={
            <ProtectedRoute>
              <TournamentDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="/shop" element={
            <ProtectedRoute>
              <ShopPage />
            </ProtectedRoute>
          } />
          
          <Route path="/inventory" element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          } />

          {/* Rutas de Administración */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } />
          
          <Route path="/admin/tournaments/create" element={
            <AdminRoute>
              <AdminCreateTournamentPage />
            </AdminRoute>
          } />
          
          <Route path="/admin/disputes" element={
            <AdminRoute>
              <AdminDisputesPage />
            </AdminRoute>
          } />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
