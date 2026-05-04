import React, { useEffect, useState } from 'react';
import { JobCard } from '@/shared/components/cards/JobCard';
import { CompanyCard } from '@/shared/components/cards/CompanyCard';
import { Briefcase, Bookmark, FileText, TrendingUp, Clock } from 'lucide-react';
import { Progress } from '@/shared/components/ui/progress';
import { useAuth } from '@/features/auth/context/AuthContext';
import { fetchMyApplications } from '@/features/applications/services/applicationsApi';
import { fetchMySavedJobs } from '@/features/savedJobs/services/savedJobsApi';
import { fetchJobs } from '@/features/jobs/services/jobsApi';
import { fetchCompanies } from '@/features/companies/services/companiesApi';
import { fetchMyProfile } from '@/features/profile/services/profileApi';

const statusLabels = {
  SUBMITTED: 'Postulación enviada',
  IN_REVIEW: 'En revisión',
  INTERVIEW: 'Entrevista programada',
  ACCEPTED: 'Aceptada',
  REJECTED: 'No seleccionado',
  WITHDRAWN: 'Retirada',
};

function getStatusClass(status) {
  if (['INTERVIEW', 'ACCEPTED'].includes(status)) return 'bg-green-100 text-green-700';
  if (status === 'IN_REVIEW') return 'bg-yellow-100 text-yellow-700';
  if (['REJECTED', 'WITHDRAWN'].includes(status)) return 'bg-red-100 text-red-700';
  return 'bg-blue-100 text-blue-700';
}

export function DashboardHome({ onNavigate, onViewChange }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendedJobsData, setRecommendedJobsData] = useState([]);
  const [suggestedCompaniesData, setSuggestedCompaniesData] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setError(null);

      try {
        const [applicationsResult, savedJobsResult, jobsResult, companiesResult, profileResult] = await Promise.all([
          fetchMyApplications(),
          fetchMySavedJobs(),
          fetchJobs({ limit: 2 }),
          fetchCompanies({ limit: 2 }),
          fetchMyProfile(),
        ]);

        if (!ignore) {
          setApplications(applicationsResult);
          setSavedJobs(savedJobsResult);
          setRecommendedJobsData(jobsResult.jobs);
          setSuggestedCompaniesData(companiesResult.companies);
          setProfileCompletion(profileResult.profile?.profileCompletion || 0);
        }
      } catch (requestError) {
        if (!ignore) setError(requestError.message);
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const inProcessCount = applications.filter((app) => ['IN_REVIEW', 'INTERVIEW'].includes(app.status)).length;
  const completion = profileCompletion || user?.profile?.profileCompletion || 0;
  const statCards = [
    { id: 'applications', label: 'Postulaciones', value: String(applications.length), icon: FileText, iconClass: 'text-blue-600', bgClass: 'bg-blue-50' },
    { id: 'saved', label: 'Guardadas', value: String(savedJobs.length), icon: Bookmark, iconClass: 'text-purple-600', bgClass: 'bg-purple-50' },
    { id: 'process', label: 'En Proceso', value: String(inProcessCount), icon: Clock, iconClass: 'text-amber-600', bgClass: 'bg-amber-50' },
    { id: 'views', label: 'Perfil', value: `${completion}%`, icon: TrendingUp, iconClass: 'text-green-600', bgClass: 'bg-green-50' },
  ];
  const recentApplicationsData = applications.slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl mb-2">¡Hola, {user?.firstName || 'estudiante'}!</h1>
        <p className="text-gray-600 text-sm sm:text-base">Aquí está el estado de tu búsqueda de prácticas</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map(({ id, label, value, icon: Icon, iconClass, bgClass }) => (
          <div key={id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconClass}`} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl">{value}</p>
                <p className="text-xs sm:text-sm text-gray-600">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-4 gap-3">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl mb-2">Completa tu perfil</h3>
            <p className="text-purple-100 text-xs sm:text-sm">Agrega más detalles para destacar ante las empresas</p>
          </div>
          <span className="text-xl sm:text-2xl">{completion}%</span>
        </div>
        <Progress value={completion} className="h-2 bg-white/20" />
        <div className="mt-4 flex gap-2">
          <button onClick={() => onViewChange?.('profile')} className="px-3 sm:px-4 py-2 bg-white text-purple-600 rounded-lg text-xs sm:text-sm hover:bg-purple-50 transition-colors">
            Completar Perfil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl mb-4 sm:mb-6">Postulaciones Recientes</h2>
          <div className="space-y-3 sm:space-y-4">
            {recentApplicationsData.length === 0 && <p className="text-sm text-gray-600">Todavía no tienes postulaciones.</p>}
            {recentApplicationsData.map((app) => (
              <div key={app.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base mb-1 truncate">{app.job.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{app.job.company.name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(app.status)}`}>{statusLabels[app.status] || app.status}</span>
                    <span className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl mb-4 sm:mb-6">Empresas que te pueden gustar</h2>
          <div className="space-y-3 sm:space-y-4">
            {suggestedCompaniesData.map((company) => (
              <CompanyCard key={company.id} company={company} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl">Recomendadas para ti</h2>
          <button onClick={() => onNavigate('jobs')} className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm">
            Ver todas
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {recommendedJobsData.map((job) => (
            <JobCard key={job.id} job={job} onViewDetails={(jobId) => onNavigate('job-detail', jobId)} />
          ))}
        </div>
      </div>
    </div>
  );
}
