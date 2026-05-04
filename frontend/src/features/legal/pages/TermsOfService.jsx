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

export function TermsOfService({ onNavigate }) {
  const goBack = () => {
    onNavigate?.(pageKeys.signup);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="terms" />
      <main className="flex-1">
        <section className="bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <Button type="button" variant="ghost" onClick={goBack} className="mb-6 text-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <p className="text-purple-700 mb-3">Información legal</p>
            <h1 className="text-4xl sm:text-5xl text-gray-900 mb-4">Términos de Servicio</h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              Estos términos regulan el acceso y uso de TalentBridge. Al crear una cuenta o utilizar la plataforma,
              aceptas estas condiciones.
            </p>
            <p className="text-sm text-gray-600 mt-4">Última actualización: 4 de mayo de 2026</p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="space-y-6">
            <LegalSection title="1. Qué es TalentBridge">
              <p>
                TalentBridge es una plataforma digital que ayuda a estudiantes a encontrar prácticas profesionales,
                guardar oportunidades, postularse a ofertas y hacer seguimiento de sus procesos.
              </p>
              <p>
                La plataforma también permite que el equipo administrador gestione empresas, ofertas y postulaciones
                para mantener la información actualizada.
              </p>
            </LegalSection>

            <LegalSection title="2. Registro y cuenta de usuario">
              <p>
                Para utilizar determinadas funciones necesitas crear una cuenta. Debes proporcionar información veraz,
                mantener tus credenciales seguras y avisarnos si detectas un uso no autorizado.
              </p>
              <p>
                Cada usuario es responsable de la actividad realizada desde su cuenta y de mantener actualizada la
                información que decida incluir en su perfil.
              </p>
            </LegalSection>

            <LegalSection title="3. Uso permitido de la plataforma">
              <p>
                Debes usar TalentBridge de forma responsable, respetuosa y conforme a la ley. No está permitido usar la
                plataforma para publicar información falsa, suplantar identidades, manipular procesos de selección,
                dañar el servicio o acceder a zonas no autorizadas.
              </p>
              <p>
                Podemos limitar, suspender o cancelar el acceso a una cuenta si detectamos un uso abusivo, fraudulento
                o contrario a estos términos.
              </p>
            </LegalSection>

            <LegalSection title="4. Ofertas, empresas y postulaciones">
              <p>
                TalentBridge facilita el contacto entre estudiantes y oportunidades de prácticas, pero no garantiza que
                una postulación sea aceptada ni que una empresa mantenga una oferta abierta indefinidamente.
              </p>
              <p>
                Intentamos que la información publicada sea clara y actualizada. Aun así, algunas condiciones de las
                prácticas pueden cambiar por decisión de la empresa o por necesidades del proceso.
              </p>
            </LegalSection>

            <LegalSection title="5. Contenido del usuario">
              <p>
                Puedes completar tu perfil con información académica, profesional y personal relacionada con tu búsqueda
                de prácticas. Conservas la titularidad de esa información, pero nos autorizas a tratarla para prestar el
                servicio y mostrarla cuando postules a una oferta.
              </p>
              <p>
                No debes incluir contenido ofensivo, discriminatorio, ilegal, engañoso o que vulnere derechos de otras
                personas.
              </p>
            </LegalSection>

            <LegalSection title="6. Disponibilidad del servicio">
              <p>
                Trabajamos para mantener TalentBridge disponible y funcional, pero pueden producirse interrupciones por
                mantenimiento, incidencias técnicas, actualizaciones o causas fuera de nuestro control.
              </p>
              <p>
                Cuando sea razonable, intentaremos resolver las incidencias lo antes posible y minimizar su impacto.
              </p>
            </LegalSection>

            <LegalSection title="7. Propiedad intelectual">
              <p>
                El diseño, estructura, marca, textos y componentes propios de TalentBridge pertenecen a sus titulares o
                se utilizan con autorización. No puedes copiar, explotar o reutilizar elementos de la plataforma sin
                permiso, salvo en los casos permitidos por la ley.
              </p>
            </LegalSection>

            <LegalSection title="8. Responsabilidad">
              <p>
                TalentBridge actúa como intermediario tecnológico. No somos responsables de las decisiones finales de
                contratación, selección o continuidad de una práctica adoptadas por las empresas.
              </p>
              <p>
                Tampoco respondemos por daños derivados de un uso incorrecto de la plataforma, de información falsa
                introducida por usuarios o de circunstancias ajenas a nuestro control razonable.
              </p>
            </LegalSection>

            <LegalSection title="9. Cambios en los términos">
              <p>
                Podemos actualizar estos términos para adaptarlos a cambios legales, técnicos o funcionales. Si los
                cambios son relevantes, intentaremos comunicarlos de forma clara dentro de la plataforma.
              </p>
            </LegalSection>

            <LegalSection title="10. Contacto">
              <p>
                Para cualquier duda sobre estos términos puedes escribirnos a
                <a href="mailto:infotalentbridge@gmail.com" className="text-purple-700 hover:text-purple-600"> infotalentbridge@gmail.com</a>.
              </p>
            </LegalSection>
          </div>
        </section>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
