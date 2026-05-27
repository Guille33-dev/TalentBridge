import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CompanyCard } from '@/shared/components/cards/CompanyCard';
import { fetchCompanies } from '@/features/companies/services/companiesApi';

export function FeaturedCompanies({ onNavigate }) {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const carouselRef = useRef(null);

  const updateCarouselControls = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    setCanScrollPrev(carousel.scrollLeft > 8);
    setCanScrollNext(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 8);
  };

  const scrollCarousel = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const item = carousel.querySelector('.tb-company-carousel__item');
    const itemWidth = item?.getBoundingClientRect().width || carousel.clientWidth;
    const gap = 24;

    carousel.scrollBy({
      left: direction * (itemWidth + gap),
      behavior: 'smooth',
    });

    window.setTimeout(updateCarouselControls, 350);
  };

  const handleCarouselKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollCarousel(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollCarousel(1);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadCompanies() {
      try {
        const result = await fetchCompanies({ limit: 10 });
        if (!ignore) {
          setCompanies((result.companies || []).slice(0, 10));
        }
      } catch {
        if (!ignore) {
          setCompanies([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCompanies();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    window.requestAnimationFrame(updateCarouselControls);
    window.addEventListener('resize', updateCarouselControls);

    return () => {
      window.removeEventListener('resize', updateCarouselControls);
    };
  }, [companies]);

  return (
    <section className="tb-home-section tb-home-section--white" aria-labelledby="featured-companies-title" aria-busy={isLoading}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
          <div>
            <h2 id="featured-companies-title" className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">Empresas destacadas</h2>
            <p className="text-gray-600 text-base sm:text-lg">Empresas que ofrecen prácticas en TalentBridge</p>
          </div>
          <div className="tb-featured-companies__actions">
            <button onClick={() => onNavigate('companies')} className="text-purple-600 hover:text-purple-700 flex items-center gap-1 group text-sm sm:text-base">
              Ver todas las empresas
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="tb-company-carousel__controls" role="group" aria-label="Controles del carrusel de empresas">
              <button
                type="button"
                onClick={() => scrollCarousel(-1)}
                disabled={!canScrollPrev}
                aria-label="Ver empresas anteriores"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel(1)}
                disabled={!canScrollNext}
                aria-label="Ver empresas siguientes"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="tb-company-carousel__viewport" aria-hidden="true">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="tb-company-carousel__item bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4" />
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : companies.length > 0 ? (
          <div className="tb-company-carousel">
            <div
              ref={carouselRef}
              className="tb-company-carousel__viewport"
              role="region"
              aria-label="Carrusel de empresas destacadas. Usa las flechas izquierda y derecha para moverte."
              tabIndex={0}
              onScroll={updateCarouselControls}
              onKeyDown={handleCarouselKeyDown}
            >
              {companies.map((company, index) => (
                <div key={company.id} className="tb-company-carousel__item" role="group" aria-label={`Empresa ${index + 1} de ${companies.length}`}>
                  <CompanyCard company={company} onNavigate={onNavigate} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">No hay empresas disponibles todavía.</div>
        )}
      </div>
    </section>
  );
}
