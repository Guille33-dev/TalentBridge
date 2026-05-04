import React from 'react';
import { Mail, MapPin, Phone, Search } from 'lucide-react';

function FooterButton({ children, onClick }) {
    return (
      <button type="button" onClick={onClick} className="text-left hover:text-white transition-colors">
        {children}
      </button>
    );
}

export function Footer({ onNavigate }) {
    const scrollToSection = (sectionId, attempt = 0) => {
        const section = document.getElementById(sectionId);

        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        if (attempt < 10) {
            window.setTimeout(() => scrollToSection(sectionId, attempt + 1), 50);
        }
    };

    const navigate = (page, sectionId) => {
        onNavigate?.(page);

        if (sectionId) {
            window.setTimeout(() => scrollToSection(sectionId), 0);
            return;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (<footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl text-white">TalentBridge</span>
            </div>
            <div className="space-y-3">
              <h3 className="text-white text-xl leading-tight">Conecta tu talento con prácticas reales</h3>
              <p className="text-gray-400 leading-relaxed">
                Ayudamos a estudiantes a descubrir oportunidades profesionales y dar el siguiente paso con empresas que buscan talento joven.
              </p>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li><FooterButton onClick={() => navigate('about', 'sobre-nosotros')}>Sobre Nosotros</FooterButton></li>
              <li><FooterButton onClick={() => navigate('about', 'mision')}>Misión</FooterButton></li>
              <li><FooterButton onClick={() => navigate('about', 'vision')}>Visión</FooterButton></li>
              <li><FooterButton onClick={() => navigate('about', 'valores')}>Valores</FooterButton></li>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-white mb-4">Para Estudiantes</h3>
            <ul className="space-y-3">
              <li><FooterButton onClick={() => navigate('jobs')}>Buscar Prácticas</FooterButton></li>
              <li><FooterButton onClick={() => navigate('companies')}>Explorar Empresas</FooterButton></li>
              <li><FooterButton onClick={() => navigate('signup')}>Registrarme</FooterButton></li>
              <li><FooterButton onClick={() => navigate('login')}>Iniciar Sesión</FooterButton></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4 uppercase">Contacto</h3>
            <ul className="space-y-4">
              <li>
                <a href="mailto:infotalentbridge@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span>infotalentbridge@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+34672845319" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span>+34 672 845 319</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span>Sevilla, Andalucía, ES</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2026 TalentBridge. Todos los derechos reservados.</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <FooterButton onClick={() => navigate('privacy')}>Política de Privacidad</FooterButton>
              <FooterButton onClick={() => navigate('terms')}>Términos de Servicio</FooterButton>
              <FooterButton onClick={() => navigate('cookies')}>Cookies</FooterButton>
            </div>
          </div>
        </div>
      </div>
    </footer>);
}
