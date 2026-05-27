import React, { useEffect, useState } from 'react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHome } from '@/features/dashboard/components/DashboardHome';
import { SavedJobs } from '@/features/dashboard/components/SavedJobs';
import { Applications } from '@/features/dashboard/components/Applications';
import { Profile } from '@/features/dashboard/components/Profile';
import { useAuth } from '@/features/auth/context/AuthContext';

const viewComponents = {
  home: DashboardHome,
  saved: SavedJobs,
  applications: Applications,
  profile: Profile,
};

export function Dashboard({ onNavigate }) {
  const [currentView, setCurrentView] = useState('home');
  const { isAuthenticated, isLoading } = useAuth();

  const CurrentView = viewComponents[currentView] ?? DashboardHome;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onNavigate('login');
    }
  }, [isAuthenticated, isLoading, onNavigate]);

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header onNavigate={onNavigate} currentPage="dashboard" />
        <main className="flex-1 flex items-center justify-center text-gray-600">Cargando sesión...</main>
        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="dashboard" />

      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto">
        <div className="lg:hidden px-4 pt-4 sm:px-6">
          <DashboardSidebar currentView={currentView} onViewChange={handleViewChange} variant="mobile" />
        </div>

        <div className="flex flex-1 w-full">
          <div className="hidden lg:block w-64 shrink-0 bg-white border-r border-gray-200">
            <div className="h-full overflow-y-auto">
              <DashboardSidebar currentView={currentView} onViewChange={handleViewChange} />
            </div>
          </div>

          <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
            <CurrentView onNavigate={onNavigate} onViewChange={handleViewChange} />
          </main>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
