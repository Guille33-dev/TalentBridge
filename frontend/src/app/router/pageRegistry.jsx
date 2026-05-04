import React from 'react';
import { Home } from '@/features/home/pages/Home';
import { JobSearch } from '@/features/jobs/pages/JobSearch';
import { CompanyList } from '@/features/companies/pages/CompanyList';
import { CompanyDetail } from '@/features/companies/pages/CompanyDetail';
import { Dashboard } from '@/features/dashboard/pages/Dashboard';
import { AdminPanel } from '@/features/admin/pages/AdminPanel';
import { JobDetail } from '@/features/jobs/pages/JobDetail';
import { Login } from '@/features/auth/pages/Login';
import { Signup } from '@/features/auth/pages/Signup';
import { pageKeys } from '@/app/config/pageKeys';

export function getPageRegistry({ navigateTo, selectedCompanyId, selectedJobId, jobSearchFilters, previousPage, setCurrentPage, clearSharedJobUrl }) {
  return {
    [pageKeys.home]: <Home onNavigate={navigateTo} />,
    [pageKeys.jobs]: <JobSearch onNavigate={navigateTo} initialFilters={jobSearchFilters} />,
    [pageKeys.companies]: <CompanyList onNavigate={navigateTo} />,
    [pageKeys.companyDetail]: <CompanyDetail companyId={selectedCompanyId} onNavigate={navigateTo} />,
    [pageKeys.dashboard]: <Dashboard onNavigate={navigateTo} />,
    [pageKeys.admin]: <AdminPanel onNavigate={navigateTo} />,
    [pageKeys.jobDetail]: (
      <JobDetail
        jobId={selectedJobId}
        onNavigate={navigateTo}
        onBack={() => {
          clearSharedJobUrl();
          setCurrentPage(previousPage);
        }}
      />
    ),
    [pageKeys.login]: <Login onNavigate={navigateTo} onSwitchToSignup={() => navigateTo(pageKeys.signup)} />,
    [pageKeys.signup]: <Signup onNavigate={navigateTo} onSwitchToLogin={() => navigateTo(pageKeys.login)} />,
  };
}
