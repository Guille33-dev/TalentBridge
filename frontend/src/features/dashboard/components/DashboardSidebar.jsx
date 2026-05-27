import React from 'react';
import { Home, Bookmark, FileText, User } from 'lucide-react';

export const dashboardMenuItems = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'saved', label: 'Prácticas Guardadas', icon: Bookmark },
  { id: 'applications', label: 'Mis Postulaciones', icon: FileText },
  { id: 'profile', label: 'Mi Perfil', icon: User },
];

export function DashboardSidebar({ currentView, onViewChange, variant = 'sidebar' }) {
  if (variant === 'mobile') {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        <h2 className="mb-3 px-1 text-xs text-gray-500">Mi Cuenta</h2>
        <nav className="grid grid-cols-2 gap-2">
          {dashboardMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`flex min-h-12 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="leading-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </section>
    );
  }

  return (
    <aside className="w-full h-full p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xs sm:text-sm text-gray-500 mb-2">Mi Cuenta</h2>
      </div>

      <nav className="space-y-1">
        {dashboardMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
