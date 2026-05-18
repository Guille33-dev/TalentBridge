import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useAuth } from '@/features/auth/context/AuthContext';
import { pageKeys } from '@/app/config/pageKeys';
import { BrandLogo } from '@/shared/components/brand/BrandLogo';

export function Signup({ onNavigate, onSwitchToLogin }) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
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
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData);
      const pendingJob = window.sessionStorage.getItem('talentbridge.pendingJob');

      if (pendingJob) {
        window.sessionStorage.removeItem('talentbridge.pendingJob');
        onNavigate(pageKeys.jobDetail, pendingJob);
      } else {
        onNavigate('dashboard');
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const navigateToLegalPage = (page) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-600 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="hidden lg:block text-white">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-3 mb-8 hover:opacity-90 transition-opacity">
            <BrandLogo className="w-9 h-9" withSurface />
            <span className="text-2xl">TalentBridge</span>
          </button>

          <h1 className="text-5xl mb-6">Comienza tu viaje profesional</h1>
          <p className="text-xl text-purple-100 mb-8">
            Crea tu cuenta gratis y accede a cientos de oportunidades de practicas.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white">1</span>
              </div>
              <div>
                <h3 className="text-lg mb-1">Crea tu cuenta</h3>
                <p className="text-purple-100">Tu perfil empieza vacio y lo completas cuando quieras</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white">2</span>
              </div>
              <div>
                <h3 className="text-lg mb-1">Explora oportunidades</h3>
                <p className="text-purple-100">Encuentra practicas que se ajusten a ti</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white">3</span>
              </div>
              <div>
                <h3 className="text-lg mb-1">Postula y conecta</h3>
                <p className="text-purple-100">Inicia tu carrera con las mejores empresas</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-sm text-purple-100 mb-2">Consejo</p>
            <p className="text-white">
              Puedes completar tus estudios, habilidades y disponibilidad desde tu dashboard cuando quieras.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 max-h-[90vh] overflow-y-auto">
          <div className="mb-6 sm:mb-8">
            <button onClick={handleBack} className="flex items-center gap-2 mb-4 sm:mb-6 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Volver</span>
            </button>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl mb-2">Crea tu cuenta</h2>
            <p className="text-gray-600 text-sm sm:text-base">Unete a miles de estudiantes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="firstName" className="mb-2 block text-sm sm:text-base">
                  Nombre
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Maria"
                    value={formData.firstName}
                    onChange={(event) => handleChange('firstName', event.target.value)}
                    className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lastName" className="mb-2 block text-sm sm:text-base">
                  Apellido
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Gonzalez"
                  value={formData.lastName}
                  onChange={(event) => handleChange('lastName', event.target.value)}
                  className="h-11 sm:h-12 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block text-sm sm:text-base">
                Correo electronico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@universidad.edu"
                  value={formData.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Usa tu correo universitario preferentemente</p>
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
                  placeholder="Minimo 8 caracteres"
                  value={formData.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  className="pl-10 sm:pl-11 pr-10 sm:pr-11 h-11 sm:h-12 text-sm sm:text-base"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="mb-2 block text-sm sm:text-base">
                Confirmar contrasena
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repite tu contrasena"
                  value={formData.confirmPassword}
                  onChange={(event) => handleChange('confirmPassword', event.target.value)}
                  className="pl-10 sm:pl-11 pr-10 sm:pr-11 h-11 sm:h-12 text-sm sm:text-base"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(Boolean(checked))} className="mt-1" />
              <p className="text-xs sm:text-sm leading-relaxed">
                Acepto los{' '}
                <button type="button" onClick={() => navigateToLegalPage(pageKeys.terms)} className="text-purple-600 hover:text-purple-700">
                  Terminos y Condiciones
                </button>{' '}
                y la{' '}
                <button type="button" onClick={() => navigateToLegalPage(pageKeys.privacy)} className="text-purple-600 hover:text-purple-700">
                  Politica de Privacidad
                </button>
              </p>
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11 sm:h-12 text-sm sm:text-base" disabled={!acceptTerms || isSubmitting}>
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>

            <p className="text-center text-xs sm:text-sm text-gray-600">
              Ya tienes cuenta?{' '}
              <button type="button" onClick={onSwitchToLogin} className="text-purple-600 hover:text-purple-700">
                Inicia sesion
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
