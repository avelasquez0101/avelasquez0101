'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  priceChcoins: number;
  type: 'physical' | 'virtual';
  category: string;
  image: string;
  stock: number;
}

export default function StorePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'physical' | 'virtual'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadProducts();
  }, [isAuthenticated, router]);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product: Product) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const response = await api.post('/transactions/purchase', {
        productId: product.id,
        paymentMethod: 'chcoins', // Default to chcoins, could show modal to choose
      });

      alert(`¡Compra exitosa! ${product.name}`);
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error en la compra');
    }
  };

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.type === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-purple-400 text-xl">Cargando tienda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              ChGaming Store
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-yellow-400 font-semibold">{user?.chcoins || 0} Chcoins</div>
                <button className="text-xs text-purple-400 hover:text-purple-300">Recargar</button>
              </div>
              <Link href="/dashboard" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                Volver
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('physical')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'physical'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Físicos 📦
          </button>
          <button
            onClick={() => setFilter('virtual')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'virtual'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Virtuales 💎
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-200 group">
              <div className="aspect-square bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  {product.type === 'virtual' ? '💎' : '📦'}
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    product.type === 'virtual'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {product.type === 'virtual' ? 'Virtual' : 'Físico'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-bold">{product.priceChcoins} Chcoins</span>
                    <span className="text-gray-400 text-sm">${product.priceUSD} USD</span>
                  </div>
                  
                  {product.stock <= 0 && (
                    <div className="text-red-400 text-xs">Agotado</div>
                  )}
                </div>

                <button
                  onClick={() => handlePurchase(product)}
                  disabled={product.stock <= 0}
                  className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? 'Comprar' : 'Sin Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-400">No hay productos disponibles en esta categoría</p>
          </div>
        )}
      </main>
    </div>
  );
}
