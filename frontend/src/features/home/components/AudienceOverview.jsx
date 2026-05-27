import React from 'react';
import { ArrowRight, Building2, CheckCircle2, GraduationCap } from 'lucide-react';

const panels = [
  {
    title: 'Para estudiantes',
    subtitle: 'Encuentra prácticas, guarda oportunidades y sigue tus candidaturas desde un panel personal.',
    action: 'Crear cuenta',
    target: 'signup',
    icon: GraduationCap,
    items: [
      'Completar un perfil con estudios, habilidades y disponibilidad.',
      'Buscar prácticas con filtros por área, modalidad y ubicación.',
      'Guardar oportunidades y consultar postulaciones en un solo sitio.',
    ],
  },
  {
    title: 'Para empresas',
    subtitle: 'Publica vacantes, mantiene tu perfil actualizado y revisa candidatos de forma ordenada.',
    action: 'Registrar empresa',
    target: 'signup',
    icon: Building2,
    items: [
      'Crear un perfil público de empresa revisado por administración.',
      'Publicar prácticas y enviarlas a revisión antes de mostrarlas.',
      'Ver candidaturas recibidas, perfiles de candidatos y estados del proceso.',
    ],
  },
];

export function AudienceOverview({ onNavigate }) {
  return (
    <section className="tb-audience">
      <div className="tb-audience__inner">
        <div className="tb-audience__header">
          <h2>Dos paneles, un mismo proceso</h2>
          <p>
            TalentBridge separa las herramientas de estudiantes y empresas para que cada usuario vea solo lo que necesita hacer.
          </p>
        </div>

        <div className="tb-audience__grid">
          {panels.map(({ title, subtitle, action, target, icon: Icon, items }) => (
            <article className="tb-audience__card" key={title}>
              <div className="tb-audience__card-top">
                <div className="tb-audience__icon">
                  <Icon />
                </div>
                <h3>{title}</h3>
              </div>

              <div className="tb-audience__copy">
                <p>{subtitle}</p>
              </div>

              <ul className="tb-audience__list">
                {items.map((item) => (
                  <li key={item}>
                    <CheckCircle2 />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                className="tb-audience__button"
                type="button"
                onClick={() => onNavigate(target)}
              >
                {action}
                <ArrowRight />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
