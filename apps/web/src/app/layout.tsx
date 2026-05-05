import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

export const metadata: Metadata = {
  title: 'ChGaming Platform - Torneos y E-commerce Gamer',
  description: 'Participa en torneos de Free Fire, COD Mobile, Mobile Legends y Wild Rift. Gana Chcoins, XP y premios reales.',
  keywords: ['torneos', 'gaming', 'esports', 'free fire', 'cod mobile', 'mobile legends', 'wild rift'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="bg-gray-900 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
