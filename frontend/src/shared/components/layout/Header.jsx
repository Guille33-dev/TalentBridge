import React from 'react';
import { Building2, LogOut, Menu, ShieldCheck, User, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { BrandLogo } from '@/shared/components/brand/BrandLogo';

export function Header({ onNavigate, currentPage = 'home' }) {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const menuPanelRef = React.useRef(null);
    const closeButtonRef = React.useRef(null);
    const { isAuthenticated, logout, user } = useAuth();
    const closeMobileMenu = () => setMobileMenuOpen(false);
    const handleNavigate = (page) => {
        onNavigate(page);
        closeMobileMenu();
    };
    const handleLogout = () => {
        logout();
        handleNavigate('home');
    };

    React.useEffect(() => {
      if (!mobileMenuOpen) return undefined;

      const previousOverflow = document.body.style.overflow;
      const previousActiveElement = document.activeElement;
      const focusableSelector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',');

      const handleDialogKeyDown = (event) => {
        if (event.key === 'Escape') {
          closeMobileMenu();
          return;
        }

        if (event.key !== 'Tab') return;

        const focusableElements = Array.from(menuPanelRef.current?.querySelectorAll(focusableSelector) || []);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      };

      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleDialogKeyDown);
      window.requestAnimationFrame(() => closeButtonRef.current?.focus());

      return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener('keydown', handleDialogKeyDown);
        if (previousActiveElement instanceof HTMLElement) {
          previousActiveElement.focus();
        }
      };
    }, [mobileMenuOpen]);

    return (
      <>
        <header className="tb-header">
          <div className="tb-header__inner">
            <div className="tb-header__bar">
              {/* Logo */}
              <div className="tb-header__left">
                <button type="button" onClick={() => handleNavigate('home')} className="tb-header__brand" aria-label="Ir al inicio de TalentBridge">
                  <BrandLogo className="tb-header__logo" />
                  <span className="tb-header__brand-name">TalentBridge</span>
                </button>

                {/* Desktop Navigation */}
                <nav className="tb-header__nav" aria-label="Navegacion principal">
                  <button type="button" onClick={() => handleNavigate('jobs')} aria-current={currentPage === 'jobs' ? 'page' : undefined} className={`tb-header__nav-link ${currentPage === 'jobs'
            ? 'tb-header__nav-link--active'
            : ''}`}>
                    Prácticas
                  </button>
                  <button type="button" onClick={() => handleNavigate('companies')} aria-current={currentPage === 'companies' ? 'page' : undefined} className={`tb-header__nav-link ${currentPage === 'companies'
            ? 'tb-header__nav-link--active'
            : ''}`}>
                    Empresas
                  </button>
                  <button type="button" onClick={() => handleNavigate('contact')} aria-current={currentPage === 'contact' ? 'page' : undefined} className={`tb-header__nav-link ${currentPage === 'contact'
            ? 'tb-header__nav-link--active'
            : ''}`}>
                    Contacto
                  </button>
                </nav>
              </div>

              {/* Right side - Desktop */}
              <div className="tb-header__actions">
                {isAuthenticated ? (
                  <>
                    {user?.role === 'ADMIN' && (
                      <Button variant="outline" size="sm" onClick={() => handleNavigate('admin')} className="text-gray-700">
                        <ShieldCheck className="w-4 h-4 mr-2"/>
                        Admin
                      </Button>
                    )}
                    <Button size="sm" onClick={() => handleNavigate(user?.role === 'COMPANY' ? 'company-dashboard' : 'dashboard')} className="bg-purple-600 hover:bg-purple-700 text-white">
                      {user?.role === 'COMPANY' ? <Building2 className="w-4 h-4 mr-2"/> : <User className="w-4 h-4 mr-2"/>}
                      {user?.role === 'COMPANY' ? 'Panel empresa' : user?.firstName || 'Dashboard'}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-700" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2"/>
                      Salir
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="text-gray-700" onClick={() => handleNavigate('login')}>
                      Iniciar Sesión
                    </Button>
                    <Button size="sm" onClick={() => handleNavigate('signup')} className="bg-purple-600 hover:bg-purple-700 text-white">
                      <User className="w-4 h-4 mr-2"/>
                      Registrarse
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                className="tb-header__menu-button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={mobileMenuOpen}
                aria-controls="talentbridge-mobile-menu"
              >
                {mobileMenuOpen ? (<X className="w-6 h-6"/>) : (<Menu className="w-6 h-6"/>)}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="tb-mobile-menu" onClick={closeMobileMenu}>
            <aside
              id="talentbridge-mobile-menu"
              ref={menuPanelRef}
              className="tb-mobile-menu__panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menú principal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="tb-mobile-menu__header">
                <div className="tb-mobile-menu__brand">
                  <BrandLogo className="tb-mobile-menu__logo" />
                  <span>TalentBridge</span>
                </div>
                <button type="button" ref={closeButtonRef} className="tb-mobile-menu__close" onClick={closeMobileMenu} aria-label="Cerrar menú">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="tb-mobile-menu__nav" aria-label="Navegacion principal movil">
                <button type="button" onClick={() => handleNavigate('jobs')} aria-current={currentPage === 'jobs' ? 'page' : undefined} className={`tb-mobile-menu__link ${currentPage === 'jobs'
                ? 'tb-mobile-menu__link--active'
                : ''}`}>
                  Prácticas
                </button>
                <button type="button" onClick={() => handleNavigate('companies')} aria-current={currentPage === 'companies' ? 'page' : undefined} className={`tb-mobile-menu__link ${currentPage === 'companies'
                ? 'tb-mobile-menu__link--active'
                : ''}`}>
                  Empresas
                </button>
                <button type="button" onClick={() => handleNavigate('contact')} aria-current={currentPage === 'contact' ? 'page' : undefined} className={`tb-mobile-menu__link ${currentPage === 'contact'
                ? 'tb-mobile-menu__link--active'
                : ''}`}>
                  Contacto
                </button>
              </nav>

              <div className="tb-mobile-menu__actions">
                {isAuthenticated ? (
                  <>
                    {user?.role === 'ADMIN' && (
                      <Button variant="outline" className="w-full justify-center" onClick={() => handleNavigate('admin')}>
                        <ShieldCheck className="w-4 h-4 mr-2"/>
                        Admin
                      </Button>
                    )}
                    <Button onClick={() => handleNavigate(user?.role === 'COMPANY' ? 'company-dashboard' : 'dashboard')} className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-center">
                      {user?.role === 'COMPANY' ? <Building2 className="w-4 h-4 mr-2"/> : <User className="w-4 h-4 mr-2"/>}
                      {user?.role === 'COMPANY' ? 'Panel empresa' : 'Dashboard'}
                    </Button>
                    <Button variant="outline" className="w-full justify-center" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2"/>
                      Salir
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full justify-center" onClick={() => handleNavigate('login')}>
                      Iniciar Sesión
                    </Button>
                    <Button onClick={() => handleNavigate('signup')} className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-center">
                      <User className="w-4 h-4 mr-2"/>
                      Registrarse
                    </Button>
                  </>
                )}
              </div>
            </aside>
          </div>
        )}
      </>
    );
}
