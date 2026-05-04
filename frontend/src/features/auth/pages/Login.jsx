import React, { useState } from 'react';
import { Search, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useAuth } from '@/features/auth/context/AuthContext';
import { pageKeys } from '@/app/config/pageKeys';
export function Login({ onNavigate, onSwitchToSignup }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await login({ email, password, rememberMe });
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
    return (<div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-600 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block text-white">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-white"/>
            </div>
            <span className="text-2xl">TalentBridge</span>
          </button>

          <h1 className="text-4xl sm:text-5xl mb-6">
            Impulsa tu carrera profesional
          </h1>
          <p className="text-lg sm:text-xl text-purple-100 mb-8">
            Conecta con las mejores empresas y encuentra la práctica perfecta para ti.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white">✓</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg mb-1">Miles de oportunidades</h3>
                <p className="text-sm sm:text-base text-purple-100">Accede a prácticas en las mejores empresas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white">✓</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg mb-1">Perfil personalizado</h3>
                <p className="text-sm sm:text-base text-purple-100">Destaca tus habilidades y experiencia</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white">✓</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg mb-1">Seguimiento en tiempo real</h3>
                <p className="text-sm sm:text-base text-purple-100">Mantente al tanto de tus postulaciones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6 sm:mb-8">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 mb-4 sm:mb-6 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5"/>
              <span className="text-sm">Volver al inicio</span>
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white"/>
              </div>
              <span className="text-lg sm:text-xl text-gray-900">TalentBridge</span>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl mb-2">¡Bienvenido de nuevo!</h2>
            <p className="text-gray-600 text-sm sm:text-base">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (<div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>)}

            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 block text-sm sm:text-base">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"/>
                <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base" required/>
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="mb-2 block text-sm sm:text-base">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"/>
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 sm:pl-11 pr-10 sm:pr-11 h-11 sm:h-12 text-sm sm:text-base" required/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? (<EyeOff className="w-4 h-4 sm:w-5 sm:h-5"/>) : (<Eye className="w-4 h-4 sm:w-5 sm:h-5"/>)}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(Boolean(checked))}/>
                <Label htmlFor="remember" className="text-xs sm:text-sm cursor-pointer">
                  Recuérdame
                </Label>
              </div>
              <button type="button" className="text-xs sm:text-sm text-purple-600 hover:text-purple-700">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11 sm:h-12 text-sm sm:text-base" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-4 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            {/* Social Login */}
            <Button type="button" variant="outline" className="w-full h-11 sm:h-12 text-xs sm:text-sm">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-xs sm:text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={onSwitchToSignup} className="text-purple-600 hover:text-purple-700">
                Regístrate gratis
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>);
}
