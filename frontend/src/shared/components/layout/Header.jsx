import React from 'react';
import { LogOut, Search, Menu, ShieldCheck, User, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';

export function Header({ onNavigate, currentPage = 'home' }) {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
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
    return (<header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4 sm:gap-8">
            <button onClick={() => handleNavigate('home')} className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white"/>
              </div>
              <span className="text-lg sm:text-xl text-gray-900">TalentBridge</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button onClick={() => handleNavigate('jobs')} className={`px-4 py-2 rounded-lg transition-colors ${currentPage === 'jobs'
            ? 'bg-purple-50 text-purple-700'
            : 'text-gray-700 hover:bg-gray-50'}`}>
                Prácticas
              </button>
              <button onClick={() => handleNavigate('companies')} className={`px-4 py-2 rounded-lg transition-colors ${currentPage === 'companies'
            ? 'bg-purple-50 text-purple-700'
            : 'text-gray-700 hover:bg-gray-50'}`}>
                Empresas
              </button>
            </nav>
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Button variant="outline" onClick={() => handleNavigate('admin')} className="text-gray-700">
                    <ShieldCheck className="w-4 h-4 mr-2"/>
                    Admin
                  </Button>
                )}
                <Button onClick={() => handleNavigate('dashboard')} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <User className="w-4 h-4 mr-2"/>
                  {user?.firstName || 'Dashboard'}
                </Button>
                <Button variant="ghost" className="text-gray-700" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2"/>
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-gray-700" onClick={() => handleNavigate('login')}>
                  Iniciar Sesión
                </Button>
                <Button onClick={() => handleNavigate('signup')} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <User className="w-4 h-4 mr-2"/>
                  Registrarme
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (<X className="w-6 h-6"/>) : (<Menu className="w-6 h-6"/>)}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (<div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <button onClick={() => handleNavigate('jobs')} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentPage === 'jobs'
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'}`}>
              Prácticas
            </button>
            <button onClick={() => handleNavigate('companies')} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentPage === 'companies'
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'}`}>
              Empresas
            </button>
            <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
              {isAuthenticated ? (
                <>
                  {user?.role === 'ADMIN' && (
                    <Button variant="outline" className="w-full justify-center" onClick={() => handleNavigate('admin')}>
                      <ShieldCheck className="w-4 h-4 mr-2"/>
                      Admin
                    </Button>
                  )}
                  <Button onClick={() => handleNavigate('dashboard')} className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-center">
                    <User className="w-4 h-4 mr-2"/>
                    Dashboard
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
                    Registrarme
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>)}
    </header>);
}
