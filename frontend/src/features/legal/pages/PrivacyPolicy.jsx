import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { Button } from '@/shared/components/ui/button';
import { pageKeys } from '@/app/config/pageKeys';

function LegalSection({ title, children }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
      <h2 className="text-2xl text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4 text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

export function PrivacyPolicy({ onNavigate }) {
  const goBack = () => {
    onNavigate?.(pageKeys.signup);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="privacy" />
      <main className="flex-1">
        <section className="bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <Button type="button" variant="ghost" onClick={goBack} className="mb-6 text-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <p className="text-purple-700 mb-3">Información legal</p>
            <h1 className="text-4xl sm:text-5xl text-gray-900 mb-4">Política de Privacidad</h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              En TalentBridge cuidamos la información personal que nos confías. Esta política explica qué datos
              tratamos, para qué los usamos y cómo puedes ejercer tus derechos.
            </p>
            <p className="text-sm text-gray-600 mt-4">Última actualización: 4 de mayo de 2026</p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="space-y-6">
            <LegalSection title="1. Responsable del tratamiento">
              <p>
                El responsable del tratamiento de los datos es TalentBridge, plataforma orientada a conectar
                estudiantes con oportunidades de prácticas profesionales.
              </p>
              <p>
                Puedes contactar con nosotros en <a href="mailto:infotalentbridge@gmail.com" className="text-purple-700 hover:text-purple-600">infotalentbridge@gmail.com</a>.
              </p>
            </LegalSection>

            <LegalSection title="2. Datos que podemos tratar">
              <p>
                Podemos tratar datos identificativos y de contacto, como nombre, apellidos y correo electrónico.
                También podemos tratar la información que decidas añadir a tu perfil, como centro educativo o
                universidad, estudios, año, ubicación, biografía, habilidades, disponibilidad y preferencias.
              </p>
              <p>
                Además, tratamos información relacionada con tu uso de la plataforma, como prácticas guardadas,
                postulaciones realizadas, estado de los procesos y comunicaciones necesarias para prestar el servicio.
              </p>
            </LegalSection>

            <LegalSection title="3. Finalidades del tratamiento">
              <p>
                Usamos tus datos para crear y gestionar tu cuenta, mostrarte prácticas, permitir postulaciones,
                guardar oportunidades, mantener tu dashboard actualizado y facilitar la gestión de procesos entre
                estudiantes y empresas.
              </p>
              <p>
                También podemos usar datos técnicos y de actividad para mantener la seguridad, prevenir usos indebidos,
                resolver incidencias y mejorar el funcionamiento de TalentBridge.
              </p>
            </LegalSection>

            <LegalSection title="4. Base jurídica">
              <p>
                Tratamos los datos necesarios para prestar el servicio cuando creas una cuenta y usas la plataforma.
                Algunos tratamientos se basan en tu consentimiento, por ejemplo cuando completas voluntariamente
                información adicional de perfil o aceptas comunicaciones no esenciales.
              </p>
              <p>
                También podemos tratar datos para cumplir obligaciones legales o por interés legítimo en mantener la
                seguridad, prevenir fraudes y mejorar la calidad del servicio.
              </p>
            </LegalSection>

            <LegalSection title="5. Comunicación de datos">
              <p>
                Cuando postulas a una práctica, la información necesaria de tu perfil y tu postulación puede ser
                consultada por el equipo administrador de la plataforma y por la empresa vinculada a esa oferta.
              </p>
              <p>
                No vendemos tus datos personales. Solo compartimos información cuando sea necesario para prestar el
                servicio, cumplir una obligación legal o contar con proveedores técnicos que actúen siguiendo nuestras
                instrucciones.
              </p>
            </LegalSection>

            <LegalSection title="6. Conservación de los datos">
              <p>
                Conservaremos tus datos mientras tengas una cuenta activa o mientras sean necesarios para prestar el
                servicio. Si solicitas la eliminación de tu cuenta, bloquearemos o eliminaremos la información conforme
                a los plazos legales y técnicos aplicables.
              </p>
            </LegalSection>

            <LegalSection title="7. Derechos de las personas usuarias">
              <p>
                Puedes solicitar el acceso, rectificación, supresión, oposición, limitación del tratamiento y
                portabilidad de tus datos cuando proceda. Para ejercer estos derechos, escríbenos a
                <a href="mailto:infotalentbridge@gmail.com" className="text-purple-700 hover:text-purple-600"> infotalentbridge@gmail.com</a>.
              </p>
              <p>
                Si consideras que el tratamiento de tus datos no es adecuado, también puedes presentar una reclamación
                ante la Agencia Española de Protección de Datos.
              </p>
            </LegalSection>

            <LegalSection title="8. Seguridad">
              <p>
                Aplicamos medidas técnicas y organizativas razonables para proteger la información frente a accesos no
                autorizados, pérdida, alteración o uso indebido. Aun así, ningún sistema es absolutamente infalible, por
                lo que te recomendamos usar una contraseña segura y mantenerla en secreto.
              </p>
            </LegalSection>

            <LegalSection title="9. Cambios en esta política">
              <p>
                Podemos actualizar esta política para reflejar cambios legales, técnicos o funcionales. Cuando los
                cambios sean relevantes, intentaremos comunicarlos de forma clara dentro de la plataforma.
              </p>
            </LegalSection>
          </div>
        </section>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
