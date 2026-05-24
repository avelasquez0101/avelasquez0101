import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { shopApi } from '../../api/shop.api';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const categoryLabels = {
  AVATAR: 'Avatares',
  BANNER: 'Banners',
  BADGE: 'Insignias'
};

const rarityColors = {
  COMMON: 'border-gray-500 bg-gray-500/20',
  RARE: 'border-blue-500 bg-blue-500/20',
  EPIC: 'border-purple-500 bg-purple-500/20',
  LEGENDARY: 'border-yellow-500 bg-yellow-500/20 animate-pulse'
};

const rarityLabels = {
  COMMON: 'Común',
  RARE: 'Raro',
  EPIC: 'Épico',
  LEGENDARY: 'Legendario'
};

export default function ShopPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data } = await shopApi.getItems(filter === 'ALL' ? {} : { category: filter });
      setItems(data);
    } catch (error) {
      toast.error('Error al cargar la tienda');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (itemId, price) => {
    setPurchasing(itemId);
    try {
      await shopApi.purchase(itemId);
      toast.success(`¡Compra exitosa! -${price} Créditos`);
      loadItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error en la compra');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header con balance */}
      <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tienda de Items</h1>
          <p className="text-gray-400">Personaliza tu perfil con items exclusivos</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Tus Créditos Arcade</div>
            <div className="text-2xl font-bold text-arcade-primary">{user?.creditsArcade || 0}</div>
          </div>
          <Link 
            to="/inventory" 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
          >
            Mi Inventario
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'AVATAR', 'BANNER', 'BADGE'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === cat 
                ? 'bg-arcade-primary text-white' 
                : 'bg-arcade-surface text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            {categoryLabels[cat] || 'Todos'}
          </button>
        ))}
      </div>

      {/* Grid de Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400">
            No hay items disponibles en esta categoría
          </div>
        ) : (
          items.map(item => (
            <div 
              key={item.id} 
              className={`bg-arcade-surface rounded-xl border-2 overflow-hidden transition hover:scale-105 ${rarityColors[item.rarity]}`}
            >
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
                <img 
                  src={item.imageUrl || '/placeholder-item.png'} 
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-white font-bold truncate">{item.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.rarity === 'LEGENDARY' ? 'bg-yellow-500/20 text-yellow-400' :
                    item.rarity === 'EPIC' ? 'bg-purple-500/20 text-purple-400' :
                    item.rarity === 'RARE' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {rarityLabels[item.rarity]}
                  </span>
                  <span className="text-arcade-primary font-bold">{item.price}</span>
                </div>

                <button
                  onClick={() => handlePurchase(item.id, item.price)}
                  disabled={purchasing === item.id}
                  className="w-full px-4 py-2 bg-arcade-primary hover:bg-indigo-500 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing === item.id ? 'Comprando...' : 'Comprar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
