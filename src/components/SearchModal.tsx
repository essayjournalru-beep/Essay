import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Star, ArrowRight } from 'lucide-react';
import { Article, Rubric } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import { BrandWordmark } from './BrandAssets';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  rubrics: Rubric[];
  onSelectArticle: (article: Article) => void;
  t: TranslationDictionary;
}

export function SearchModal({
  isOpen,
  onClose,
  articles,
  rubrics,
  onSelectArticle,
  t,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQ = query.trim().toLowerCase();
  const results = cleanQ
    ? articles.filter((a) => {
        const inTitle = a.title.toLowerCase().includes(cleanQ);
        const inSubtitle = a.subtitle.toLowerCase().includes(cleanQ);
        const inAuthor = a.author.name.toLowerCase().includes(cleanQ);
        const inTags = a.tags.some((tg) => tg.toLowerCase().includes(cleanQ));
        const inContent = a.sections.some((s) => s.text?.toLowerCase().includes(cleanQ));
        return inTitle || inSubtitle || inAuthor || inTags || inContent;
      })
    : [];

  const getRubricTitle = (rubricId: string) => {
    return rubrics.find((r) => r.id === rubricId)?.title || '';
  };

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#FAF7F2] dark:bg-[#241E1A] border border-[#EBDBC4] dark:border-[#3A322B] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-6 py-4 border-b border-[#E2D3BE] dark:border-[#3D352E]">
          <Search className="w-5 h-5 text-[#C85D36] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-[#1F1914] dark:text-[#FAF7F2] placeholder:text-[#4A4036] dark:placeholder:text-[#D1C7BD] focus:outline-none font-medium"
          />
          <div className="flex items-center gap-1 shrink-0">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-lg hover:bg-[#E2D3BE]/50 dark:hover:bg-[#3D352E] text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#1F1914] dark:hover:text-[#FAF7F2] transition-colors cursor-pointer"
                title="Очистить поле ввода"
                aria-label="Очистить поиск"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#E2D3BE]/60 dark:hover:bg-[#3D352E] text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#C85D36] dark:hover:text-[#FAF7F2] transition-colors cursor-pointer"
              title="Закрыть поиск"
              aria-label="Закрыть поиск"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-3">
          {cleanQ === '' ? (
            <div className="text-center py-10">
              <BrandWordmark className="h-8 mx-auto mb-3 text-[#1F1914] dark:text-[#FAF7F2]" />
              <p className="text-xs text-[#4A4036] dark:text-[#D1C7BD] font-medium">
                Ищите эссе по темам, авторам (Анна Раевская, Михаил Соколовский), ключевым идеям или рубрикам
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1">
                Ничего не найдено
              </p>
              <p className="text-xs text-[#4A4036] dark:text-[#D1C7BD] font-medium">
                Попробуйте изменить поисковый запрос или просмотреть рубрики
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#4A4036] dark:text-[#D1C7BD] uppercase tracking-wider mb-2">
                Найдено эссе: {results.length}
              </div>
              {results.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    onSelectArticle(art);
                    onClose();
                  }}
                  className="p-3 sm:p-4 rounded-2xl bg-[#F4EFE6] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] hover:border-[#C85D36]/60 transition-colors cursor-pointer group flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-[#C85D36]">
                        {getRubricTitle(art.rubricId)}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F1914] dark:text-[#FAF7F2] group-hover:text-[#C85D36] transition-colors line-clamp-1">
                      {art.title}
                    </h4>
                    <p className="text-xs text-[#4A4036] dark:text-[#D1C7BD] line-clamp-1 mt-0.5">
                      {art.subtitle}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#C85D36] group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
