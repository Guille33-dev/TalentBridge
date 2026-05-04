import React, { useState } from 'react';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';

const filterSections = [
    {
        key: 'modality',
        title: 'Modalidad',
        options: [
            { label: 'Remoto', value: 'REMOTE' },
            { label: 'Híbrido', value: 'HYBRID' },
            { label: 'Presencial', value: 'ONSITE' },
        ],
    },
    {
        key: 'area',
        title: 'Área de Estudio',
        options: [
            { label: 'Ingeniería', value: 'Ingenieria' },
            { label: 'Diseño', value: 'Diseno' },
            { label: 'Marketing', value: 'Marketing' },
            { label: 'Desarrollo', value: 'Desarrollo' },
            { label: 'Cloud', value: 'Cloud' },
            { label: 'Producto', value: 'Producto' },
        ],
    },
];

export function SearchFilters({ filters, onFilterChange, onClear }) {
    const [expandedSections, setExpandedSections] = useState({
        'Modalidad': true,
        'Área de Estudio': true
    });

    const toggleSection = (title) => {
        setExpandedSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const handleSelect = (key, value) => {
        onFilterChange(key, filters[key] === value ? '' : value);
    };

    return (<div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg mb-6">Filtros</h2>

      <div className="space-y-6">
        {/* Filter Sections */}
        {filterSections.map((section) => (<div key={section.title} className="border-t border-gray-200 pt-6">
            <button onClick={() => toggleSection(section.title)} className="w-full flex items-center justify-between mb-4 hover:text-teal-600 transition-colors">
              <h3>{section.title}</h3>
              {expandedSections[section.title] ? (<ChevronUp className="w-4 h-4"/>) : (<ChevronDown className="w-4 h-4"/>)}
            </button>

            {expandedSections[section.title] && (<div className="space-y-3">
                {section.options.map((option) => (<div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${section.title}-${option.value}`}
                      checked={filters[section.key] === option.value}
                      onCheckedChange={() => handleSelect(section.key, option.value)}
                    />
                    <Label htmlFor={`${section.title}-${option.value}`} className="text-sm cursor-pointer">
                      {option.label}
                    </Label>
                  </div>))}
              </div>)}
          </div>))}

        {/* Clear Filters */}
        <button onClick={onClear} className="w-full py-2 text-sm text-purple-600 hover:text-purple-700 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
          Limpiar filtros
        </button>
      </div>
    </div>);
}
