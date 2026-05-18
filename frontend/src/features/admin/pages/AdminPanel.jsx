import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  BriefcaseBusiness,
  ClipboardList,
  Clock3,
  FileText,
  Image,
  Pencil,
  Plus,
  Save,
  Tags,
  Trash2,
} from 'lucide-react';
import { Header } from '@/shared/components/layout/Header';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  createAdminCompany,
  createAdminJob,
  deleteAdminCompany,
  deleteAdminJob,
  fetchAdminApplications,
  fetchAdminCompanies,
  fetchAdminJobs,
  updateAdminApplication,
  updateAdminCompany,
  updateAdminJob,
} from '@/features/admin/services/adminApi';

const tabs = [
  { id: 'companies', label: 'Empresas', icon: Building2 },
  { id: 'jobs', label: 'Prácticas', icon: BriefcaseBusiness },
  { id: 'applications', label: 'Postulaciones', icon: ClipboardList },
];

const emptyCompanyForm = {
  id: null,
  name: '',
  slug: '',
  description: '',
  tagline: '',
  culture: '',
  location: '',
  size: '',
  website: '',
  industry: '',
  foundedYear: '',
  logo: '',
  banner: '',
  tags: '',
  benefits: '',
  gallery: '',
};

const emptyJobForm = {
  id: null,
  companyId: '',
  title: '',
  slug: '',
  description: '',
  overview: '',
  location: '',
  modality: 'HYBRID',
  status: 'OPEN',
  duration: '',
  salaryLabel: '',
  schedule: '',
  startDate: '',
  applicationDeadline: '',
  openings: '1',
  featured: 'false',
  tags: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  skills: '',
};

const statusLabels = {
  DRAFT: 'Borrador',
  OPEN: 'Abierta',
  CLOSED: 'Cerrada',
  SUBMITTED: 'Enviada',
  IN_REVIEW: 'En revisión',
  INTERVIEW: 'Entrevista',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  WITHDRAWN: 'Retirada',
};

function toCsv(value) {
  return Array.isArray(value) ? value.join(', ') : value || '';
}

function AdminTabs({ activeTab, onChange }) {
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

function TableHeader({ title, description, count }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg text-gray-900">{title}</h2>
        <Badge variant="secondary">{count}</Badge>
      </div>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
}

export function AdminPanel({ onNavigate }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('companies');
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [applicationDrafts, setApplicationDrafts] = useState({});
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const isAdmin = user?.role === 'ADMIN';

  async function loadAdminData() {
    setError(null);
    const [companiesResult, jobsResult, applicationsResult] = await Promise.all([
      fetchAdminCompanies(),
      fetchAdminJobs(),
      fetchAdminApplications(),
    ]);

    setCompanies(companiesResult);
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

    if (!isLoading && isAdmin) {
      loadAdminData().catch((requestError) => setError(requestError.message));
    }
  }, [isAuthenticated, isAdmin, isLoading]);

  const companyOptions = useMemo(() => companies.map((company) => ({ id: company.id, name: company.name })), [companies]);

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
      if (companyForm.id) {
        await updateAdminCompany(companyForm.id, companyForm);
        setSuccess('Empresa actualizada.');
      } else {
        await createAdminCompany(companyForm);
        setSuccess('Empresa creada.');
      }

      setCompanyForm(emptyCompanyForm);
      await loadAdminData();
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
        await updateAdminJob(jobForm.id, jobForm);
        setSuccess('Práctica actualizada.');
      } else {
        await createAdminJob(jobForm);
        setSuccess('Práctica creada.');
      }

      setJobForm(emptyJobForm);
      await loadAdminData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsBusy(false);
    }
  };

  const removeCompany = async (companyId) => {
    setIsBusy(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteAdminCompany(companyId);
      setSuccess('Empresa eliminada.');
      await loadAdminData();
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
      await deleteAdminJob(jobId);
      setSuccess('Práctica eliminada.');
      await loadAdminData();
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
      await updateAdminApplication(applicationId, applicationDrafts[applicationId]);
      setSuccess('Postulación actualizada.');
      await loadAdminData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsBusy(false);
    }
  };

  const requestDeleteCompany = (company) => {
    setPendingDelete({
      type: 'company',
      id: company.id,
      title: 'Eliminar empresa',
      description: `Vas a eliminar "${company.name}". Esta acción puede afectar a sus prácticas asociadas.`,
      confirmLabel: 'Eliminar empresa',
    });
  };

  const requestDeleteJob = (job) => {
    setPendingDelete({
      type: 'job',
      id: job.id,
      title: 'Eliminar práctica',
      description: `Vas a eliminar "${job.title}". Esta acción no se puede deshacer desde el panel.`,
      confirmLabel: 'Eliminar práctica',
    });
  };

  const confirmPendingDelete = async () => {
    const item = pendingDelete;
    if (!item) return;

    setPendingDelete(null);

    if (item.type === 'company') {
      await removeCompany(item.id);
      return;
    }

    await removeJob(item.id);
  };

  const editCompany = (company) => {
    setActiveTab('companies');
    setCompanyForm({
      id: company.id,
      name: company.name || '',
      slug: company.slug || '',
      description: company.description || '',
      tagline: company.tagline || '',
      culture: company.culture || '',
      location: company.location || '',
      size: company.size || '',
      website: company.website || '',
      industry: company.industry || '',
      foundedYear: company.foundedYear ? String(company.foundedYear) : '',
      logo: company.logo || '',
      banner: company.banner || '',
      tags: toCsv(company.tags),
      benefits: toCsv(company.benefits),
      gallery: toCsv(company.gallery),
    });
  };

  const editJob = (job) => {
    setActiveTab('jobs');
    setJobForm({
      id: job.id,
      companyId: job.companyId,
      title: job.title || '',
      slug: job.slug || '',
      description: job.description || '',
      overview: job.overview || '',
      location: job.location || '',
      modality: job.modality || 'HYBRID',
      status: job.status || 'OPEN',
      duration: job.duration || '',
      salaryLabel: job.salaryLabel || '',
      schedule: job.schedule || '',
      startDate: job.startDate || '',
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : '',
      openings: String(job.openings || 1),
      featured: String(Boolean(job.featured)),
      tags: toCsv(job.tags),
      responsibilities: toCsv(job.responsibilities),
      requirements: toCsv(job.requirements),
      benefits: toCsv(job.benefits),
      skills: toCsv(job.skills),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onNavigate={onNavigate} currentPage="admin" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-gray-600">Cargando sesión...</main>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onNavigate={onNavigate} currentPage="admin" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <h1 className="text-2xl mb-2">Acceso restringido</h1>
            <p className="text-gray-600">Tu usuario no tiene permisos de administración.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl mb-1">Panel de administración</h1>
            <p className="text-gray-600 text-sm">Gestión de empresas, prácticas y postulaciones.</p>
          </div>
          <AdminTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm">{success}</div>}

        {activeTab === 'companies' && (
          <section className="space-y-6">
            <form onSubmit={saveCompany} className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl text-gray-950">{companyForm.id ? 'Editar empresa' : 'Nueva empresa'}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Completa los datos que verá el estudiante en el perfil público de la empresa.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setCompanyForm(emptyCompanyForm)}>
                  <Plus className="w-4 h-4" />
                  Limpiar formulario
                </Button>
              </div>

              <FormBlock title="Datos principales" description="Información básica para identificar la empresa." icon={Building2}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Field id="company-name" label="Nombre">
                    <Input id="company-name" required placeholder="TalentBridge Labs" value={companyForm.name} onChange={(event) => handleCompanyChange('name', event.target.value)} />
                  </Field>
                  <Field id="company-slug" label="URL personalizada">
                    <Input id="company-slug" placeholder="talentbridge-labs" value={companyForm.slug} onChange={(event) => handleCompanyChange('slug', event.target.value)} />
                  </Field>
                  <Field id="company-tagline" label="Frase destacada">
                    <Input id="company-tagline" placeholder="Tecnología para impulsar talento joven" value={companyForm.tagline} onChange={(event) => handleCompanyChange('tagline', event.target.value)} />
                  </Field>
                  <Field id="company-location" label="Ubicación">
                    <Input id="company-location" placeholder="Sevilla, España" value={companyForm.location} onChange={(event) => handleCompanyChange('location', event.target.value)} />
                  </Field>
                  <Field id="company-industry" label="Sector">
                    <Input id="company-industry" placeholder="Tecnología, marketing, educación..." value={companyForm.industry} onChange={(event) => handleCompanyChange('industry', event.target.value)} />
                  </Field>
                  <Field id="company-size" label="Tamaño">
                    <Input id="company-size" placeholder="11-50 empleados" value={companyForm.size} onChange={(event) => handleCompanyChange('size', event.target.value)} />
                  </Field>
                  <Field id="company-foundedYear" label="Año de fundación">
                    <Input
                      id="company-foundedYear"
                      type="number"
                      min="1900"
                      max="2100"
                      placeholder="2024"
                      value={companyForm.foundedYear}
                      onChange={(event) => handleCompanyChange('foundedYear', event.target.value)}
                    />
                  </Field>
                  <Field id="company-website" label="Página web">
                    <Input id="company-website" placeholder="https://empresa.com" value={companyForm.website} onChange={(event) => handleCompanyChange('website', event.target.value)} />
                  </Field>
                  <div className="lg:col-span-2">
                    <Field id="company-description" label="Descripción">
                      <Textarea id="company-description" required className="min-h-28" placeholder="Explica qué hace la empresa y por qué es interesante para estudiantes en prácticas." value={companyForm.description} onChange={(event) => handleCompanyChange('description', event.target.value)} />
                    </Field>
                  </div>
                </div>
              </FormBlock>

              <FormBlock title="Imágenes" description="URLs públicas para mostrar el logo, la portada y la galería." icon={Image}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Field id="company-logo" label="Logo de la empresa">
                    <Input id="company-logo" placeholder="https://..." value={companyForm.logo} onChange={(event) => handleCompanyChange('logo', event.target.value)} />
                  </Field>
                  <Field id="company-banner" label="Imagen de portada">
                    <Input id="company-banner" placeholder="https://..." value={companyForm.banner} onChange={(event) => handleCompanyChange('banner', event.target.value)} />
                  </Field>
                  <div className="lg:col-span-2">
                    <Field id="company-gallery" label="Galería de imágenes">
                      <Textarea id="company-gallery" className="min-h-24" placeholder="Pega varias URLs separadas por comas." value={companyForm.gallery} onChange={(event) => handleCompanyChange('gallery', event.target.value)} />
                    </Field>
                  </div>
                </div>
              </FormBlock>

              <FormBlock title="Cultura y beneficios" description="Contenido que ayuda a presentar mejor la empresa." icon={Tags}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <Field id="company-culture" label="Cultura">
                      <Textarea id="company-culture" className="min-h-24" placeholder="Describe el ambiente de trabajo, forma de aprender y valores de la empresa." value={companyForm.culture} onChange={(event) => handleCompanyChange('culture', event.target.value)} />
                    </Field>
                  </div>
                  <Field id="company-tags" label="Etiquetas">
                    <Input id="company-tags" placeholder="Remoto, flexible, innovación" value={companyForm.tags} onChange={(event) => handleCompanyChange('tags', event.target.value)} />
                  </Field>
                  <Field id="company-benefits" label="Beneficios">
                    <Textarea id="company-benefits" className="min-h-24" placeholder="Mentoría, horario flexible, formación..." value={companyForm.benefits} onChange={(event) => handleCompanyChange('benefits', event.target.value)} />
                  </Field>
                </div>
              </FormBlock>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setCompanyForm(emptyCompanyForm)}>
                  Cancelar
                </Button>
                <Button disabled={isBusy} type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Save className="w-4 h-4" />
                  {isBusy ? 'Guardando...' : companyForm.id ? 'Guardar cambios' : 'Crear empresa'}
                </Button>
              </div>
            </form>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <TableHeader title="Empresas registradas" description="Edita o elimina perfiles de empresa desde esta tabla." count={`${companies.length} empresas`} />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left p-3">Empresa</th>
                      <th className="text-left p-3">Industria</th>
                      <th className="text-left p-3">Prácticas</th>
                      <th className="text-right p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id} className="border-t border-gray-100">
                        <td className="p-3">
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-500">{company.slug}</p>
                        </td>
                        <td className="p-3">{company.industry || 'Sin industria'}</td>
                        <td className="p-3">{company.jobCount}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => editCompany(company)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => requestDeleteCompany(company)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'jobs' && (
          <section className="space-y-6">
            <form onSubmit={saveJob} className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl text-gray-950">{jobForm.id ? 'Editar práctica' : 'Nueva práctica'}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Define la vacante que aparecerá en el buscador de prácticas.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setJobForm(emptyJobForm)}>
                  <Plus className="w-4 h-4" />
                  Limpiar formulario
                </Button>
              </div>

              <FormBlock title="Datos principales" description="Empresa, título, estado y datos básicos de la práctica." icon={BriefcaseBusiness}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Field id="job-company" label="Empresa">
                    <Select value={jobForm.companyId} onValueChange={(value) => handleJobChange('companyId', value)}>
                      <SelectTrigger id="job-company">
                        <SelectValue placeholder="Selecciona una empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companyOptions.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="job-title" label="Título de la práctica">
                    <Input id="job-title" required placeholder="Prácticas de desarrollo frontend" value={jobForm.title} onChange={(event) => handleJobChange('title', event.target.value)} />
                  </Field>
                  <Field id="job-slug" label="URL personalizada">
                    <Input id="job-slug" placeholder="practicas-desarrollo-frontend" value={jobForm.slug} onChange={(event) => handleJobChange('slug', event.target.value)} />
                  </Field>
                  <Field id="job-location" label="Ubicación">
                    <Input id="job-location" required placeholder="Sevilla, remoto o híbrido" value={jobForm.location} onChange={(event) => handleJobChange('location', event.target.value)} />
                  </Field>
                  <Field id="job-modality" label="Modalidad">
                    <Select value={jobForm.modality} onValueChange={(value) => handleJobChange('modality', value)}>
                      <SelectTrigger id="job-modality"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REMOTE">Remoto</SelectItem>
                        <SelectItem value="HYBRID">Híbrido</SelectItem>
                        <SelectItem value="ONSITE">Presencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="job-status" label="Estado">
                    <Select value={jobForm.status} onValueChange={(value) => handleJobChange('status', value)}>
                      <SelectTrigger id="job-status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Borrador</SelectItem>
                        <SelectItem value="OPEN">Abierta</SelectItem>
                        <SelectItem value="CLOSED">Cerrada</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field id="job-openings" label="Vacantes disponibles">
                    <Input id="job-openings" type="number" min="1" value={jobForm.openings} onChange={(event) => handleJobChange('openings', event.target.value)} />
                  </Field>
                  <Field id="job-featured" label="Marcar como destacada">
                    <Select value={jobForm.featured} onValueChange={(value) => handleJobChange('featured', value)}>
                      <SelectTrigger id="job-featured"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Sí</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FormBlock>

              <FormBlock title="Contenido público" description="Textos que verá el estudiante antes de postularse." icon={FileText}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <Field id="job-description" label="Descripción">
                      <Textarea id="job-description" required className="min-h-28" placeholder="Describe la práctica, el equipo y el tipo de aprendizaje esperado." value={jobForm.description} onChange={(event) => handleJobChange('description', event.target.value)} />
                    </Field>
                  </div>
                  <div className="lg:col-span-2">
                    <Field id="job-overview" label="Resumen público">
                      <Textarea id="job-overview" className="min-h-24" placeholder="Resumen breve para la página de detalle." value={jobForm.overview} onChange={(event) => handleJobChange('overview', event.target.value)} />
                    </Field>
                  </div>
                  <Field id="job-tags" label="Etiquetas">
                    <Input id="job-tags" placeholder="Frontend, React, UX" value={jobForm.tags} onChange={(event) => handleJobChange('tags', event.target.value)} />
                  </Field>
                  <Field id="job-skills" label="Habilidades">
                    <Textarea id="job-skills" className="min-h-24" placeholder="JavaScript, React, comunicación..." value={jobForm.skills} onChange={(event) => handleJobChange('skills', event.target.value)} />
                  </Field>
                  <Field id="job-responsibilities" label="Responsabilidades">
                    <Textarea id="job-responsibilities" className="min-h-28" placeholder="Tareas separadas por comas." value={jobForm.responsibilities} onChange={(event) => handleJobChange('responsibilities', event.target.value)} />
                  </Field>
                  <Field id="job-requirements" label="Requisitos">
                    <Textarea id="job-requirements" className="min-h-28" placeholder="Requisitos separados por comas." value={jobForm.requirements} onChange={(event) => handleJobChange('requirements', event.target.value)} />
                  </Field>
                  <div className="lg:col-span-2">
                    <Field id="job-benefits" label="Beneficios">
                      <Textarea id="job-benefits" className="min-h-24" placeholder="Formación, mentoría, ayuda económica..." value={jobForm.benefits} onChange={(event) => handleJobChange('benefits', event.target.value)} />
                    </Field>
                  </div>
                </div>
              </FormBlock>

              <FormBlock title="Condiciones y fechas" description="Datos operativos de la práctica." icon={Clock3}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Field id="job-duration" label="Duración">
                    <Input id="job-duration" placeholder="3 meses, 6 meses..." value={jobForm.duration} onChange={(event) => handleJobChange('duration', event.target.value)} />
                  </Field>
                  <Field id="job-salaryLabel" label="Ayuda económica">
                    <Input id="job-salaryLabel" placeholder="600 €/mes o no remunerada" value={jobForm.salaryLabel} onChange={(event) => handleJobChange('salaryLabel', event.target.value)} />
                  </Field>
                  <Field id="job-schedule" label="Horario">
                    <Input id="job-schedule" placeholder="Lunes a viernes, mañana" value={jobForm.schedule} onChange={(event) => handleJobChange('schedule', event.target.value)} />
                  </Field>
                  <Field id="job-startDate" label="Fecha de inicio">
                    <Input id="job-startDate" placeholder="Septiembre 2026" value={jobForm.startDate} onChange={(event) => handleJobChange('startDate', event.target.value)} />
                  </Field>
                  <Field id="job-applicationDeadline" label="Fecha límite de postulación">
                    <Input
                      id="job-applicationDeadline"
                      type="date"
                      value={jobForm.applicationDeadline}
                      onChange={(event) => handleJobChange('applicationDeadline', event.target.value)}
                    />
                  </Field>
                </div>
              </FormBlock>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setJobForm(emptyJobForm)}>
                  Cancelar
                </Button>
                <Button disabled={isBusy || !jobForm.companyId} type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Save className="w-4 h-4" />
                  {isBusy ? 'Guardando...' : jobForm.id ? 'Guardar cambios' : 'Crear práctica'}
                </Button>
              </div>
            </form>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <TableHeader title="Prácticas publicadas" description="Edita, cierra o elimina vacantes desde esta tabla." count={`${jobs.length} prácticas`} />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left p-3">Práctica</th>
                      <th className="text-left p-3">Empresa</th>
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
                        <td className="p-3">{job.company?.name}</td>
                        <td className="p-3"><Badge variant="secondary">{statusLabels[job.status] || job.status}</Badge></td>
                        <td className="p-3">{job.applicationCount}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => editJob(job)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => requestDeleteJob(job)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'applications' && (
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left p-3">Estudiante</th>
                    <th className="text-left p-3">Práctica</th>
                    <th className="text-left p-3">Estado</th>
                    <th className="text-left p-3">Siguiente paso</th>
                    <th className="text-right p-3">Guardar</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => {
                    const draft = applicationDrafts[application.id] || { status: application.status, nextStep: application.nextStep || '' };
                    return (
                      <tr key={application.id} className="border-t border-gray-100 align-top">
                        <td className="p-3">
                          <p className="font-medium text-gray-900">{application.user.firstName} {application.user.lastName}</p>
                          <p className="text-xs text-gray-500">{application.user.email}</p>
                        </td>
                        <td className="p-3">
                          <p>{application.job.title}</p>
                          <p className="text-xs text-gray-500">{application.job.company.name}</p>
                        </td>
                        <td className="p-3 min-w-40">
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
                              <SelectItem value="WITHDRAWN">Retirada</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3 min-w-64">
                          <Input
                            value={draft.nextStep}
                            onChange={(event) =>
                              setApplicationDrafts((current) => ({ ...current, [application.id]: { ...draft, nextStep: event.target.value } }))
                            }
                          />
                        </td>
                        <td className="p-3 text-right">
                          <Button type="button" size="sm" disabled={isBusy} onClick={() => saveApplication(application.id)} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Guardar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {pendingDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4" style={{ zIndex: 9999 }}>
            <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white border border-gray-200 shadow-xl p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg mb-2">{pendingDelete.title}</h2>
                  <p className="text-sm text-gray-600">{pendingDelete.description}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setPendingDelete(null)} disabled={isBusy}>
                  Cancelar
                </Button>
                <Button type="button" onClick={confirmPendingDelete} disabled={isBusy} className="bg-red-600 hover:bg-red-700 text-white">
                  {isBusy ? 'Eliminando...' : pendingDelete.confirmLabel}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
