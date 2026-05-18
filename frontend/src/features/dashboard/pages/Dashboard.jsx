import React, { useEffect, useState } from 'react';
import { Header } from '@/shared/components/layout/Header';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHome } from '@/features/dashboard/components/DashboardHome';
import { SavedJobs } from '@/features/dashboard/components/SavedJobs';
import { Applications } from '@/features/dashboard/components/Applications';
import { Profile } from '@/features/dashboard/components/Profile';
import { Menu } from '@/shared/components/icons/Menu';
import { useAuth } from '@/features/auth/context/AuthContext';

const viewComponents = {
  home: DashboardHome,
  saved: SavedJobs,
  applications: Applications,
  profile: Profile,
};

export function Dashboard({ onNavigate }) {
  const [currentView, setCurrentView] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  const CurrentView = viewComponents[currentView] ?? DashboardHome;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onNavigate('login');
    }
  }, [isAuthenticated, isLoading, onNavigate]);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleViewChange = (view) => {
    setCurrentView(view);
    closeSidebar();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header onNavigate={onNavigate} currentPage="dashboard" />
        <main className="flex-1 flex items-center justify-center text-gray-600">Cargando sesión...</main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="dashboard" />

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-30 cursor-pointer" onClick={closeSidebar} />}

        <div
          className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform lg:transform-none transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 bg-white border-r border-gray-200
        `}
        >
          <div className="h-full overflow-y-auto">
            <DashboardSidebar currentView={currentView} onViewChange={handleViewChange} />
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
          <CurrentView onNavigate={onNavigate} onViewChange={handleViewChange} />
        </main>
      </div>
    </div>
  );
}
