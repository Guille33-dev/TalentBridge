import React from 'react';
import { ArticleCard } from '@/shared/components/cards/ArticleCard';
import { ChevronRight } from 'lucide-react';
const articles = [
    {
        id: '1',
        title: 'Cómo prepararte para tu primera entrevista de prácticas',
        excerpt: 'Consejos y estrategias para destacar en tu entrevista y conseguir la práctica que deseas.',
        image: 'https://images.unsplash.com/photo-1758876019673-704b039d405c?w=600&h=400&fit=crop',
        category: 'Entrevistas',
        readTime: '5 min',
        date: '20 Nov 2025'
    },
    {
        id: '2',
        title: 'Guía completa para crear tu primer CV profesional',
        excerpt: 'Todo lo que necesitas saber para crear un CV que capte la atención de los reclutadores.',
        image: 'https://images.unsplash.com/photo-1617035969161-f6d66f95445e?w=600&h=400&fit=crop',
        category: 'CV y Portfolio',
        readTime: '8 min',
        date: '18 Nov 2025'
    },
    {
        id: '3',
        title: 'Aprovecha al máximo tus prácticas profesionales',
        excerpt: 'Estrategias para aprender, crecer y convertir tu práctica en una oferta laboral.',
        image: 'https://images.unsplash.com/photo-1496180470114-6ef490f3ff22?w=600&h=400&fit=crop',
        category: 'Desarrollo Profesional',
        readTime: '6 min',
        date: '15 Nov 2025'
    }
];
export function AdviceSection() {
    return (<section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">Recursos para estudiantes</h2>
            <p className="text-gray-600 text-base sm:text-lg">Consejos y guías para impulsar tu carrera</p>
          </div>
          <button className="text-purple-600 hover:text-purple-700 flex items-center gap-1 group text-sm sm:text-base">
            Ver todos los recursos
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform"/>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {articles.map((article) => (<ArticleCard key={article.id} article={article}/>))}
        </div>
      </div>
    </section>);
}
