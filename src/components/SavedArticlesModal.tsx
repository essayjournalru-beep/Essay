import { X, Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { Article } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import { ThemeLogo } from './BrandAssets';

interface SavedArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onRemoveSaved: (id: string) => void;
  t: TranslationDictionary;
}

export function SavedArticlesModal({
  isOpen,
  onClose,
  savedArticles,
  onSelectArticle,
  onRemoveSaved,
  t,
}: SavedArticlesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FAF7F2] dark:bg-[#241E1A] w-full max-w-lg rounded-3xl border border-[#EBDBC4] dark:border-[#3A322B] shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#EBDBC4] dark:border-[#3A322B] mb-4">
          <div className="flex items-center gap-2.5">
            <ThemeLogo className="w-5 h-5" />
            <Bookmark className="w-4 h-4 text-[#C85D36] fill-[#C85D36]" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B241E] dark:text-[#FAF7F2]">
              {t.savedArticles} ({savedArticles.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#EBDBC4]/50 dark:hover:bg-[#1A1613] cursor-pointer"
          >
            <X className="w-5 h-5 text-[#6B625B] dark:text-[#9E9388]" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-3">
          {savedArticles.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <ThemeLogo className="w-12 h-12 mx-auto mb-3 opacity-80" />
              <p className="text-xs sm:text-sm text-[#8C827A] dark:text-[#A89F95] max-w-xs mx-auto leading-relaxed">
                У вас пока нет сохраненных эссе. Нажмите на иконку закладки на любой карточке эссе, чтобы отложить текст для неторопливого чтения позже.
              </p>
            </div>
          ) : (
            savedArticles.map((art) => (
              <div
                key={art.id}
                className="p-3 rounded-2xl bg-[#F4EFE6] dark:bg-[#1A1613] border border-[#EBDBC4] dark:border-[#3A322B] flex items-center justify-between gap-3 group"
              >
                <div
                  onClick={() => {
                    onSelectArticle(art);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer min-w-0"
                >
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-[#2B241E] dark:text-[#FAF7F2] group-hover:text-[#C85D36] transition-colors line-clamp-1">
                    {art.title}
                  </h4>
                  <div className="text-[11px] text-[#8C827A] flex items-center gap-2 mt-0.5">
                    <span>{art.author.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onRemoveSaved(art.id)}
                    className="p-2 rounded-xl text-[#8C827A] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title={t.unsave}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onSelectArticle(art);
                      onClose();
                    }}
                    className="p-2 rounded-xl text-[#C85D36] hover:bg-[#EBDBC4]/50 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
