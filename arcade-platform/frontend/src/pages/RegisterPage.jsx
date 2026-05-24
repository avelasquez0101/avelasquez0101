import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    const { confirmPassword, ...dataToSend } = formData;
    await register(dataToSend);
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-arcade-surface p-8 rounded-xl border border-gray-800 shadow-xl animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Crear Cuenta</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nombre de Usuario"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            placeholder="GamerPro123"
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="tu@email.com"
          />
          
          <Input
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            placeholder="••••••••"
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            placeholder="••••••••"
          />

          <Button type="submit" className="w-full" loading={loading}>
            Registrarse
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-arcade-primary hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
