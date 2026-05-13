import React, { useEffect, useState } from 'react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { JobCard } from '@/shared/components/cards/JobCard';
import { fetchCompany } from '@/features/companies/services/companiesApi';
import { MapPin, Users, Globe, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ImageWithFallback } from '@/shared/components/media/ImageWithFallback';

export function CompanyDetail({ companyId, onNavigate }) {
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadCompany() {
      if (!companyId) {
        setError('No se encontro la empresa seleccionada');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const company = await fetchCompany(companyId);
        if (!ignore) {
          setCompanyData(company);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
          setCompanyData(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCompany();

    return () => {
      ignore = true;
    };
  }, [companyId]);

  const jobs = companyData?.jobs || [];
  const companyFilterId = companyData?.slug || companyData?.id;

  const handleViewCompanyJobs = () => {
    if (!companyData || !companyFilterId) return;

    onNavigate('jobs', null, {
      filters: {
        company: companyFilterId,
        companyName: companyData.name,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={onNavigate} currentPage="companies" />

      <main className="flex-1 bg-gray-50">
        {isLoading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="bg-white border border-gray-200 rounded-xl p-8 animate-pulse">
              <div className="h-40 bg-gray-100 rounded mb-6" />
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
              <h1 className="text-xl mb-2">No se pudo cargar la empresa</h1>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && companyData && (
          <>
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-start justify-between gap-4 sm:gap-6 pt-6 sm:pt-8 pb-6">
                  <div className="min-w-0 flex-1 pt-2 sm:pt-3">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="max-w-3xl">
                        <h1 className="text-2xl sm:text-3xl mb-2">{companyData.name}</h1>
                        <p className="text-base sm:text-lg text-gray-600 mb-4">{companyData.tagline}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {companyData.location || 'Ubicacion no especificada'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {companyData.size || 'Tamano no especificado'}
                          </div>
                          {companyData.website && (
                            <div className="flex items-center gap-2 break-all">
                              <Globe className="w-4 h-4" />
                              {companyData.website}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button onClick={handleViewCompanyJobs} className="bg-purple-600 hover:bg-purple-700 text-white">
                          Ver practicas
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback src={companyData.logo} alt={companyData.name} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Tabs defaultValue="about" className="w-full">
                    <TabsList className="mb-6 flex flex-wrap h-auto">
                      <TabsTrigger value="about">Sobre la empresa</TabsTrigger>
                      <TabsTrigger value="culture">Cultura</TabsTrigger>
                      <TabsTrigger value="benefits">Beneficios</TabsTrigger>
                      <TabsTrigger value="jobs">Practicas ({jobs.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="space-y-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                        <h2 className="text-xl sm:text-2xl mb-4">Sobre {companyData.name}</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">{companyData.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Sector</p>
                            <p className="text-gray-900">{companyData.industry || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Fundada</p>
                            <p className="text-gray-900">{companyData.foundedYear || 'No especificado'}</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="culture" className="space-y-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                        <h2 className="text-xl sm:text-2xl mb-4">Nuestra cultura</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">{companyData.culture || 'Informacion no disponible todavia.'}</p>

                        {!!companyData.gallery?.length && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {companyData.gallery.map((image, index) => (
                              <div key={image} className="aspect-video rounded-lg overflow-hidden">
                                <ImageWithFallback src={image} alt={`Oficina ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="benefits" className="space-y-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                        <h2 className="text-xl sm:text-2xl mb-6">Beneficios para practicantes</h2>
                        {companyData.benefits?.length ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {companyData.benefits.map((benefit) => (
                              <div key={benefit} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                                <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <ChevronRight className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-gray-900">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">Beneficios no disponibles todavia.</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="jobs" className="space-y-6">
                      {jobs.length > 0 ? (
                        jobs.map((job) => <JobCard key={job.id} job={job} onViewDetails={(jobId) => onNavigate('job-detail', jobId)} />)
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">Esta empresa no tiene practicas abiertas ahora mismo.</div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                    <h3 className="text-lg mb-4">Practicas disponibles</h3>
                    <div className="space-y-3">
                      {jobs.length > 0 ? (
                        jobs.map((job) => (
                          <button
                            key={job.id}
                            onClick={() => onNavigate('job-detail', job.slug || job.id)}
                            className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <h4 className="mb-1">{job.title}</h4>
                            <p className="text-sm text-gray-600">{job.location}</p>
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600">No hay practicas abiertas.</p>
                      )}
                    </div>
                    <Button onClick={() => onNavigate('jobs')} className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white">
                      Ver todas las practicas
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
