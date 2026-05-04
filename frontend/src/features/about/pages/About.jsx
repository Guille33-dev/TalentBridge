import React from 'react';
import { ArrowRight, HeartHandshake, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { Button } from '@/shared/components/ui/button';

const values = [
  {
    icon: ShieldCheck,
    title: 'Confianza',
    description: 'Cuidamos que las oportunidades sean claras, reales y útiles para quienes empiezan su camino profesional.',
  },
  {
    icon: HeartHandshake,
    title: 'Cercanía',
    description: 'Queremos que estudiantes, centros educativos y empresas encuentren una comunicación sencilla y humana.',
  },
  {
    icon: Sparkles,
    title: 'Progreso',
    description: 'Impulsamos experiencias que ayuden a aprender, ganar seguridad y abrir nuevas puertas laborales.',
  },
];

export function About({ onNavigate }) {
  const navigateToJobs = () => {
    onNavigate?.('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onNavigate={onNavigate} currentPage="about" />
      <main className="flex-1">
        <section className="bg-gray-50 text-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16 lg:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex flex-col items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Search className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl text-gray-900">TalentBridge</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
                Acercamos el talento joven a las oportunidades que lo hacen crecer.
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                TalentBridge nace para facilitar el encuentro entre estudiantes que buscan sus primeras prácticas
                profesionales y empresas que quieren incorporar personas con motivación, curiosidad y ganas de aprender.
              </p>
            </div>
          </div>
        </section>

        <section id="sobre-nosotros" className="py-14 sm:py-16 bg-white" style={{ scrollMarginTop: '96px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-4xl">
              <p className="text-3xl sm:text-4xl text-purple-700 mb-3">Sobre nosotros</p>
              <h2 className="text-base sm:text-lg text-gray-900 mb-6">Una plataforma pensada para empezar mejor.</h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Sabemos que encontrar una primera experiencia profesional puede ser confuso: ofertas dispersas,
                  procesos poco claros y dudas sobre qué encaja con cada perfil. Por eso TalentBridge organiza las
                  prácticas en un entorno sencillo, accesible y centrado en el estudiante.
                </p>
                <p>
                  Nuestro objetivo es que cada persona pueda descubrir empresas, guardar oportunidades, postularse
                  con confianza y hacer seguimiento de sus procesos desde un mismo lugar. Para las empresas,
                  TalentBridge ayuda a dar visibilidad a sus prácticas y a conectar con perfiles en formación que
                  pueden aportar energía, nuevas ideas y compromiso.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div id="mision" className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8" style={{ scrollMarginTop: '96px' }}>
                <div className="bg-purple-50 rounded-lg flex items-center justify-center py-4 mb-6">
                  <span className="text-2xl sm:text-3xl text-purple-700">Misión</span>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Hacer que el acceso a prácticas profesionales sea más claro, justo y eficiente, conectando a
                  estudiantes con empresas que valoran el aprendizaje y el potencial.
                </p>
              </div>

              <div id="vision" className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8" style={{ scrollMarginTop: '96px' }}>
                <div className="bg-purple-50 rounded-lg flex items-center justify-center py-4 mb-6">
                  <span className="text-2xl sm:text-3xl text-purple-700">Visión</span>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Convertirnos en un puente de referencia entre educación y empleo, donde cada estudiante pueda
                  encontrar oportunidades reales para aprender, crecer y construir su futuro profesional.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="valores" className="pb-8 bg-gray-50" style={{ scrollMarginTop: '96px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
              <div className="mb-8 text-center">
                <div className="bg-purple-50 rounded-lg flex items-center justify-center py-4 mb-6">
                  <span className="text-2xl sm:text-3xl text-purple-700">Valores</span>
                </div>
                <h2 className="text-lg sm:text-xl text-gray-900">Lo que guía cada decisión.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {values.map((value) => {
                  const Icon = value.icon;

                  return (
                    <article key={value.title} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-purple-700" />
                      </div>
                      <h3 className="text-xl text-gray-900 mb-3">{value.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{value.description}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16 bg-white text-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl mb-4">Encuentra una práctica que encaje contigo.</h2>
                <p className="text-gray-700 leading-relaxed">
                  Explora oportunidades, conoce empresas y empieza a construir experiencia desde una plataforma
                  creada para estudiantes.
                </p>
              </div>
              <Button
                type="button"
                onClick={navigateToJobs}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
              >
                Buscar prácticas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
