import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Building2, BriefcaseBusiness, ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';
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
  fetchAdminSummary,
  updateAdminApplication,
  updateAdminCompany,
  updateAdminJob,
} from '@/features/admin/services/adminApi';

const tabs = [
  { id: 'summary', label: 'Resumen', icon: BarChart3 },
  { id: 'companies', label: 'Empresas', icon: Building2 },
  { id: 'jobs', label: 'Practicas', icon: BriefcaseBusiness },
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
  IN_REVIEW: 'En revision',
  INTERVIEW: 'Entrevista',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  WITHDRAWN: 'Retirada',
};

function formatDate(value) {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-ES');
}

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

export function AdminPanel({ onNavigate }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [summary, setSummary] = useState(null);
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
    const [summaryResult, companiesResult, jobsResult, applicationsResult] = await Promise.all([
      fetchAdminSummary(),
      fetchAdminCompanies(),
      fetchAdminJobs(),
      fetchAdminApplications(),
    ]);

    setSummary(summaryResult);
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
        setSuccess('Practica actualizada.');
      } else {
        await createAdminJob(jobForm);
        setSuccess('Practica creada.');
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
      setSuccess('Practica eliminada.');
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
      setSuccess('Postulacion actualizada.');
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
      description: `Vas a eliminar "${company.name}". Esta accion puede afectar a sus practicas asociadas.`,
      confirmLabel: 'Eliminar empresa',
    });
  };

  const requestDeleteJob = (job) => {
    setPendingDelete({
      type: 'job',
      id: job.id,
      title: 'Eliminar practica',
      description: `Vas a eliminar "${job.title}". Esta accion no se puede deshacer desde el panel.`,
      confirmLabel: 'Eliminar practica',
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-gray-600">Cargando sesion...</main>
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
            <p className="text-gray-600">Tu usuario no tiene permisos de administracion.</p>
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
            <h1 className="text-2xl sm:text-3xl mb-1">Panel de administracion</h1>
            <p className="text-gray-600 text-sm">Gestion de empresas, practicas y postulaciones.</p>
          </div>
          <AdminTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm">{success}</div>}

        {activeTab === 'summary' && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['Empresas', summary?.companies ?? 0],
              ['Practicas', summary?.jobs?.total ?? 0],
              ['Abiertas', summary?.jobs?.open ?? 0],
              ['Postulaciones', summary?.applications ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-2xl">{value}</p>
                <p className="text-sm text-gray-600">{label}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === 'companies' && (
          <section className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
            <form onSubmit={saveCompany} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl">{companyForm.id ? 'Editar empresa' : 'Nueva empresa'}</h2>
                <Button type="button" variant="outline" size="sm" onClick={() => setCompanyForm(emptyCompanyForm)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva
                </Button>
              </div>
              <Field id="company-name" label="Nombre">
                <Input id="company-name" required value={companyForm.name} onChange={(event) => handleCompanyChange('name', event.target.value)} />
              </Field>
              <Field id="company-slug" label="Slug">
                <Input id="company-slug" value={companyForm.slug} onChange={(event) => handleCompanyChange('slug', event.target.value)} />
              </Field>
              <Field id="company-description" label="Descripcion">
                <Textarea id="company-description" required value={companyForm.description} onChange={(event) => handleCompanyChange('description', event.target.value)} />
              </Field>
              <Field id="company-tagline" label="Tagline">
                <Input id="company-tagline" value={companyForm.tagline} onChange={(event) => handleCompanyChange('tagline', event.target.value)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id="company-location" label="Ubicacion">
                  <Input id="company-location" value={companyForm.location} onChange={(event) => handleCompanyChange('location', event.target.value)} />
                </Field>
                <Field id="company-industry" label="Industria">
                  <Input id="company-industry" value={companyForm.industry} onChange={(event) => handleCompanyChange('industry', event.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id="company-size" label="Tamano">
                  <Input id="company-size" value={companyForm.size} onChange={(event) => handleCompanyChange('size', event.target.value)} />
                </Field>
                <Field id="company-foundedYear" label="Ano de fundacion">
                  <Input
                    id="company-foundedYear"
                    type="number"
                    min="1900"
                    max="2100"
                    value={companyForm.foundedYear}
                    onChange={(event) => handleCompanyChange('foundedYear', event.target.value)}
                  />
                </Field>
              </div>
              <Field id="company-website" label="Web">
                <Input id="company-website" value={companyForm.website} onChange={(event) => handleCompanyChange('website', event.target.value)} />
              </Field>
              <Field id="company-logo" label="Logo (URL)">
                <Input id="company-logo" value={companyForm.logo} onChange={(event) => handleCompanyChange('logo', event.target.value)} />
              </Field>
              <Field id="company-banner" label="Banner (URL)">
                <Input id="company-banner" value={companyForm.banner} onChange={(event) => handleCompanyChange('banner', event.target.value)} />
              </Field>
              <Field id="company-culture" label="Cultura">
                <Textarea id="company-culture" value={companyForm.culture} onChange={(event) => handleCompanyChange('culture', event.target.value)} />
              </Field>
              <Field id="company-tags" label="Tags (separados por comas)">
                <Input id="company-tags" value={companyForm.tags} onChange={(event) => handleCompanyChange('tags', event.target.value)} />
              </Field>
              <Field id="company-benefits" label="Beneficios (separados por comas)">
                <Textarea id="company-benefits" value={companyForm.benefits} onChange={(event) => handleCompanyChange('benefits', event.target.value)} />
              </Field>
              <Field id="company-gallery" label="Galeria (URLs separadas por comas)">
                <Textarea id="company-gallery" value={companyForm.gallery} onChange={(event) => handleCompanyChange('gallery', event.target.value)} />
              </Field>
              <Button disabled={isBusy} type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                {isBusy ? 'Guardando...' : 'Guardar empresa'}
              </Button>
            </form>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left p-3">Empresa</th>
                      <th className="text-left p-3">Industria</th>
                      <th className="text-left p-3">Practicas</th>
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
          <section className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
            <form onSubmit={saveJob} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl">{jobForm.id ? 'Editar practica' : 'Nueva practica'}</h2>
                <Button type="button" variant="outline" size="sm" onClick={() => setJobForm(emptyJobForm)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva
                </Button>
              </div>
              <Field id="job-company" label="Empresa">
                <Select value={jobForm.companyId} onValueChange={(value) => handleJobChange('companyId', value)}>
                  <SelectTrigger id="job-company">
                    <SelectValue placeholder="Selecciona empresa" />
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
              <Field id="job-title" label="Titulo">
                <Input id="job-title" required value={jobForm.title} onChange={(event) => handleJobChange('title', event.target.value)} />
              </Field>
              <Field id="job-slug" label="Slug">
                <Input id="job-slug" value={jobForm.slug} onChange={(event) => handleJobChange('slug', event.target.value)} />
              </Field>
              <Field id="job-description" label="Descripcion">
                <Textarea id="job-description" required value={jobForm.description} onChange={(event) => handleJobChange('description', event.target.value)} />
              </Field>
              <Field id="job-overview" label="Resumen publico">
                <Textarea id="job-overview" value={jobForm.overview} onChange={(event) => handleJobChange('overview', event.target.value)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id="job-location" label="Ubicacion">
                  <Input id="job-location" required value={jobForm.location} onChange={(event) => handleJobChange('location', event.target.value)} />
                </Field>
                <Field id="job-duration" label="Duracion">
                  <Input id="job-duration" value={jobForm.duration} onChange={(event) => handleJobChange('duration', event.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id="job-modality" label="Modalidad">
                  <Select value={jobForm.modality} onValueChange={(value) => handleJobChange('modality', value)}>
                    <SelectTrigger id="job-modality"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REMOTE">Remoto</SelectItem>
                      <SelectItem value="HYBRID">Hibrido</SelectItem>
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
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id="job-salaryLabel" label="Salario o ayuda">
                  <Input id="job-salaryLabel" value={jobForm.salaryLabel} onChange={(event) => handleJobChange('salaryLabel', event.target.value)} />
                </Field>
                <Field id="job-schedule" label="Horario">
                  <Input id="job-schedule" value={jobForm.schedule} onChange={(event) => handleJobChange('schedule', event.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id="job-startDate" label="Fecha de inicio">
                  <Input id="job-startDate" value={jobForm.startDate} onChange={(event) => handleJobChange('startDate', event.target.value)} />
                </Field>
                <Field id="job-applicationDeadline" label="Fecha limite">
                  <Input
                    id="job-applicationDeadline"
                    type="date"
                    value={jobForm.applicationDeadline}
                    onChange={(event) => handleJobChange('applicationDeadline', event.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id="job-openings" label="Vacantes">
                  <Input id="job-openings" type="number" min="1" value={jobForm.openings} onChange={(event) => handleJobChange('openings', event.target.value)} />
                </Field>
                <Field id="job-featured" label="Destacada">
                  <Select value={jobForm.featured} onValueChange={(value) => handleJobChange('featured', value)}>
                    <SelectTrigger id="job-featured"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Si</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field id="job-tags" label="Tags (separados por comas)">
                <Input id="job-tags" value={jobForm.tags} onChange={(event) => handleJobChange('tags', event.target.value)} />
              </Field>
              <Field id="job-responsibilities" label="Responsabilidades (separadas por comas)">
                <Textarea id="job-responsibilities" value={jobForm.responsibilities} onChange={(event) => handleJobChange('responsibilities', event.target.value)} />
              </Field>
              <Field id="job-requirements" label="Requisitos (separados por comas)">
                <Textarea id="job-requirements" value={jobForm.requirements} onChange={(event) => handleJobChange('requirements', event.target.value)} />
              </Field>
              <Field id="job-benefits" label="Beneficios (separados por comas)">
                <Textarea id="job-benefits" value={jobForm.benefits} onChange={(event) => handleJobChange('benefits', event.target.value)} />
              </Field>
              <Field id="job-skills" label="Skills (separadas por comas)">
                <Textarea id="job-skills" value={jobForm.skills} onChange={(event) => handleJobChange('skills', event.target.value)} />
              </Field>
              <Button disabled={isBusy || !jobForm.companyId} type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                {isBusy ? 'Guardando...' : 'Guardar practica'}
              </Button>
            </form>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left p-3">Practica</th>
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
                    <th className="text-left p-3">Practica</th>
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
                              <SelectItem value="IN_REVIEW">En revision</SelectItem>
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
