import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-extrabold text-white mb-6">
        Compite, Gana, Personaliza
      </h1>
      <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
        La plataforma definitiva para torneos de eSports. Únete a miles de jugadores,
        compite en torneos diarios y gana premios exclusivos.
      </p>
      
      <div className="flex justify-center gap-4">
        {isAuthenticated ? (
          <Link 
            to="/tournaments" 
            className="bg-arcade-primary hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-bold text-lg transition"
          >
            Ver Torneos
          </Link>
        ) : (
          <>
            <Link 
              to="/register" 
              className="bg-arcade-primary hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-bold text-lg transition"
            >
              Empezar Ahora
            </Link>
            <Link 
              to="/login" 
              className="bg-arcade-surface hover:bg-gray-700 text-white border border-gray-600 px-8 py-3 rounded-lg font-bold text-lg transition"
            >
              Iniciar Sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
