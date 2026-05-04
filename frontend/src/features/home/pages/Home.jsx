import React from 'react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { HeroSection } from '@/features/home/components/HeroSection';
import { FeaturedCompanies } from '@/features/home/components/FeaturedCompanies';
import { FeaturedJobs } from '@/features/home/components/FeaturedJobs';
export function Home({ onNavigate }) {
    return (<div className="min-h-screen flex flex-col">
      <Header onNavigate={onNavigate} currentPage="home"/>
      <main className="flex-1">
        <HeroSection onNavigate={onNavigate}/>
        <FeaturedCompanies onNavigate={onNavigate}/>
        <FeaturedJobs onNavigate={onNavigate}/>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>);
}
