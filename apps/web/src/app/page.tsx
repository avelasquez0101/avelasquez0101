import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              ChGaming
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/register" 
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Compite. Gana.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Domina
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              La plataforma definitiva de torneos para Free Fire, COD Mobile, 
              Mobile Legends y Wild Rift. Únete a miles de jugadores y compite 
              por premios reales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/30"
              >
                ¡Únete Gratis! 🎮
              </Link>
              <Link 
                href="/tournaments" 
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg rounded-xl transition-all duration-200 border border-gray-700"
              >
                Ver Torneos 🏆
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            <div className="text-center p-6 bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                10K+
              </div>
              <div className="text-gray-400">Jugadores</div>
            </div>
            <div className="text-center p-6 bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                500+
              </div>
              <div className="text-gray-400">Torneos</div>
            </div>
            <div className="text-center p-6 bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                $50K+
              </div>
              <div className="text-gray-400">Premios Repartidos</div>
            </div>
            <div className="text-center p-6 bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                24/7
              </div>
              <div className="text-gray-400">Soporte</div>
            </div>
          </div>
        </section>

        {/* Games Section */}
        <section className="py-20 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Juegos Soportados
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Free Fire', icon: '🔥', color: 'from-orange-500 to-red-500' },
                { name: 'COD Mobile', icon: '🎯', color: 'from-green-500 to-emerald-500' },
                { name: 'Mobile Legends', icon: '⚔️', color: 'from-blue-500 to-cyan-500' },
                { name: 'Wild Rift', icon: '🐉', color: 'from-purple-500 to-pink-500' },
              ].map((game) => (
                <div 
                  key={game.name}
                  className="group p-8 bg-gray-900/50 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all duration-300 text-center cursor-pointer"
                >
                  <div className={`text-6xl mb-4 bg-gradient-to-r ${game.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform`}>
                    {game.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{game.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-white text-center mb-4">
              ¿Por Qué ChGaming?
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Diseñado por gamers, para gamers. Todo lo que necesitas para competir al más alto nivel.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🏆',
                  title: 'Torneos Diarios',
                  description: 'Competiciones todos los días con premios en efectivo y productos exclusivos.',
                },
                {
                  icon: '💰',
                  title: 'Economía Dual',
                  description: 'Gana Chcoins participando y úsalos en nuestra tienda o combínalos con USD.',
                },
                {
                  icon: '🔥',
                  title: 'Sistema de Rachas',
                  description: 'Mantén tu racha diaria y obtén multiplicadores de XP y recompensas exclusivas.',
                },
                {
                  icon: '📊',
                  title: 'Ranking Global',
                  description: 'Escala posiciones en el leaderboard y conviértete en una leyenda.',
                },
                {
                  icon: '🛒',
                  title: 'Tienda Gamer',
                  description: 'Productos físicos y virtuales. Periféricos, skins, diamantes y más.',
                },
                {
                  icon: '👑',
                  title: 'Membresía VIP',
                  description: 'Acceso anticipado, bonus de XP, descuentos y badge exclusivo.',
                },
              ].map((feature) => (
                <div 
                  key={feature.title}
                  className="p-6 bg-gray-800/30 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-3xl p-12 border border-purple-500/30 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                ¿Listo para Competir?
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Únete hoy y recibe 100 Chcoins de bienvenida + acceso inmediato a torneos.
              </p>
              <Link 
                href="/register" 
                className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/30"
              >
                Crear Cuenta Gratis 🚀
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                ChGaming
              </div>
              <p className="text-gray-400 text-sm">
                La plataforma líder de torneos gamer en Latinoamérica.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Juegos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-purple-400">Free Fire</Link></li>
                <li><Link href="#" className="hover:text-purple-400">COD Mobile</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Mobile Legends</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Wild Rift</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Compañía</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-purple-400">Sobre Nosotros</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Contacto</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Prensa</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Trabaja con Nosotros</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-purple-400">Términos de Servicio</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Política de Privacidad</Link></li>
                <li><Link href="#" className="hover:text-purple-400">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            © 2024 ChGaming. Todos los derechos reservados. Hecho con ❤️ para gamers.
          </div>
        </div>
      </footer>
    </div>
  );
}
