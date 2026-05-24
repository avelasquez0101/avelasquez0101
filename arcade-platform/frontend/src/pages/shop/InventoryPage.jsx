import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { shopApi } from '../../api/shop.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const categoryLabels = {
  AVATAR: 'Avatar',
  BANNER: 'Banner',
  BADGE: 'Insignia'
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipping, setEquipping] = useState(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const { data } = await shopApi.getInventory();
      setInventory(data);
    } catch (error) {
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (itemId, currentEquipped) => {
    setEquipping(itemId);
    try {
      if (currentEquipped) {
        await shopApi.unequip(itemId);
        toast.success('Item desequipado');
      } else {
        await shopApi.equip(itemId);
        toast.success('Item equipado');
      }
      loadInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al equipar');
    } finally {
      setEquipping(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Agrupar por categoría
  const grouped = inventory.reduce((acc, item) => {
    const cat = item.item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-2">Mi Inventario</h1>
        <p className="text-gray-400">Gestiona tus items equipados y disponibles</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-arcade-surface p-12 rounded-xl border border-gray-800 text-center">
          <p className="text-gray-400 mb-4">No tienes items en tu inventario</p>
          <a 
            href="/shop" 
            className="inline-block px-6 py-2 bg-arcade-primary hover:bg-indigo-500 text-white rounded-lg font-medium transition"
          >
            Ir a la Tienda
          </a>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              {categoryLabels[category]}
              <span className="text-sm font-normal text-gray-400">({items.length} items)</span>
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {items.map(invItem => (
                <div
                  key={invItem.id}
                  className={`relative group rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                    invItem.equipped 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-gray-700 bg-gray-800/50 hover:border-arcade-primary'
                  }`}
                  onClick={() => handleEquip(invItem.itemId, invItem.equipped)}
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-2">
                    <img 
                      src={invItem.item.imageUrl || '/placeholder-item.png'} 
                      alt={invItem.item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="p-2 text-center">
                    <div className="text-xs text-white font-medium truncate">{invItem.item.name}</div>
                    {invItem.equipped ? (
                      <span className="text-xs text-green-400 font-medium">Equipado</span>
                    ) : (
                      <span className="text-xs text-gray-500 group-hover:text-arcade-primary transition">
                        Click para equipar
                      </span>
                    )}
                  </div>

                  {equipping === invItem.itemId && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
