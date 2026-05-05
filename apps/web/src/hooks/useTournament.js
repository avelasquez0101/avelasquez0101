import { useState, useEffect } from 'react';
import api from '../lib/api';

export function useTournaments(filters = {}) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(filters);
        const response = await api.get(`/tournaments?${params}`);
        setTournaments(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar torneos');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [JSON.stringify(filters)]);

  return { tournaments, loading, error };
}

export function useTournament(id) {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/tournaments/${id}`);
        setTournament(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar torneo');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTournament();
  }, [id]);

  return { tournament, loading, error };
}

export function useRegisterTournament() {
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);

  const register = async (tournamentId) => {
    try {
      setRegistering(true);
      setError(null);
      await api.post(`/tournaments/${tournamentId}/register`);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
      return { 
        success: false, 
        message: err.response?.data?.message || 'Error al registrarse' 
      };
    } finally {
      setRegistering(false);
    }
  };

  return { register, registering, error };
}

export default useTournaments;
