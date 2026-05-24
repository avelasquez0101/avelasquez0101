import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import toast from 'react-hot-toast';

export default function AdminCreateTournamentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    game: 'Valorant',
    format: 'SINGLE_ELIMINATION',
    maxParticipants: 8,
    prizePool: 100,
    startDate: '',
    checkInDuration: 15,
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxParticipants' || name === 'prizePool' || name === 'checkInDuration' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (new Date(formData.startDate) <= new Date()) {
        throw new Error('La fecha de inicio debe ser futura.');
      }

      await adminApi.createTournament(formData);
      toast.success('Torneo creado exitosamente');
      navigate('/admin');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error al crear el torneo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Crear Nuevo Torneo</h1>
      
      <form onSubmit={handleSubmit} className="bg-arcade-surface p-6 rounded-xl border border-gray-800 space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nombre del Torneo</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-arcade-primary"
              placeholder="Ej: Viernes de Oro #42"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Juego</label>
            <select
              name="game"
              value={formData.game}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-arcade-primary"
            >
              <option value="Valorant">Valorant</option>
              <option value="League of Legends">League of Legends</option>
              <option value="CS:GO">CS:GO</option>
              <option value="FIFA 24">FIFA 24</option>
              <option value="Rocket League">Rocket League</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Formato</label>
            <select
              name="format"
              value={formData.format}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-arcade-primary"
            >
              <option value="SINGLE_ELIMINATION">Eliminación Directa</option>
              <option value="ROUND_ROBIN">Todos contra Todos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Max Participantes</label>
            <input
              type="number"
              name="maxParticipants"
              required
              min="2"
              value={formData.maxParticipants}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-arcade-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Premio (Créditos Arcade)</label>
            <input
              type="number"
              name="prizePool"
              required
              min="0"
              value={formData.prizePool}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-arcade-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Fecha de Inicio</label>
            <input
              type="datetime-local"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-arcade-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Descripción / Reglas</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-arcade-primary"
            placeholder="Reglas específicas del torneo..."
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-arcade-primary hover:bg-indigo-500 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Torneo'}
          </button>
        </div>
      </form>
    </div>
  );
}
