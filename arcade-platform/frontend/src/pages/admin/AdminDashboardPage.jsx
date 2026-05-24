import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    activeTournaments: 0,
    pendingDisputes: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const disputesRes = await adminApi.getDisputes();
      
      setStats({
        activeTournaments: 5,
        pendingDisputes: disputesRes.data.filter(d => d.status === 'PENDING').length,
        totalUsers: 120
      });
    } catch (error) {
      toast.error('Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
        <Link 
          to="/admin/tournaments/create"
          className="px-4 py-2 bg-arcade-primary hover:bg-indigo-500 text-white rounded-lg font-medium transition"
        >
          + Crear Torneo
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
          <h3 className="text-gray-400 text-sm uppercase mb-2">Torneos Activos</h3>
          <p className="text-4xl font-bold text-blue-400">{stats.activeTournaments}</p>
          <Link to="/admin/tournaments/create" className="text-sm text-blue-500 hover:underline mt-3 block">
            Crear nuevo torneo →
          </Link>
        </div>
        
        <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
          <h3 className="text-gray-400 text-sm uppercase mb-2">Disputas Pendientes</h3>
          <p className={`text-4xl font-bold ${stats.pendingDisputes > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {stats.pendingDisputes}
          </p>
          {stats.pendingDisputes > 0 && (
            <Link to="/admin/disputes" className="text-sm text-red-500 hover:underline mt-3 block">
              Ver disputas →
            </Link>
          )}
        </div>

        <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
          <h3 className="text-gray-400 text-sm uppercase mb-2">Usuarios Totales</h3>
          <p className="text-4xl font-bold text-purple-400">{stats.totalUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-white">Gestión de Torneos</h2>
          <ul className="space-y-3">
            <li>
              <Link to="/admin/tournaments/create" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Nuevo Torneo
              </Link>
            </li>
            <li className="text-gray-500 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver Todos los Torneos (Próximamente)
            </li>
          </ul>
        </div>
        
        <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-white">Moderación</h2>
          <ul className="space-y-3">
            <li>
              <Link to="/admin/disputes" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Resolver Disputas
              </Link>
            </li>
            <li className="text-gray-500 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Lista de Usuarios (Próximamente)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
