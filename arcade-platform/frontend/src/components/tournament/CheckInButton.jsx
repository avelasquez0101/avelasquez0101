import { useState, useEffect } from 'react';
import { tournamentsApi } from '../../api/tournaments.api';
import toast from 'react-hot-toast';

export default function CheckInButton({ tournamentId, checkInStart, checkInEnd, isCheckedIn }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const start = new Date(checkInStart).getTime();
      const end = new Date(checkInEnd).getTime();

      if (now < start) {
        // Aún no abre el check-in
        const diff = start - now;
        setTimeLeft(diff);
        setCanCheckIn(false);
      } else if (now >= start && now <= end) {
        // Ventana de check-in abierta
        const diff = end - now;
        setTimeLeft(diff);
        setCanCheckIn(true);
      } else {
        // Check-in cerrado
        setTimeLeft(0);
        setCanCheckIn(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [checkInStart, checkInEnd]);

  const handleCheckIn = async () => {
    if (!canCheckIn || isCheckedIn) return;

    setLoading(true);
    try {
      await tournamentsApi.checkIn(tournamentId);
      toast.success('¡Check-in realizado con éxito!');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error al hacer check-in');
    } finally {
      setLoading(false);
    }
  };

  // Formatear tiempo restante
  const formatTime = (ms) => {
    if (ms <= 0) return '00:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Si ya hizo check-in
  if (isCheckedIn) {
    return (
      <div className="bg-green-900/30 border border-green-700 rounded-lg px-6 py-4 text-center">
        <svg className="w-8 h-8 text-green-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="text-green-400 font-bold">¡Check-in Completado!</p>
        <p className="text-green-300 text-sm mt-1">Estás listo para competir</p>
      </div>
    );
  }

  // Si el check-in aún no abre
  if (timeLeft !== null && timeLeft > 0 && !canCheckIn) {
    return (
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg px-6 py-4 text-center">
        <p className="text-blue-300 text-sm mb-2">El check-in abre en:</p>
        <p className="text-3xl font-bold text-blue-400 font-mono">{formatTime(timeLeft)}</p>
        <p className="text-blue-300 text-xs mt-2">Regresa cuando el timer llegue a cero</p>
      </div>
    );
  }

  // Si el check-in está abierto
  if (canCheckIn) {
    return (
      <div className="space-y-3">
        <div className="bg-green-900/30 border border-green-700 rounded-lg px-6 py-3 text-center animate-pulse">
          <p className="text-green-300 text-sm">Check-in disponible por:</p>
          <p className="text-2xl font-bold text-green-400 font-mono">{formatTime(timeLeft)}</p>
        </div>
        
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {loading ? 'Procesando...' : '✅ HACER CHECK-IN AHORA'}
        </button>
      </div>
    );
  }

  // Si el check-in cerró
  return (
    <div className="bg-red-900/30 border border-red-700 rounded-lg px-6 py-4 text-center">
      <p className="text-red-400 font-bold">Check-in Cerrado</p>
      <p className="text-red-300 text-sm mt-1">Ya no es posible hacer check-in para este torneo</p>
    </div>
  );
}
