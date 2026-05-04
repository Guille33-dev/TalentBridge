import React from 'react';
import { Home, Bookmark, FileText, User, Settings, TrendingUp } from 'lucide-react';
const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'saved', label: 'Prácticas Guardadas', icon: Bookmark },
    { id: 'applications', label: 'Mis Postulaciones', icon: FileText },
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'settings', label: 'Configuración', icon: Settings }
];
export function DashboardSidebar({ currentView, onViewChange }) {
    return (<aside className="w-full h-full p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xs sm:text-sm text-gray-500 mb-2">Mi Cuenta</h2>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (<button key={item.id} onClick={() => onViewChange(item.id)} className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'}`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"/>
              <span className="truncate">{item.label}</span>
            </button>);
        })}
      </nav>

      {/* Quick Stats */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0"/>
          <span className="text-xs sm:text-sm text-gray-700">Vistas de Perfil</span>
        </div>
        <p className="text-xl sm:text-2xl text-purple-700">42</p>
        <p className="text-xs text-gray-600 mt-1">+8% esta semana</p>
      </div>
    </aside>);
}
