import React, { useEffect, useState } from 'react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import {
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  Share2,
  Calendar,
  Users,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ImageWithFallback } from '@/shared/components/media/ImageWithFallback';
import { fetchJob } from '@/features/jobs/services/jobsApi';
import { createApplication, fetchMyApplications } from '@/features/applications/services/applicationsApi';
import { deleteSavedJob, fetchMySavedJobs, saveJob } from '@/features/savedJobs/services/savedJobsApi';
import { useAuth } from '@/features/auth/context/AuthContext';

function formatDate(value) {
  if (!value) return 'No especificada';

  return new Date(value).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900 truncate">{value || 'No especificado'}</p>
      </div>
    </div>
  );
}

function ListSection({ title, icon: Icon, items }) {
  if (!items?.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 md:p-8">
      <h2 className="text-lg sm:text-xl mb-4">{title}</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 sm:gap-3">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm sm:text-base text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JobDetail({ jobId, onNavigate, onBack }) {
  const { isAuthenticated } = useAuth();
  const [jobData, setJobData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareStatus, setShareStatus] = useState('idle');

  useEffect(() => {
    let ignore = false;

    async function loadJob() {
      if (!jobId) {
        setError('No se encontró la práctica seleccionada');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setActionError(null);
      setIsSaved(false);
      setHasApplied(false);
      setShareStatus('idle');

      try {
        const [job, applications, savedJobs] = await Promise.all([
          fetchJob(jobId),
          isAuthenticated ? fetchMyApplications() : Promise.resolve([]),
          isAuthenticated ? fetchMySavedJobs() : Promise.resolve([]),
        ]);
        if (!ignore) {
          setJobData(job);
          setHasApplied(applications.some((application) => application.job.id === job.id && application.status !== 'WITHDRAWN'));
          setIsSaved(savedJobs.some((savedJob) => savedJob.job.id === job.id));
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
          setJobData(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      ignore = true;
    };
  }, [jobId, isAuthenticated]);

  const getShareUrl = () => {
    const url = new URL(`/practicas/${jobData.slug || jobData.id}`, window.location.origin);
    return url.toString();
  };

  const handleShare = async () => {
    setActionError(null);

    try {
      const url = getShareUrl();
      const title = jobData.title;
      const text = `${jobData.title} en ${jobData.company?.name || 'TalentBridge'}`;

      if (navigator.share) {
        await navigator.share({ title, text, url });
        setShareStatus('shared');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareStatus('copied');
      } else {
        throw new Error('No se pudo copiar el enlace en este navegador');
      }

      window.setTimeout(() => setShareStatus('idle'), 2500);
    } catch (shareError) {
      if (shareError.name !== 'AbortError') {
        setActionError(shareError.message || 'No se pudo compartir la práctica');
      }
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      window.sessionStorage.setItem('talentbridge.pendingJob', jobData.slug || jobData.id);
      onNavigate('login');
      return;
    }

    setIsApplying(true);
    setActionError(null);

    try {
      await createApplication(jobData.slug || jobData.id);
      setHasApplied(true);
    } catch (requestError) {
      setActionError(requestError.message);
      if (requestError.message.includes('already applied') || requestError.message.includes('Ya te has postulado')) {
        setHasApplied(true);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      window.sessionStorage.setItem('talentbridge.pendingJob', jobData.slug || jobData.id);
      onNavigate('login');
      return;
    }

    setIsSaving(true);
    setActionError(null);

    try {
      if (isSaved) {
        await deleteSavedJob(jobData.slug || jobData.id);
        setIsSaved(false);
      } else {
        await saveJob(jobData.slug || jobData.id);
        setIsSaved(true);
      }
    } catch (requestError) {
      setActionError(requestError.message);
      if (requestError.message.includes('already saved') || requestError.message.includes('ya esta guardada')) {
        setIsSaved(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={onNavigate} currentPage="jobs" />

      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4" />
              Volver a resultados
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {isLoading && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-8" />
              <div className="h-64 bg-gray-100 rounded" />
            </div>
          )}

          {!isLoading && error && (
            <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
              <h1 className="text-xl mb-2">No se pudo cargar la práctica</h1>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!isLoading && jobData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <ImageWithFallback src={jobData.company?.logo} alt={jobData.company?.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl sm:text-3xl mb-2">{jobData.title}</h1>
                      <button
                        onClick={() => onNavigate('company-detail', jobData.company?.slug || jobData.company?.id)}
                        className="text-lg sm:text-xl text-purple-600 hover:text-purple-700 mb-3 sm:mb-4"
                      >
                        {jobData.company?.name}
                      </button>
                      <div className="flex flex-wrap gap-2">
                        {(jobData.tags || []).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs sm:text-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 py-4 sm:py-6 border-y border-gray-200">
                    <InfoItem icon={MapPin} label="Ubicación" value={jobData.location} />
                    <InfoItem icon={Clock} label="Duración" value={jobData.duration} />
                    <InfoItem icon={DollarSign} label="Apoyo económico" value={jobData.salaryLabel} />
                    <InfoItem icon={Users} label="Postulantes" value={jobData.applicantsCount} />
                  </div>

                  <div className="pt-4 sm:pt-6">
                    <h2 className="text-lg sm:text-xl mb-3">Descripción general</h2>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{jobData.overview || jobData.description}</p>
                  </div>
                </div>

                <ListSection title="Responsabilidades" icon={CheckCircle2} items={jobData.responsibilities} />
                <ListSection title="Requisitos" icon={GraduationCap} items={jobData.requirements} />

                {!!jobData.skills?.length && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 md:p-8">
                    <h2 className="text-lg sm:text-xl mb-4">Habilidades deseadas</h2>
                    <div className="flex flex-wrap gap-2">
                      {jobData.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {!!jobData.benefits?.length && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 md:p-8">
                    <h2 className="text-lg sm:text-xl mb-4">Qué ofrecemos</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {jobData.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-start gap-2 sm:gap-3 p-3 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-900">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-xl mb-4">Información adicional</h2>
                  <div className="space-y-4">
                    <InfoItem icon={Calendar} label="Fecha de inicio" value={jobData.startDate} />
                    <InfoItem icon={Clock} label="Horario" value={jobData.schedule} />
                    <InfoItem icon={Briefcase} label="Vacantes disponibles" value={`${jobData.openings} posiciones`} />
                    <InfoItem icon={Calendar} label="Fecha límite de postulación" value={formatDate(jobData.applicationDeadline)} />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-24 space-y-4">
                  {hasApplied ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mx-auto mb-3" />
                      <h3 className="text-base sm:text-lg text-green-900 mb-2">Postulación enviada</h3>
                      <p className="text-xs sm:text-sm text-green-700">Tu postulación ha sido enviada correctamente.</p>
                    </div>
                  ) : (
                    <Button onClick={handleApply} disabled={isApplying} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11 sm:h-12 text-sm sm:text-base">
                      {isApplying ? 'Enviando postulación...' : 'Postularme ahora'}
                    </Button>
                  )}

                  {actionError && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{actionError}</p>}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`flex-1 text-xs sm:text-sm h-10 sm:h-auto ${isSaved ? 'bg-purple-50 text-purple-700 border-purple-600' : ''}`}
                    >
                      <Bookmark className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaving ? 'Guardando...' : isSaved ? 'Guardado' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={handleShare} className="flex-1 text-xs sm:text-sm h-10 sm:h-auto">
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      {shareStatus === 'copied' ? 'Copiado' : shareStatus === 'shared' ? 'Compartido' : 'Compartir'}
                    </Button>
                  </div>

                  <div className="pt-4 sm:pt-6 border-t border-gray-200">
                    <h3 className="text-xs sm:text-sm mb-3 sm:mb-4 text-gray-500">Sobre la empresa</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback src={jobData.company?.logo} alt={jobData.company?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base text-gray-900 truncate">{jobData.company?.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-500">{jobData.company?.industry}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full text-xs sm:text-sm h-10 sm:h-auto"
                      onClick={() => onNavigate('company-detail', jobData.company?.slug || jobData.company?.id)}
                    >
                      <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Ver perfil de empresa
                    </Button>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
