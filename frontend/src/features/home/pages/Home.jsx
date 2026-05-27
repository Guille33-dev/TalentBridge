import React from 'react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { HeroSection } from '@/features/home/components/HeroSection';
import { FeaturedCompanies } from '@/features/home/components/FeaturedCompanies';
import { FeaturedJobs } from '@/features/home/components/FeaturedJobs';
import { AudienceOverview } from '@/features/home/components/AudienceOverview';
import { PlatformFeatures } from '@/features/home/components/PlatformFeatures';
import { PlatformIntro } from '@/features/home/components/PlatformIntro';

export function Home({ onNavigate }) {
    return (<div className="min-h-screen flex flex-col">
      <Header onNavigate={onNavigate} currentPage="home"/>
      <main className="flex-1">
        <HeroSection onNavigate={onNavigate}/>
        <PlatformIntro />
        <AudienceOverview onNavigate={onNavigate} />
        <PlatformFeatures />
        <FeaturedJobs onNavigate={onNavigate}/>
        <FeaturedCompanies onNavigate={onNavigate}/>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>);
}
