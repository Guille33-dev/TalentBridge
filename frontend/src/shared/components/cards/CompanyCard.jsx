import React from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../media/ImageWithFallback';
export function CompanyCard({ company, onNavigate }) {
    return (<div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group cursor-pointer">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg mb-4 overflow-hidden flex-shrink-0">
          <ImageWithFallback src={company.logo} alt={company.name} className="w-full h-full object-cover"/>
        </div>

        {/* Content */}
        <h3 className="text-xl mb-2 group-hover:text-teal-600 transition-colors">
          {company.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 flex-1">
          {company.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(company.tags || []).map((tag) => (<Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>))}
        </div>

        {/* Footer */}
        <button onClick={() => onNavigate('company-detail', company.slug || company.id)} className="flex items-center justify-between text-sm text-purple-600 hover:text-purple-700 group/btn">
          <span className="flex items-center gap-2">
            <Briefcase className="w-4 h-4"/>
            {company.openPositions} prácticas disponibles
          </span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"/>
        </button>
      </div>
    </div>);
}
