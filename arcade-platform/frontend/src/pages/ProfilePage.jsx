import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.id) {
          const { data } = await apiClient.get(`/profiles/${user.id}`);
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) return <div className="text-center py-20">Cargando perfil...</div>;
  if (!profile) return <div className="text-center py-20 text-red-400">Perfil no encontrado</div>;

  const xpForNextLevel = Math.floor(100 * Math.pow(profile.level + 1, 1.5));
  const xpProgress = (profile.xp / xpForNextLevel) * 100;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-arcade-surface p-8 rounded-xl border border-gray-800 mb-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-arcade-primary rounded-full flex items-center justify-center text-4xl font-bold">
            {profile.avatarUrl?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
            <p className="text-gray-400">Nivel {profile.level}</p>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">XP: {profile.xp} / {xpForNextLevel}</span>
                <span className="text-arcade-primary">{Math.round(xpProgress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-arcade-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-arcade-primary">{profile.creditsArcade || 0}</div>
            <div className="text-sm text-gray-400">Créditos Arcade</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-2">Torneos Jugados</h3>
          <p className="text-4xl font-bold text-arcade-primary">{profile.tournamentsPlayed || 0}</p>
        </div>
        
        <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-2">Torneos Ganados</h3>
          <p className="text-4xl font-bold text-green-400">{profile.tournamentsWon || 0}</p>
        </div>
        
        <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-2">Victorias</h3>
          <p className="text-4xl font-bold text-blue-400">
            {profile.tournamentsPlayed > 0 
              ? Math.round((profile.tournamentsWon / profile.tournamentsPlayed) * 100) 
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}
