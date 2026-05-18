import React from 'react';
import { MapPin, Briefcase, DollarSign, Bookmark } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../media/ImageWithFallback';
export function JobCard({ job, onViewDetails, isSaved = false, onToggleSave, isSaveDisabled = false }) {
    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(job.slug || job.id);
        }
    };
    const handleToggleSave = (event) => {
        event.stopPropagation();
        onToggleSave?.(job);
    };
    return (<div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group relative">
      <div className="flex gap-4 mb-4">
        {/* Company Logo */}
        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <ImageWithFallback src={job.companyLogo} alt={job.company} className="w-full h-full object-cover"/>
        </div>

        {/* Title and Company */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg mb-1 group-hover:text-purple-600 transition-colors line-clamp-1">
            {job.title}
          </h3>
          <p className="text-gray-600">{job.company}</p>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleToggleSave}
          disabled={isSaveDisabled || !onToggleSave}
          aria-pressed={isSaved}
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isSaved
            ? 'bg-purple-50 text-purple-600'
            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`}/>
        </button>
      </div>

      {/* Meta Information */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4"/>
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4"/>
          <span>{job.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4"/>
          <span>{job.salary}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(job.tags || []).map((tag) => (<Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">{job.postedDate}</span>
        <Button size="sm" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50" onClick={handleViewDetails}>
          Ver Detalles
        </Button>
      </div>
    </div>);
}
