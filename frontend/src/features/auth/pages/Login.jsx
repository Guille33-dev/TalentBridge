import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useAuth } from '@/features/auth/context/AuthContext';
import { pageKeys } from '@/app/config/pageKeys';
import { BrandLogo } from '@/shared/components/brand/BrandLogo';
import { Footer } from '@/shared/components/layout/Footer';

export function Login({ onNavigate, onSwitchToSignup }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    onNavigate('home');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const loggedUser = await login({ email, password, rememberMe });
      const pendingJob = window.sessionStorage.getItem('talentbridge.pendingJob');
      const redirectPath = location.state?.from?.pathname;

      if (pendingJob) {
        window.sessionStorage.removeItem('talentbridge.pendingJob');
        onNavigate(pageKeys.jobDetail, pendingJob);
      } else if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (loggedUser?.role === 'ADMIN') {
        onNavigate(pageKeys.admin);
      } else if (loggedUser?.role === 'COMPANY') {
        onNavigate(pageKeys.companyDashboard);
      } else {
        onNavigate(pageKeys.dashboard);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-600 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
        <div className="text-white w-full max-w-2xl mx-auto lg:max-w-none">
          <button type="button" onClick={() => onNavigate('home')} className="flex items-center gap-3 mb-5 sm:mb-6 lg:mb-8 hover:opacity-90 transition-opacity" aria-label="Ir al inicio de TalentBridge">
            <BrandLogo className="w-10 h-10 sm:w-12 sm:h-12 lg:w-9 lg:h-9" withSurface />
            <span className="text-xl sm:text-2xl">TalentBridge</span>
          </button>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-4 lg:mb-6">Impulsa tu carrera profesional</h1>
          <p className="text-base sm:text-lg lg:text-xl text-purple-100 mb-6 lg:mb-8">
            Conecta con las mejores empresas y encuentra la practica perfecta para ti.
          </p>

          <div className="grid gap-3 sm:grid-cols-3 lg:block lg:space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white">+</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg mb-1">Miles de oportunidades</h3>
                <p className="text-sm sm:text-base text-purple-100">Accede a practicas en las mejores empresas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white">+</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg mb-1">Perfil personalizado</h3>
                <p className="text-sm sm:text-base text-purple-100">Destaca tus habilidades y experiencia</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white">+</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg mb-1">Seguimiento en tiempo real</h3>
                <p className="text-sm sm:text-base text-purple-100">Mantente al tanto de tus postulaciones</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12">
          <div className="mb-6 sm:mb-8">
            <button type="button" onClick={handleBack} className="flex items-center gap-2 mb-4 sm:mb-6 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Volver</span>
            </button>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl mb-2">Bienvenido de nuevo</h2>
            <p className="text-gray-600 text-sm sm:text-base">Inicia sesion para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm" role="alert">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email" className="mb-2 block text-sm sm:text-base">
                Correo electronico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block text-sm sm:text-base">
                Contrasena
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10 sm:pl-11 pr-10 sm:pr-11 h-11 sm:h-12 text-sm sm:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(Boolean(checked))} />
                <Label htmlFor="remember" className="text-xs sm:text-sm cursor-pointer">
                  Recuerdame
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11 sm:h-12 text-sm sm:text-base" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando sesion...' : 'Iniciar sesion'}
            </Button>

            <p className="text-center text-xs sm:text-sm text-gray-600">
              No tienes cuenta?{' '}
              <button type="button" onClick={onSwitchToSignup} className="text-purple-600 hover:text-purple-700">
                Registrate gratis
              </button>
            </p>
            <p className="text-center text-xs sm:text-sm text-gray-600">
              Eres una empresa?{' '}
              <button type="button" onClick={() => onNavigate(pageKeys.companySignup)} className="text-purple-600 hover:text-purple-700">
                Registrar empresa
              </button>
            </p>
          </form>
        </div>
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
