import React from 'react';
import {
  Building2,
  ClipboardCheck,
  GraduationCap,
  Search,
  Send,
  UserRound,
} from 'lucide-react';

const benefits = [
  {
    title: 'Perfiles completos',
    description: 'El estudiante presenta estudios, habilidades, disponibilidad y datos utiles para destacar mejor.',
    icon: GraduationCap,
  },
  {
    title: 'Vacantes claras',
    description: 'Las empresas publican practicas ordenadas por area, modalidad, ubicacion y requisitos.',
    icon: Building2,
  },
  {
    title: 'Proceso controlado',
    description: 'Cada candidatura mantiene su estado y siguiente paso visible desde el panel correspondiente.',
    icon: ClipboardCheck,
  },
];

const steps = [
  {
    title: 'Perfil',
    description: 'El estudiante prepara su informacion.',
    icon: UserRound,
  },
  {
    title: 'Busqueda',
    description: 'Encuentra practicas por filtros reales.',
    icon: Search,
  },
  {
    title: 'Postulacion',
    description: 'La empresa recibe el perfil del candidato.',
    icon: Send,
  },
  {
    title: 'Seguimiento',
    description: 'Ambas partes ven como avanza el proceso.',
    icon: ClipboardCheck,
  },
];

export function PlatformIntro() {
  return (
    <section className="tb-platform">
      <div className="tb-platform__inner">
        <div className="tb-platform__showcase">
          <div className="tb-platform__content">
            <h2 className="tb-platform__title">
              Todo el proceso de prácticas en un solo lugar
            </h2>

            <p className="tb-platform__lead">
              TalentBridge conecta estudiantes y empresas con una experiencia más clara: buscar prácticas, publicar vacantes, enviar candidaturas y seguir cada avance sin perder información por el camino.
            </p>

            <div className="tb-platform__audiences">
              <article className="tb-platform__audience-card">
                <span>Estudiantes</span>
                <strong>Encuentran oportunidades reales y preparan mejor su candidatura.</strong>
              </article>
              <article className="tb-platform__audience-card tb-platform__audience-card--blue">
                <span>Empresas</span>
                <strong>Publican prácticas y revisan candidatos desde su propio panel.</strong>
              </article>
            </div>
          </div>

          <div className="tb-platform__visual">
            <div className="tb-platform__visual-top">
              <div>
                <h3>Así fluye una candidatura</h3>
              </div>
              <span className="tb-platform__visual-pill">4 pasos</span>
            </div>

            <div className="tb-platform__steps">
              {steps.map(({ title, description, icon: Icon }, index) => (
                <div className="tb-platform__step" key={title}>
                  <div className="tb-platform__step-icon">
                    <Icon />
                  </div>
                  <div className="tb-platform__step-copy">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="tb-platform__benefits">
          {benefits.map(({ title, description, icon: Icon }) => (
            <article className="tb-platform__benefit-card" key={title}>
              <div className="tb-platform__benefit-icon">
                <Icon />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
