import React from 'react';
import { Home, Bookmark, FileText, User } from 'lucide-react';
const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'saved', label: 'Prácticas Guardadas', icon: Bookmark },
    { id: 'applications', label: 'Mis Postulaciones', icon: FileText },
    { id: 'profile', label: 'Mi Perfil', icon: User },
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

    </aside>);
}
