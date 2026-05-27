import React from 'react';
import { Search, Send, UserRound } from 'lucide-react';

const steps = [
  {
    title: 'Crea tu perfil',
    description: 'Añade tus estudios, habilidades, disponibilidad y datos de contacto para presentar una candidatura más completa.',
    icon: UserRound,
  },
  {
    title: 'Encuentra prácticas',
    description: 'Busca por área, modalidad, ciudad o empresa. También puedes guardar las oportunidades que quieras revisar más tarde.',
    icon: Search,
  },
  {
    title: 'Postúlate y sigue el proceso',
    description: 'Envía tu candidatura y consulta el estado, la práctica asociada y el siguiente paso desde tu panel.',
    icon: Send,
  },
];

export function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl text-gray-950 mb-3">Cómo funciona TalentBridge</h2>
          <p className="text-gray-600">
            Un flujo sencillo para pasar de buscar prácticas a gestionar tus candidaturas desde una sola plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <article key={title} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm text-purple-700">Paso {index + 1}</span>
              </div>
              <h3 className="text-lg text-gray-950 mb-2">{title}</h3>
              <p className="text-sm leading-6 text-gray-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
