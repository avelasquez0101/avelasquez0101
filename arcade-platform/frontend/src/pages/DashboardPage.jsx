import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const { user, checkAuth } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated && !user) {
        await checkAuth();
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <div className="text-center py-20">Cargando dashboard...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-arcade-surface p-8 rounded-xl border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-2">
          ¡Hola, {user?.username || 'Jugador'}!
        </h1>
        <p className="text-gray-400">Bienvenido a tu panel de control.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/tournaments" className="bg-arcade-surface p-6 rounded-xl border border-gray-800 hover:border-arcade-primary transition cursor-pointer group">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-arcade-primary">Mis Torneos</h3>
          <p className="text-gray-400 text-sm">Ver tus inscripciones y historial de competiciones.</p>
        </Link>
        
        <Link to="/profile" className="bg-arcade-surface p-6 rounded-xl border border-gray-800 hover:border-arcade-primary transition cursor-pointer group">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-arcade-primary">Perfil</h3>
          <p className="text-gray-400 text-sm">Gestiona tu avatar, estadísticas y logros.</p>
        </Link>
        
        <Link to="/shop" className="bg-arcade-surface p-6 rounded-xl border border-gray-800 hover:border-arcade-primary transition cursor-pointer group">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-arcade-primary">Tienda</h3>
          <p className="text-gray-400 text-sm">Compra items exclusivos con tus créditos.</p>
        </Link>
      </div>

      {user?.role === 'ADMIN' && (
        <div className="bg-red-900/20 border border-red-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Panel de Administrador</h2>
          <p className="text-gray-400 text-sm mb-4">Tienes acceso a las herramientas de gestión.</p>
          <Link to="/admin" className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
            Ir al Panel Admin
          </Link>
        </div>
      )}
    </div>
  );
}
