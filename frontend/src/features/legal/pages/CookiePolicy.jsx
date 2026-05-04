import React from 'react';
import { ArrowLeft, Cookie } from 'lucide-react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { Button } from '@/shared/components/ui/button';
import { openCookieSettings } from '@/features/legal/components/CookieConsent';
import { pageKeys } from '@/app/config/pageKeys';

function LegalSection({ title, children }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
      <h2 className="text-2xl text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4 text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

export function CookiePolicy({ onNavigate }) {
  const goHome = () => {
    onNavigate?.(pageKeys.home);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="cookies" />
      <main className="flex-1">
        <section className="bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <Button type="button" variant="ghost" onClick={goHome} className="mb-6 text-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-6">
              <Cookie className="w-6 h-6 text-purple-700" />
            </div>
            <p className="text-purple-700 mb-3">Información legal</p>
            <h1 className="text-4xl sm:text-5xl text-gray-900 mb-4">Política de Cookies</h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              Esta política explica cómo TalentBridge utiliza cookies y tecnologías similares, qué categorías existen
              y cómo puedes aceptar, rechazar o configurar las cookies opcionales.
            </p>
            <p className="text-sm text-gray-600 mt-4">Última actualización: 4 de mayo de 2026</p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="space-y-6">
            <LegalSection title="1. Qué son las cookies">
              <p>
                Las cookies son pequeños archivos o identificadores que se guardan en tu navegador para recordar
                información durante la navegación. También usamos tecnologías similares, como localStorage o
                sessionStorage, cuando son necesarias para que determinadas funciones de la web funcionen.
              </p>
            </LegalSection>

            <LegalSection title="2. Cookies necesarias">
              <p>
                Son imprescindibles para prestar el servicio. En TalentBridge pueden utilizarse para mantener la sesión,
                proteger la cuenta, recordar si has aceptado o rechazado cookies, y conservar acciones necesarias como
                volver a una práctica después de iniciar sesión.
              </p>
              <p>
                Estas cookies o tecnologías equivalentes no pueden desactivarse desde el panel porque la web las necesita
                para funcionar correctamente.
              </p>
            </LegalSection>

            <LegalSection title="3. Cookies de preferencias">
              <p>
                Permiten recordar ajustes de experiencia, personalización o futuras preferencias visuales. Actualmente
                TalentBridge solo deja preparada esta categoría para que puedas decidir si quieres permitirla cuando se
                incorporen nuevas opciones de personalización.
              </p>
            </LegalSection>

            <LegalSection title="4. Cookies analíticas">
              <p>
                Servirían para entender cómo se usa la web y detectar mejoras, por ejemplo qué pantallas se visitan más
                o dónde se producen errores. No se activarán si las rechazas.
              </p>
              <p>
                En esta versión no hemos conectado herramientas analíticas externas; el consentimiento queda preparado
                para poder activarlas de forma respetuosa en el futuro.
              </p>
            </LegalSection>

            <LegalSection title="5. Cómo aceptar, rechazar o cambiar tu decisión">
              <p>
                Al entrar por primera vez verás un banner que permite aceptar todas las cookies, rechazar las opcionales
                o configurar cada categoría. Aceptar y rechazar se muestran de forma visible para que puedas decidir
                libremente.
              </p>
              <p>
                Puedes cambiar tu decisión en cualquier momento desde este botón:
              </p>
              <Button type="button" onClick={openCookieSettings} className="bg-purple-600 hover:bg-purple-700 text-white">
                Configurar cookies
              </Button>
            </LegalSection>

            <LegalSection title="6. Gestión desde el navegador">
              <p>
                También puedes bloquear o eliminar cookies desde la configuración de tu navegador. Ten en cuenta que si
                eliminas el almacenamiento local, TalentBridge puede volver a pedirte tu decisión sobre cookies.
              </p>
            </LegalSection>
          </div>
        </section>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
