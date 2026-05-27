import React, { useEffect, useMemo, useState } from 'react';
import { Building2, BriefcaseBusiness, ClipboardList, Clock3, FileText, Image, Pencil, Plus, Save, Tags, Trash2 } from 'lucide-react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ApplicantProfileModal } from '@/features/applications/components/ApplicantProfileModal';
import {
  createCompanyJob,
  deleteCompanyJob,
  fetchCompanyApplications,
  fetchCompanyJobs,
  fetchCompanyPortal,
  updateCompanyApplication,
  updateCompanyJob,
  updateCompanyProfile,
} from '@/features/company/services/companyApi';

const tabs = [
  { id: 'profile', label: 'Perfil', icon: Building2 },
  { id: 'jobs', label: 'Prácticas', icon: BriefcaseBusiness },
  { id: 'applications', label: 'Postulaciones', icon: ClipboardList },
];

const jobCategories = [
  { value: 'DEVELOPMENT', label: 'Desarrollo' },
  { value: 'DESIGN', label: 'Diseño UX/UI' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'DATA', label: 'Datos' },
  { value: 'PRODUCT', label: 'Producto' },
  { value: 'CLOUD_DEVOPS', label: 'Cloud / DevOps' },
  { value: 'CYBERSECURITY', label: 'Ciberseguridad' },
  { value: 'QA', label: 'Testing / QA' },
  { value: 'CONTENT', label: 'Contenido' },
  { value: 'OPERATIONS', label: 'Operaciones' },
];

const jobCategoryLabels = Object.fromEntries(jobCategories.map((category) => [category.value, category.label]));

const companyStatusLabels = {
  PENDING: 'Pendiente de revisión',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  HIDDEN: 'No visible',
};

const jobStatusLabels = {
  DRAFT: 'Borrador',
  PENDING_REVIEW: 'Pendiente de revisión',
  OPEN: 'Publicada',
  CLOSED: 'Cerrada',
};

const applicationStatusLabels = {
  SUBMITTED: 'Enviada',
  IN_REVIEW: 'En revisión',
  INTERVIEW: 'Entrevista',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  WITHDRAWN: 'Retirada',
};

const emptyCompanyForm = {
  name: '',
  description: '',
  tagline: '',
  culture: '',
  location: '',
  size: '',
  website: '',
  industry: '',
  taxId: '',
  foundedYear: '',
  logo: '',
  banner: '',
  tags: '',
  benefits: '',
  gallery: '',
};

const emptyJobForm = {
  id: null,
  title: '',
  slug: '',
  description: '',
  overview: '',
  category: 'DEVELOPMENT',
  location: '',
  modality: 'HYBRID',
  status: 'PENDING_REVIEW',
  duration: '',
  salaryLabel: '',
  schedule: '',
  startDate: '',
  applicationDeadline: '',
  openings: '1',
  tags: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  skills: '',
};

function toCsv(value) {
  return Array.isArray(value) ? value.join(', ') : value || '';
}

function getTodayInputDate() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

function Field({ id, label, children }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block text-sm">
        {label}
      </Label>
      {children}
    </div>
  );
}

function FormBlock({ title, description, icon: Icon, children }) {
  return (
    <section className="space-y-4 border-t border-gray-100 pt-5 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <h3 className="text-base text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function CompanyTabs({ activeTab, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
            activeTab === id ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

function getCompanyStatusClass(status) {
  if (status === 'APPROVED') return 'bg-green-50 border-green-200 text-green-800';
  if (status === 'REJECTED') return 'bg-red-50 border-red-200 text-red-800';
  if (status === 'HIDDEN') return 'bg-gray-50 border-gray-200 text-gray-700';
  return 'bg-amber-50 border-amber-200 text-amber-800';
}

function mapCompanyToForm(company) {
  return {
    name: company?.name || '',
    description: company?.description || '',
    tagline: company?.tagline || '',
    culture: company?.culture || '',
    location: company?.location || '',
    size: company?.size || '',
    website: company?.website || '',
    industry: company?.industry || '',
    taxId: company?.taxId || '',
    foundedYear: company?.foundedYear ? String(company.foundedYear) : '',
    logo: company?.logo || '',
    banner: company?.banner || '',
    tags: toCsv(company?.tags),
    benefits: toCsv(company?.benefits),
    gallery: toCsv(company?.gallery),
  };
}

function mapJobToForm(job) {
  return {
    id: job.id,
    title: job.title || '',
    slug: job.slug || '',
    description: job.description || '',
    overview: job.overview || '',
    category: job.category || 'DEVELOPMENT',
    location: job.location || '',
    modality: job.modality || 'HYBRID',
    status: job.status === 'OPEN' ? 'PENDING_REVIEW' : job.status || 'PENDING_REVIEW',
    duration: job.duration || '',
    salaryLabel: job.salaryLabel || '',
    schedule: job.schedule || '',
    startDate: job.startDate || '',
    applicationDeadline: job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : '',
    openings: String(job.openings || 1),
    tags: toCsv(job.tags),
    responsibilities: toCsv(job.responsibilities),
    requirements: toCsv(job.requirements),
    benefits: toCsv(job.benefits),
    skills: toCsv(job.skills),
  };
}

export function CompanyDashboard({ onNavigate }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [applicationDrafts, setApplicationDrafts] = useState({});
  const [profileApplication, setProfileApplication] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isCompanyUser = user?.role === 'COMPANY';
  const minApplicationDeadline = useMemo(() => getTodayInputDate(), []);
  const stats = useMemo(
    () => ({
      published: jobs.filter((job) => job.status === 'OPEN').length,
      pending: jobs.filter((job) => job.status === 'PENDING_REVIEW').length,
      applications: applications.length,
    }),
    [applications.length, jobs],
  );

  async function loadCompanyData() {
    setError(null);
    const [companyResult, jobsResult, applicationsResult] = await Promise.all([
      fetchCompanyPortal(),
      fetchCompanyJobs(),
      fetchCompanyApplications(),
    ]);

    setCompany(companyResult);
    setCompanyForm(mapCompanyToForm(companyResult));
    setJobs(jobsResult);
    setApplications(applicationsResult);
    setApplicationDrafts(
      Object.fromEntries(
        applicationsResult.map((application) => [
          application.id,
          { status: application.status, nextStep: application.nextStep || '' },
        ]),
      ),
    );
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onNavigate('login');
      return;
    }

    if (!isLoading && isAuthenticated && !isCompanyUser) {
      onNavigate(user?.role === 'ADMIN' ? 'admin' : 'dashboard');
      return;
    }

    if (!isLoading && isCompanyUser) {
      loadCompanyData().catch((requestError) => setError(requestError.message));
    }
  }, [isAuthenticated, isCompanyUser, isLoading, user?.role]);

  const handleCompanyChange = (field, value) => {
    setCompanyForm((current) => ({ ...current, [field]: value }));
  };

  const handleJobChange = (field, value) => {
    setJobForm((current) => ({ ...current, [field]: value }));
  };

  const saveCompany = async (event) => {
    event.preventDefault();
    setIsBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateCompanyProfile(companyForm);
      setCompany(updated);
      setCompanyForm(mapCompanyToForm(updated));
      setSuccess('Perfil de empresa actualizado.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsBusy(false);
    }
  };

  const saveJob = async (event) => {
    event.preventDefault();
    setIsBusy(true);
    setError(null);
    setSuccess(null);

    try {
      if (jobForm.id) {
        await updateCompanyJob(jobForm.id, jobForm);
        setSuccess('Práctica enviada a revisión.');
      } else {
        await createCompanyJob(jobForm);
        setSuccess('Práctica creada y enviada a revisión.');
      }

      setJobForm(emptyJobForm);
      await loadCompanyData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsBusy(false);
    }
  };

  const removeJob = async (jobId) => {
    setIsBusy(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteCompanyJob(jobId);
      setSuccess('Práctica eliminada.');
      await loadCompanyData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsBusy(false);
    }
  };

  const saveApplication = async (applicationId) => {
    setIsBusy(true);
    setError(null);
    setSuccess(null);

    try {
      await updateCompanyApplication(applicationId, applicationDrafts[applicationId]);
      setSuccess('Postulación actualizada.');
      await loadCompanyData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsBusy(false);
    }
  };

  if (isLoading || !isAuthenticated || !isCompanyUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header onNavigate={onNavigate} currentPage="company-dashboard" />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 text-gray-600">Cargando panel de empresa...</main>
        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="company-dashboard" />

      <main className="tb-panel-shell flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl mb-1">Panel de empresa</h1>
            <p className="text-gray-600 text-sm">Gestiona tu perfil, tus prácticas y las postulaciones recibidas.</p>
          </div>
          <CompanyTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {company && (
          <div className={`rounded-xl border p-4 ${getCompanyStatusClass(company.status)}`}>
            <p className="text-sm">
              Estado de la empresa: <strong>{companyStatusLabels[company.status] || company.status}</strong>
              {company.status === 'PENDING' && ' · Puedes completar el perfil y crear prácticas, pero no serán públicas hasta la aprobación.'}
              {company.status === 'REJECTED' && ' · Actualiza la información para que el admin pueda revisarla de nuevo.'}
              {company.status === 'HIDDEN' && ' · Tu empresa y sus prácticas están ocultas en la parte pública de TalentBridge.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl text-gray-950">{stats.published}</p>
            <p className="text-sm text-gray-600">Prácticas publicadas</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl text-gray-950">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pendientes de revisión</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl text-gray-950">{stats.applications}</p>
            <p className="text-sm text-gray-600">Postulaciones recibidas</p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm" role="alert">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm" role="status" aria-live="polite">{success}</div>}

        {activeTab === 'profile' && (
          <form onSubmit={saveCompany} className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl text-gray-950">Perfil de empresa</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Completa los datos que verá el estudiante en el perfil público de la empresa.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => company && setCompanyForm(mapCompanyToForm(company))}>
                Restaurar datos
              </Button>
            </div>

            <FormBlock title="Datos principales" description="Información básica para identificar la empresa." icon={Building2}>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Field id="portal-company-name" label="Nombre">
                  <Input id="portal-company-name" required placeholder="TalentBridge Labs" value={companyForm.name} onChange={(event) => handleCompanyChange('name', event.target.value)} />
                </Field>
                <Field id="portal-company-tax-id" label="CIF/NIF de empresa">
                  <Input id="portal-company-tax-id" required placeholder="B12345678" value={companyForm.taxId} onChange={(event) => handleCompanyChange('taxId', event.target.value)} />
                </Field>
                <Field id="portal-company-tagline" label="Frase destacada">
                  <Input id="portal-company-tagline" placeholder="Tecnología para impulsar talento joven" value={companyForm.tagline} onChange={(event) => handleCompanyChange('tagline', event.target.value)} />
                </Field>
                <Field id="portal-company-location" label="Ubicación">
                  <Input id="portal-company-location" placeholder="Sevilla, España" value={companyForm.location} onChange={(event) => handleCompanyChange('location', event.target.value)} />
                </Field>
                <Field id="portal-company-industry" label="Sector">
                  <Input id="portal-company-industry" placeholder="Tecnología, marketing, educación..." value={companyForm.industry} onChange={(event) => handleCompanyChange('industry', event.target.value)} />
                </Field>
                <Field id="portal-company-size" label="Tamaño">
                  <Input id="portal-company-size" placeholder="11-50 empleados" value={companyForm.size} onChange={(event) => handleCompanyChange('size', event.target.value)} />
                </Field>
                <Field id="portal-company-foundedYear" label="Año de fundación">
                  <Input
                    id="portal-company-foundedYear"
                    type="number"
                    min="1900"
                    max="2100"
                    placeholder="2024"
                    value={companyForm.foundedYear}
                    onChange={(event) => handleCompanyChange('foundedYear', event.target.value)}
                  />
                </Field>
                <Field id="portal-company-website" label="Página web">
                  <Input id="portal-company-website" placeholder="https://empresa.com" value={companyForm.website} onChange={(event) => handleCompanyChange('website', event.target.value)} />
                </Field>
                <div className="lg:col-span-2">
                  <Field id="portal-company-description" label="Descripción">
                    <Textarea
                      id="portal-company-description"
                      required
                      className="min-h-28"
                      placeholder="Explica qué hace la empresa y por qué es interesante para estudiantes en prácticas."
                      value={companyForm.description}
                      onChange={(event) => handleCompanyChange('description', event.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </FormBlock>

            <FormBlock title="Imágenes" description="URLs públicas para mostrar el logo, la portada y la galería." icon={Image}>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Field id="portal-company-logo" label="Logo de la empresa">
                  <Input id="portal-company-logo" placeholder="https://..." value={companyForm.logo} onChange={(event) => handleCompanyChange('logo', event.target.value)} />
                </Field>
                <Field id="portal-company-banner" label="Imagen de portada">
                  <Input id="portal-company-banner" placeholder="https://..." value={companyForm.banner} onChange={(event) => handleCompanyChange('banner', event.target.value)} />
                </Field>
                <div className="lg:col-span-2">
                  <Field id="portal-company-gallery" label="Galería de imágenes">
                    <Textarea id="portal-company-gallery" className="min-h-24" placeholder="Pega varias URLs separadas por comas." value={companyForm.gallery} onChange={(event) => handleCompanyChange('gallery', event.target.value)} />
                  </Field>
                </div>
              </div>
            </FormBlock>

            <FormBlock title="Cultura y beneficios" description="Contenido que ayuda a presentar mejor la empresa." icon={Tags}>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <Field id="portal-company-culture" label="Cultura">
                    <Textarea id="portal-company-culture" className="min-h-24" placeholder="Describe el ambiente de trabajo, forma de aprender y valores de la empresa." value={companyForm.culture} onChange={(event) => handleCompanyChange('culture', event.target.value)} />
                  </Field>
                </div>
                <Field id="portal-company-tags" label="Etiquetas">
                  <Input id="portal-company-tags" placeholder="Remoto, flexible, innovación" value={companyForm.tags} onChange={(event) => handleCompanyChange('tags', event.target.value)} />
                </Field>
                <Field id="portal-company-benefits" label="Beneficios">
                  <Textarea id="portal-company-benefits" className="min-h-24" placeholder="Mentoría, horario flexible, formación..." value={companyForm.benefits} onChange={(event) => handleCompanyChange('benefits', event.target.value)} />
                </Field>
              </div>
            </FormBlock>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <Button disabled={isBusy} type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                <Save className="w-4 h-4" />
                {isBusy ? 'Guardando...' : 'Guardar perfil'}
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'jobs' && (
          <section className="space-y-6">
            <form onSubmit={saveJob} className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl text-gray-950">{jobForm.id ? 'Editar práctica' : 'Nueva práctica'}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Define la vacante que enviarás a revisión para que pueda aparecer en el buscador de prácticas.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setJobForm(emptyJobForm)}>
                  <Plus className="w-4 h-4" />
                  Limpiar formulario
                </Button>
              </div>

              <FormBlock title="Datos principales" description="Título, estado y datos básicos de la práctica." icon={BriefcaseBusiness}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Field id="portal-job-title" label="Título de la práctica">
                    <Input id="portal-job-title" required placeholder="Prácticas de desarrollo frontend" value={jobForm.title} onChange={(event) => handleJobChange('title', event.target.value)} />
                  </Field>
                  <Field id="portal-job-slug" label="URL personalizada">
                    <Input id="portal-job-slug" placeholder="practicas-desarrollo-frontend" value={jobForm.slug} onChange={(event) => handleJobChange('slug', event.target.value)} />
                  </Field>
                  <Field id="portal-job-location" label="Ubicación">
                    <Input id="portal-job-location" required placeholder="Sevilla, remoto o híbrido" value={jobForm.location} onChange={(event) => handleJobChange('location', event.target.value)} />
                  </Field>
                  <Field id="portal-job-category" label="Categoría">
                    <Select value={jobForm.category} onValueChange={(value) => handleJobChange('category', value)}>
                      <SelectTrigger id="portal-job-category"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {jobCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="portal-job-modality" label="Modalidad">
                    <Select value={jobForm.modality} onValueChange={(value) => handleJobChange('modality', value)}>
                      <SelectTrigger id="portal-job-modality"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REMOTE">Remoto</SelectItem>
                        <SelectItem value="HYBRID">Híbrido</SelectItem>
                        <SelectItem value="ONSITE">Presencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="portal-job-status" label="Estado">
                    <Select value={jobForm.status} onValueChange={(value) => handleJobChange('status', value)}>
                      <SelectTrigger id="portal-job-status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Borrador</SelectItem>
                        <SelectItem value="PENDING_REVIEW">Pendiente de revisión</SelectItem>
                        <SelectItem value="CLOSED">Cerrada</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="portal-job-openings" label="Vacantes disponibles">
                    <Input id="portal-job-openings" type="number" min="1" value={jobForm.openings} onChange={(event) => handleJobChange('openings', event.target.value)} />
                  </Field>
                </div>
              </FormBlock>

              <FormBlock title="Contenido público" description="Textos que verá el estudiante antes de postularse." icon={FileText}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <Field id="portal-job-description" label="Descripción">
                      <Textarea id="portal-job-description" required className="min-h-28" placeholder="Describe la práctica, el equipo y el tipo de aprendizaje esperado." value={jobForm.description} onChange={(event) => handleJobChange('description', event.target.value)} />
                    </Field>
                  </div>
                  <div className="lg:col-span-2">
                    <Field id="portal-job-overview" label="Resumen público">
                      <Textarea id="portal-job-overview" className="min-h-24" placeholder="Resumen breve para la página de detalle." value={jobForm.overview} onChange={(event) => handleJobChange('overview', event.target.value)} />
                    </Field>
                  </div>
                  <Field id="portal-job-tags" label="Etiquetas">
                    <Input id="portal-job-tags" placeholder="Frontend, React, UX" value={jobForm.tags} onChange={(event) => handleJobChange('tags', event.target.value)} />
                  </Field>
                  <Field id="portal-job-skills" label="Habilidades">
                    <Textarea id="portal-job-skills" className="min-h-24" placeholder="JavaScript, React, comunicación..." value={jobForm.skills} onChange={(event) => handleJobChange('skills', event.target.value)} />
                  </Field>
                  <Field id="portal-job-responsibilities" label="Responsabilidades">
                    <Textarea id="portal-job-responsibilities" className="min-h-28" placeholder="Tareas separadas por comas." value={jobForm.responsibilities} onChange={(event) => handleJobChange('responsibilities', event.target.value)} />
                  </Field>
                  <Field id="portal-job-requirements" label="Requisitos">
                    <Textarea id="portal-job-requirements" className="min-h-28" placeholder="Requisitos separados por comas." value={jobForm.requirements} onChange={(event) => handleJobChange('requirements', event.target.value)} />
                  </Field>
                  <div className="lg:col-span-2">
                    <Field id="portal-job-benefits" label="Beneficios">
                      <Textarea id="portal-job-benefits" className="min-h-24" placeholder="Formación, mentoría, ayuda económica..." value={jobForm.benefits} onChange={(event) => handleJobChange('benefits', event.target.value)} />
                    </Field>
                  </div>
                </div>
              </FormBlock>

              <FormBlock title="Condiciones y fechas" description="Datos operativos de la práctica." icon={Clock3}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Field id="portal-job-duration" label="Duración">
                    <Input id="portal-job-duration" placeholder="3 meses, 6 meses..." value={jobForm.duration} onChange={(event) => handleJobChange('duration', event.target.value)} />
                  </Field>
                  <Field id="portal-job-salary" label="Ayuda económica">
                    <Input id="portal-job-salary" placeholder="600 €/mes o no remunerada" value={jobForm.salaryLabel} onChange={(event) => handleJobChange('salaryLabel', event.target.value)} />
                  </Field>
                  <Field id="portal-job-schedule" label="Horario">
                    <Input id="portal-job-schedule" placeholder="Lunes a viernes, mañana" value={jobForm.schedule} onChange={(event) => handleJobChange('schedule', event.target.value)} />
                  </Field>
                  <Field id="portal-job-startDate" label="Fecha de inicio">
                    <Input id="portal-job-startDate" placeholder="Septiembre 2026" value={jobForm.startDate} onChange={(event) => handleJobChange('startDate', event.target.value)} />
                  </Field>
                  <Field id="portal-job-deadline" label="Fecha límite de postulación">
                    <Input id="portal-job-deadline" type="date" min={minApplicationDeadline} value={jobForm.applicationDeadline} onChange={(event) => handleJobChange('applicationDeadline', event.target.value)} />
                  </Field>
                </div>
              </FormBlock>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setJobForm(emptyJobForm)}>Cancelar</Button>
                <Button disabled={isBusy} type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Save className="w-4 h-4" />
                  {isBusy ? 'Guardando...' : jobForm.id ? 'Guardar cambios' : 'Crear práctica'}
                </Button>
              </div>
            </form>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 px-4 py-4">
                <h2 className="text-lg text-gray-900">Prácticas de la empresa</h2>
                <p className="text-sm text-gray-500">Solo las aprobadas por admin aparecen públicas.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left p-3">Práctica</th>
                      <th className="text-left p-3">Categoría</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-left p-3">Postulaciones</th>
                      <th className="text-right p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-t border-gray-100">
                        <td className="p-3">
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-xs text-gray-500">{job.location}</p>
                        </td>
                        <td className="p-3">{jobCategoryLabels[job.category] || job.category}</td>
                        <td className="p-3"><Badge variant="secondary">{jobStatusLabels[job.status] || job.status}</Badge></td>
                        <td className="p-3">{job.applicationCount || 0}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setJobForm(mapJobToForm(job))}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => removeJob(job.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {jobs.length === 0 && (
                      <tr>
                        <td className="p-4 text-gray-600" colSpan={5}>Aún no has creado prácticas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'applications' && (
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-4">
              <h2 className="text-lg text-gray-900">Postulaciones recibidas</h2>
              <p className="text-sm text-gray-500">
                Revisa el perfil del estudiante y actualiza el estado del proceso. El siguiente paso será visible para el candidato.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
              {applications.map((application) => {
                const draft = applicationDrafts[application.id] || { status: application.status, nextStep: application.nextStep || '' };

                return (
                  <article key={application.id} className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex h-full flex-col gap-3">
                      <div>
                        <p className="font-medium text-gray-950">{application.user.firstName} {application.user.lastName}</p>
                        <p className="break-words text-xs text-gray-500">{application.user.email}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-stretch">
                        <div className="rounded-lg bg-gray-50 px-3 py-3">
                          <p className="text-sm font-medium text-gray-900">{application.job.title}</p>
                          <p className="text-xs text-gray-500">{application.job.location}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                          <Button type="button" variant="outline" onClick={() => setProfileApplication(application)} className="w-full">
                            Ver perfil
                          </Button>
                          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                            <Label className="shrink-0 text-xs text-gray-500">Estado:</Label>
                            <div className="min-w-0 flex-1">
                              <Select
                                value={draft.status}
                                onValueChange={(value) =>
                                  setApplicationDrafts((current) => ({ ...current, [application.id]: { ...draft, status: value } }))
                                }
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SUBMITTED">Enviada</SelectItem>
                                  <SelectItem value="IN_REVIEW">En revisión</SelectItem>
                                  <SelectItem value="INTERVIEW">Entrevista</SelectItem>
                                  <SelectItem value="ACCEPTED">Aceptada</SelectItem>
                                  <SelectItem value="REJECTED">Rechazada</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block text-xs text-gray-500">Siguiente paso</Label>
                        <Textarea
                          value={draft.nextStep}
                          placeholder="Ej. Revisaremos tu perfil y te contactaremos por email."
                          className="min-h-20 resize-y text-sm"
                          onChange={(event) =>
                            setApplicationDrafts((current) => ({ ...current, [application.id]: { ...draft, nextStep: event.target.value } }))
                          }
                        />
                      </div>
                      <div className="mt-auto flex justify-center">
                        <Button
                          type="button"
                          disabled={isBusy || application.status === 'WITHDRAWN'}
                          onClick={() => saveApplication(application.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          style={{ width: '50%' }}
                        >
                          Guardar cambios
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
              {applications.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-600">
                  Aún no hay postulaciones.
                </div>
              )}
            </div>

          </section>
        )}

        {profileApplication && (
          <ApplicantProfileModal application={profileApplication} onClose={() => setProfileApplication(null)} />
        )}
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
