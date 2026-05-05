import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron'
});

export const metadata: Metadata = {
  title: 'ChGaming - Torneos y Tienda Gamer',
  description: 'Plataforma de torneos de videojuegos y e-commerce gamer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} ${orbitron.variable} bg-gray-900 text-white`}>
        {children}
      </body>
    </html>
  );
}
