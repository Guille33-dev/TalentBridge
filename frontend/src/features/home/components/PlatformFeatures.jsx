import React from 'react';
import {
  Bookmark,
  BriefcaseBusiness,
  ClipboardList,
  Filter,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

const features = [
  {
    title: 'Perfil de estudiante',
    description: 'Información académica, habilidades, ubicación, disponibilidad y contacto para presentar una candidatura completa.',
    icon: UserRound,
  },
  {
    title: 'Prácticas guardadas',
    description: 'Un espacio personal para conservar oportunidades interesantes antes de postularse.',
    icon: Bookmark,
  },
  {
    title: 'Seguimiento de postulaciones',
    description: 'Estados, siguiente paso y detalle de cada candidatura desde el panel del estudiante.',
    icon: ClipboardList,
  },
  {
    title: 'Panel de empresa',
    description: 'Gestión de perfil, vacantes y candidaturas recibidas desde una zona propia.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Búsqueda con filtros',
    description: 'Filtros por categoría, modalidad, ubicación, texto y empresa para encontrar mejor cada práctica.',
    icon: Filter,
  },
  {
    title: 'Control administrativo',
    description: 'Revisión de empresas, prácticas y estados para mantener control sobre lo publicado.',
    icon: ShieldCheck,
  },
];

export function PlatformFeatures() {
  return (
    <section className="tb-features">
      <div className="tb-features__inner">
        <div className="tb-features__header">
          <div>
            <h2>Qué incluye la plataforma</h2>
            <p>
              Las herramientas principales están repartidas por rol para que estudiantes, empresas y administración puedan trabajar de forma clara.
            </p>
          </div>
        </div>

        <div className="tb-features__grid">
          {features.map(({ title, description, icon: Icon }) => (
            <article
              className="tb-features__card"
              key={title}
            >
              <div className="tb-features__card-top">
                <div className="tb-features__icon">
                  <Icon />
                </div>
              </div>

              <div className="tb-features__card-copy">
                <h3>{title}</h3>
                <span>{description}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
