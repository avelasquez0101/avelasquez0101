import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      toast.error('Token de verificación no válido');
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        setSuccess(true);
        toast.success('¡Email verificado correctamente! Ya puedes iniciar sesión.');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error al verificar el email');
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-gray-400">Verificando tu email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-arcade-surface p-8 rounded-xl border border-gray-800 text-center">
        {success ? (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Email Verificado!</h2>
            <p className="text-gray-400 mb-6">
              Tu cuenta ha sido verificada exitosamente. Ahora puedes iniciar sesión y comenzar a competir.
            </p>
            <Link 
              to="/login" 
              className="inline-block px-6 py-2 bg-arcade-primary hover:bg-indigo-500 text-white rounded-lg font-medium transition"
            >
              Iniciar Sesión
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verificación Fallida</h2>
            <p className="text-gray-400 mb-6">
              No pudimos verificar tu email. El token puede haber expirado o ser inválido.
            </p>
            <Link 
              to="/register" 
              className="inline-block px-6 py-2 bg-arcade-primary hover:bg-indigo-500 text-white rounded-lg font-medium transition"
            >
              Volver a Registrarse
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
