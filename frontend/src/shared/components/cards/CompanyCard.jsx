import React from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../media/ImageWithFallback';

export function CompanyCard({ company, onNavigate }) {
  const companyDetailId = company.slug || company.id;

  const handleNavigateToCompany = () => {
    onNavigate('company-detail', companyDetailId);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group">
      <div className="flex flex-col h-full">
        <div className="w-16 h-16 bg-gray-100 rounded-lg mb-4 overflow-hidden flex-shrink-0">
          <ImageWithFallback src={company.logo} alt={company.name} className="w-full h-full object-cover" />
        </div>

        <button
          type="button"
          onClick={handleNavigateToCompany}
          className="w-fit text-left text-xl mb-2 transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
        >
          {company.name}
        </button>

        <p className="text-gray-600 text-sm mb-4 flex-1">{company.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {(company.tags || []).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <button
          type="button"
          onClick={handleNavigateToCompany}
          className="flex items-center justify-between text-sm text-purple-600 hover:text-purple-700 group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-md"
        >
          <span className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            {company.openPositions} practicas disponibles
          </span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
