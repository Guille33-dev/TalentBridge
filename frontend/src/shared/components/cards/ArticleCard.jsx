import React from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../media/ImageWithFallback';
export function ArticleCard({ article }) {
    return (<div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
        <ImageWithFallback src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="secondary" className="text-xs">
            {article.category}
          </Badge>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3"/>
            {article.readTime}
          </span>
        </div>

        <h3 className="text-xl mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
          {article.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {article.excerpt}
        </p>

        <div className="text-xs text-gray-500">
          {article.date}
        </div>
      </div>
    </div>);
}
