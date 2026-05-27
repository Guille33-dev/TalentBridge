import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { BrandLogo } from '@/shared/components/brand/BrandLogo';

function FooterButton({ children, onClick, variant = 'link' }) {
    return (
      <button type="button" onClick={onClick} className={variant === 'legal' ? 'tb-footer__legal-link' : 'tb-footer__link'}>
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

    return (<footer className="tb-footer">
      <div className="tb-footer__inner">
        <div className="tb-footer__grid">
          {/* Brand */}
          <div className="tb-footer__brand">
            <div className="tb-footer__brand-row">
              <span className="tb-footer__logo">
                <BrandLogo className="w-10 h-10" />
              </span>
              <span className="tb-footer__brand-name">TalentBridge</span>
            </div>
            <p className="tb-footer__tagline">Conecta tu talento con prácticas reales</p>
          </div>

          {/* Company */}
          <div className="tb-footer__section">
            <h3 className="tb-footer__heading">Empresa</h3>
            <ul className="tb-footer__list">
              <li><FooterButton onClick={() => navigate('about', 'sobre-nosotros')}>Sobre Nosotros</FooterButton></li>
              <li><FooterButton onClick={() => navigate('about', 'mision')}>Misión</FooterButton></li>
              <li><FooterButton onClick={() => navigate('about', 'vision')}>Visión</FooterButton></li>
              <li><FooterButton onClick={() => navigate('about', 'valores')}>Valores</FooterButton></li>
              <li><FooterButton onClick={() => navigate('contact')}>Contacto</FooterButton></li>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div className="tb-footer__section">
            <h3 className="tb-footer__heading">Para Estudiantes</h3>
            <ul className="tb-footer__list">
              <li><FooterButton onClick={() => navigate('jobs')}>Buscar Prácticas</FooterButton></li>
              <li><FooterButton onClick={() => navigate('companies')}>Explorar Empresas</FooterButton></li>
              <li><FooterButton onClick={() => navigate('signup')}>Registrarse</FooterButton></li>
              <li><FooterButton onClick={() => navigate('login')}>Iniciar Sesión</FooterButton></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="tb-footer__section tb-footer__contact">
            <h3 className="tb-footer__heading">Contacto</h3>
            <ul className="tb-footer__contact-list">
              <li><FooterButton onClick={() => navigate('contact')}>Formulario de contacto</FooterButton></li>
              <li>
                <a href="mailto:infotalentbridge@gmail.com" className="tb-footer__contact-link">
                  <Mail className="tb-footer__icon" aria-hidden="true" />
                  <span>infotalentbridge@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+34672845319" className="tb-footer__contact-link">
                  <Phone className="tb-footer__icon" aria-hidden="true" />
                  <span>+34 672 845 319</span>
                </a>
              </li>
              <li className="tb-footer__contact-link">
                <MapPin className="tb-footer__icon" aria-hidden="true" />
                <span>Sevilla, Andalucía, ES</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="tb-footer__bottom">
          <p className="tb-footer__copyright">© 2026 TalentBridge. Todos los derechos reservados.</p>
          <div className="tb-footer__legal">
              <FooterButton variant="legal" onClick={() => navigate('privacy')}>Política de Privacidad</FooterButton>
              <FooterButton variant="legal" onClick={() => navigate('terms')}>Términos de Servicio</FooterButton>
              <FooterButton variant="legal" onClick={() => navigate('cookies')}>Cookies</FooterButton>
            </div>
        </div>
      </div>
    </footer>);
}
