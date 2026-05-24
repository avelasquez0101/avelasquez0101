import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { user, handleLogout } = useAuth();
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="bg-arcade-surface border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-arcade-primary">
              ARCADE<span className="text-white">PLATFORM</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link to="/tournaments" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Torneos
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
              )}
              {isAuthenticated && user?.role === 'ADMIN' && (
                <Link to="/admin" className="text-red-400 hover:text-red-300 px-3 py-2 rounded-md text-sm font-medium">
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="text-gray-300 hover:text-white text-sm font-medium">
                  {user?.username || 'Perfil'}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600/10 text-red-400 hover:bg-red-600/20 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-arcade-primary hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
