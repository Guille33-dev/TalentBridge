import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, Eye, EyeOff, Lock, Mail, MapPin, User } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useAuth } from '@/features/auth/context/AuthContext';
import { pageKeys } from '@/app/config/pageKeys';
import { BrandLogo } from '@/shared/components/brand/BrandLogo';
import { Footer } from '@/shared/components/layout/Footer';

const STUDENT_TYPE = 'student';
const COMPANY_TYPE = 'company';

const emptyFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  contactName: '',
  companyLocation: '',
  companyIndustry: '',
  companyTaxId: '',
};

function getAccountType(searchParams) {
  return searchParams.get('tipo') === 'empresa' ? COMPANY_TYPE : STUDENT_TYPE;
}

export function Signup({ onNavigate, onSwitchToLogin }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { register, registerCompany } = useAuth();
  const [accountType, setAccountType] = useState(getAccountType(searchParams));
  const [formData, setFormData] = useState(emptyFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isCompany = accountType === COMPANY_TYPE;

  useEffect(() => {
    setAccountType(getAccountType(searchParams));
  }, [searchParams]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    onNavigate(pageKeys.home);
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    setError(null);
    setSearchParams(type === COMPANY_TYPE ? { tipo: 'empresa' } : {});
  };

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const navigateToLegalPage = (page) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!acceptTerms) {
      setError('Debes aceptar los términos y la política de privacidad');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCompany) {
        await registerCompany({ ...formData, acceptTerms });
        onNavigate(pageKeys.companyDashboard);
        return;
      }

      await register(formData);
      const pendingJob = window.sessionStorage.getItem('talentbridge.pendingJob');

      if (pendingJob) {
        window.sessionStorage.removeItem('talentbridge.pendingJob');
        onNavigate(pageKeys.jobDetail, pendingJob);
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
          <button type="button" onClick={() => onNavigate(pageKeys.home)} className="flex items-center gap-3 mb-5 sm:mb-6 lg:mb-8 hover:opacity-90 transition-opacity" aria-label="Ir al inicio de TalentBridge">
            <BrandLogo className="w-10 h-10 sm:w-12 sm:h-12 lg:w-9 lg:h-9" withSurface />
            <span className="text-xl sm:text-2xl">TalentBridge</span>
          </button>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-4 lg:mb-6">{isCompany ? 'Publica prácticas con control' : 'Comienza tu viaje profesional'}</h1>
          <p className="text-base sm:text-lg lg:text-xl text-purple-100 mb-6 lg:mb-8">
            {isCompany
              ? 'Registra tu empresa, crea vacantes y espera la revisión del admin antes de publicarlas.'
              : 'Crea tu cuenta gratis y accede a cientos de oportunidades de prácticas.'}
          </p>

          <div className="grid gap-3 sm:grid-cols-3 lg:block lg:space-y-4">
            {(isCompany
              ? [
                  ['1', 'Crea el perfil', 'Completa la información principal de la empresa'],
                  ['2', 'Publica vacantes', 'Envía tus prácticas a revisión desde el panel'],
                  ['3', 'Gestiona candidatos', 'Revisa postulaciones y actualiza el proceso'],
                ]
              : [
                  ['1', 'Crea tu cuenta', 'Tu perfil empieza vacío y lo completas cuando quieras'],
                  ['2', 'Explora oportunidades', 'Encuentra prácticas que se ajusten a ti'],
                  ['3', 'Postula y conecta', 'Inicia tu carrera con las mejores empresas'],
                ]
            ).map(([step, title, description]) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white">{step}</span>
                </div>
                <div>
                  <h3 className="text-lg mb-1">{title}</h3>
                  <p className="text-purple-100">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 lg:mt-12 p-4 sm:p-5 lg:p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-sm text-purple-100 mb-2">{isCompany ? 'Revisión' : 'Consejo'}</p>
            <p className="text-white">
              {isCompany
                ? 'Las empresas nuevas quedan pendientes hasta que el admin valide el perfil.'
                : 'Puedes completar tus estudios, habilidades y disponibilidad desde tu dashboard cuando quieras.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 max-h-[90vh] overflow-y-auto">
          <div className="mb-5 sm:mb-6">
            <button type="button" onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Volver</span>
            </button>
          </div>

          <div className="mb-6">
            <div className="relative grid grid-cols-2 rounded-xl bg-gray-100 p-1 mb-6" role="group" aria-label="Tipo de cuenta">
              <div
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-200 ${
                  isCompany ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              <button
                type="button"
                aria-pressed={!isCompany}
                onClick={() => handleAccountTypeChange(STUDENT_TYPE)}
                className={`relative z-10 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  !isCompany ? 'text-purple-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4" />
                Estudiante
              </button>
              <button
                type="button"
                aria-pressed={isCompany}
                onClick={() => handleAccountTypeChange(COMPANY_TYPE)}
                className={`relative z-10 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isCompany ? 'text-purple-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Empresa
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl mb-2">{isCompany ? 'Registra tu empresa' : 'Crea tu cuenta'}</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {isCompany ? 'Publica prácticas y conecta con estudiantes' : 'Únete a miles de estudiantes'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm" role="alert">{error}</div>}

            {isCompany ? (
              <div>
                <Label htmlFor="companyName" className="mb-2 block text-sm sm:text-base">
                  Nombre de la empresa
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    id="companyName"
                    type="text"
                    autoComplete="organization"
                    placeholder="Nombre comercial"
                    value={formData.companyName}
                    onChange={(event) => handleChange('companyName', event.target.value)}
                    className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            ) : (
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
                      autoComplete="given-name"
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
                      autoComplete="family-name"
                    placeholder="Gonzalez"
                    value={formData.lastName}
                    onChange={(event) => handleChange('lastName', event.target.value)}
                    className="h-11 sm:h-12 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="mb-2 block text-sm sm:text-base">
                {isCompany ? 'Email corporativo' : 'Correo electrónico'}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={isCompany ? 'empresa@dominio.com' : 'tu@universidad.edu'}
                  value={formData.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isCompany ? 'Usa un correo profesional de la empresa' : 'Usa tu correo universitario preferentemente'}
              </p>
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block text-sm sm:text-base">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={(event) => handleChange('password', event.target.value)}
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

            <div>
              <Label htmlFor="confirmPassword" className="mb-2 block text-sm sm:text-base">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(event) => handleChange('confirmPassword', event.target.value)}
                  className="pl-10 sm:pl-11 pr-10 sm:pr-11 h-11 sm:h-12 text-sm sm:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'Ocultar confirmacion de contraseña' : 'Mostrar confirmacion de contraseña'}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {isCompany && (
              <div className="border-t border-gray-100 pt-5 space-y-4">
                <div>
                  <Label htmlFor="contactName" className="mb-2 block text-sm sm:text-base">
                    Persona de contacto
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <Input
                      id="contactName"
                      type="text"
                      autoComplete="name"
                      placeholder="Laura García"
                      value={formData.contactName}
                      onChange={(event) => handleChange('contactName', event.target.value)}
                      className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="companyIndustry" className="mb-2 block text-sm sm:text-base">
                      Sector de la empresa
                    </Label>
                    <select
                      id="companyIndustry"
                      value={formData.companyIndustry}
                      onChange={(event) => handleChange('companyIndustry', event.target.value)}
                      className="flex h-11 sm:h-12 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm sm:text-base text-gray-900 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      required
                    >
                      <option value="">Selecciona un sector</option>
                      <option value="Tecnología">Tecnología</option>
                      <option value="Marketing y comunicación">Marketing y comunicación</option>
                      <option value="Diseño">Diseño</option>
                      <option value="Consultoría">Consultoría</option>
                      <option value="Educación">Educación</option>
                      <option value="Salud">Salud</option>
                      <option value="Finanzas">Finanzas</option>
                      <option value="Industria">Industria</option>
                      <option value="Energía">Energía</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="companyTaxId" className="mb-2 block text-sm sm:text-base">
                      CIF/NIF de empresa
                    </Label>
                    <Input
                      id="companyTaxId"
                      type="text"
                      autoComplete="off"
                      placeholder="B12345678"
                      value={formData.companyTaxId}
                      onChange={(event) => handleChange('companyTaxId', event.target.value)}
                      className="h-11 sm:h-12 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyLocation" className="mb-2 block text-sm sm:text-base">
                    Ubicación / ciudad
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <Input
                      id="companyLocation"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="Sevilla"
                      value={formData.companyLocation}
                      onChange={(event) => handleChange('companyLocation', event.target.value)}
                      className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-2">
              <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(Boolean(checked))} className="mt-1" />
              <p className="text-xs sm:text-sm leading-relaxed">
                Acepto los{' '}
                <button type="button" onClick={() => navigateToLegalPage(pageKeys.terms)} className="text-purple-600 hover:text-purple-700">
                  Términos y Condiciones
                </button>{' '}
                y la{' '}
                <button type="button" onClick={() => navigateToLegalPage(pageKeys.privacy)} className="text-purple-600 hover:text-purple-700">
                  Política de Privacidad
                </button>
                {isCompany && ' y entiendo que el perfil de empresa será revisado antes de publicarse.'}
              </p>
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11 sm:h-12 text-sm sm:text-base" disabled={!acceptTerms || isSubmitting}>
              {isSubmitting ? 'Creando cuenta...' : isCompany ? 'Crear cuenta de empresa' : 'Crear cuenta'}
            </Button>

            <p className="text-center text-xs sm:text-sm text-gray-600">
              Ya tienes cuenta?{' '}
              <button type="button" onClick={onSwitchToLogin} className="text-purple-600 hover:text-purple-700">
                Inicia sesión
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
