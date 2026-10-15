import { Palette, Lightbulb, Landmark, Cpu, BookOpen, Telescope, Sparkles, X, SlidersHorizontal, Clock, Compass, Building2, Heart, Users } from 'lucide-react';
import { Rubric } from '../types';
import { TranslationDictionary } from '../i18n/translations';

interface RubricsAndFiltersProps {
  rubrics: Rubric[];
  activeRubricId: string | null;
  onSelectRubric: (id: string | null) => void;
  availableTags: string[];
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  sortBy?: 'latest' | 'popular' | 'rating' | 'readTime';
  onSortChange?: (sort: 'latest' | 'popular' | 'rating' | 'readTime') => void;
  articlesCountByRubric: Record<string, number>;
  t: TranslationDictionary;
}

export function RubricsAndFilters({
  rubrics,
  activeRubricId,
  onSelectRubric,
  availableTags,
  activeTag,
  onSelectTag,
  sortBy,
  onSortChange,
  articlesCountByRubric,
  t,
}: RubricsAndFiltersProps) {
  const getRubricIcon = (rubric: Rubric) => {
    // Exact mapping by rubric id first to guarantee correspondence
    switch (rubric.id) {
      case 'culture':
        return <Palette className="w-4 h-4 text-[#C85D36]" />;
      case 'philosophy':
        return <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'society':
        return <Landmark className="w-4 h-4 text-[#4A7C59] dark:text-[#6FA37F]" />;
      case 'technology':
        return <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'books':
        return <BookOpen className="w-4 h-4 text-[#8C6D58] dark:text-[#B89B85]" />;
      case 'science':
        return <Telescope className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
      default:
        // fallback based on iconName
        if (rubric.iconName === 'Telescope') return <Telescope className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
        if (rubric.iconName === 'Lightbulb') return <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
        if (rubric.iconName === 'Landmark') return <Landmark className="w-4 h-4 text-[#4A7C59] dark:text-[#6FA37F]" />;
        if (rubric.iconName === 'Building2') return <Building2 className="w-4 h-4 text-[#4A7C59] dark:text-[#6FA37F]" />;
        if (rubric.iconName === 'Cpu') return <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
        if (rubric.iconName === 'BookOpen') return <BookOpen className="w-4 h-4 text-[#8C6D58] dark:text-[#B89B85]" />;
        if (rubric.iconName === 'Palette') return <Palette className="w-4 h-4 text-[#C85D36]" />;
        if (rubric.iconName === 'Compass') return <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <section id="rubrics-and-filters-section" className="mb-10">
      {/* Rubrics Segmented Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F1914] dark:text-[#FAF7F2]">
            {t.rubricsTitle}
          </h2>
          {activeRubricId && (
            <button
              onClick={() => onSelectRubric(null)}
              className="text-xs font-bold text-[#C85D36] hover:text-[#B34E28] dark:text-[#E8A87C] flex items-center gap-1 cursor-pointer"
            >
              <span>{t.resetRubricFilter}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {rubrics.map((r) => {
            const isSelected = activeRubricId === r.id;
            const count = articlesCountByRubric[r.id] || 0;

            return (
              <button
                key={r.id}
                id={`rubric-btn-${r.id}`}
                onClick={() => onSelectRubric(isSelected ? null : r.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#C85D36] text-white border-[#C85D36] shadow-sm font-bold'
                    : 'bg-[#F4EFE6] dark:bg-[#241E1A] text-[#1F1914] dark:text-[#FAF7F2] border-[#E2D3BE] dark:border-[#3D352E] hover:border-[#C85D36]/60 dark:hover:border-[#C85D36]/60 hover:bg-[#E2D3BE]/50 dark:hover:bg-[#2F2722]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-white dark:bg-[#1A1613] shadow-2xs'}`}>
                    {getRubricIcon(r)}
                  </span>
                  <span className="text-xs font-bold truncate leading-tight">
                    {r.title}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ml-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-white/25 text-white font-bold'
                      : 'bg-[#E2D3BE]/60 dark:bg-[#1A1613] text-[#4A4036] dark:text-[#D1C7BD] font-semibold'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tag Filter Status (if activeTag is selected) */}
      {activeTag && (
        <div className="flex items-center gap-2 py-1 text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-[#4A4036] dark:text-[#D1C7BD] font-medium">Фильтр по тегу:</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-[#C85D36] text-white shadow-2xs">
              #{activeTag}
              <button
                onClick={() => onSelectTag(null)}
                className="hover:text-red-200 cursor-pointer ml-1"
                title="Сбросить тег"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
