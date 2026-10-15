import { useState } from 'react';
import { Star, Bookmark, Share2 } from 'lucide-react';
import { Article, Rubric } from '../types';
import { getImageCopyrightAttribution } from '../data/seedData';
import { TranslationDictionary } from '../i18n/translations';
import { ThemeLogo } from './BrandAssets';
import { ShareEssayModal } from './ShareEssayModal';

interface ArticleCardProps {
  article: Article;
  rubric?: Rubric;
  onRead: (article: Article) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelectTag?: (tag: string) => void;
  onSelectAuthor?: (authorName: string) => void;
  readingProgressPercent?: number;
  t: TranslationDictionary;
}

export function ArticleCard({
  article,
  rubric,
  onRead,
  isSaved,
  onToggleSave,
  onSelectTag,
  onSelectAuthor,
  readingProgressPercent,
  t,
}: ArticleCardProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const copyrightText = getImageCopyrightAttribution(article.coverImage, article.coverSource);

  const handleOpenShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  return (
    <article
      id={`article-card-${article.id}`}
      className="group rounded-3xl overflow-hidden bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] hover:border-[#C85D36]/60 dark:hover:border-[#C85D36]/60 transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md"
    >
      {/* Top Cover Image Area */}
      <div>
        <div
          onClick={() => onRead(article)}
          title={`© ${copyrightText}`}
          className="relative aspect-[16/10] overflow-hidden bg-[#E2D3BE]/40 dark:bg-[#1A1613] cursor-pointer"
        >
          <img
            src={article.coverImage || 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800'}
            alt={article.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 pointer-events-none" />

          {/* Bottom-right copyright badge on cover */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            {readingProgressPercent && readingProgressPercent > 5 && readingProgressPercent < 95 ? (
              <span className="px-2 py-0.5 rounded-md bg-[#C85D36]/90 backdrop-blur-xs text-[10px] font-bold text-white">
                Прочитано {Math.round(readingProgressPercent)}%
              </span>
            ) : (
              <span />
            )}
            <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs text-[10px] text-white/85 truncate max-w-[70%]">
              © {copyrightText}
            </span>
          </div>

          {/* Top badges: Rubric, Review status, Share and Bookmark */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {rubric && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onRead(article);
                  }}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#FAF7F2]/95 dark:bg-[#1A1613]/95 text-[#1F1914] dark:text-[#FAF7F2] backdrop-blur-xs border border-[#E2D3BE] dark:border-[#3D352E] shadow-2xs cursor-pointer hover:bg-white dark:hover:bg-[#2A231D] transition-colors"
                >
                  {rubric.title}
                </span>
              )}
              {article.isReviewedByEditor && (
                <span
                  title="Материал проверен редакцией «ЭССЕ»"
                  className="px-2 py-0.5 rounded-xl text-[10px] font-bold bg-[#C85D36] text-white backdrop-blur-xs shadow-2xs flex items-center gap-1.5"
                >
                  <ThemeLogo className="w-3.5 h-3.5" />
                  <span>Редакция</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleOpenShare}
                className="relative p-2 rounded-xl backdrop-blur-xs bg-[#FAF7F2]/90 dark:bg-[#1A1613]/90 text-[#1F1914] dark:text-[#FAF7F2] hover:bg-white dark:hover:bg-[#2A231D] transition-colors cursor-pointer"
                title="Поделиться эссе"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              <button
                id={`save-btn-${article.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(article.id);
                }}
                className={`p-2 rounded-xl backdrop-blur-xs transition-colors cursor-pointer shrink-0 ${
                  isSaved
                    ? 'bg-[#C85D36] text-white shadow-xs'
                    : 'bg-[#FAF7F2]/90 dark:bg-[#1A1613]/90 text-[#1F1914] dark:text-[#FAF7F2] hover:bg-white dark:hover:bg-[#2A231D]'
                }`}
                title={isSaved ? t.unsave : t.save}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 sm:p-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3" onClick={(e) => e.stopPropagation()}>
            {article.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag?.(tag);
                }}
                className="text-[10px] font-semibold text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#C85D36] dark:hover:text-[#E8A87C] transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Title in Editorial Serif */}
          <h3
            onClick={(e) => {
              e.stopPropagation();
              onRead(article);
            }}
            className="font-serif text-base sm:text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2] leading-snug hover:text-[#C85D36] dark:hover:text-[#E8A87C] cursor-pointer transition-colors line-clamp-2 mb-2"
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          <p
            onClick={(e) => {
              e.stopPropagation();
              onRead(article);
            }}
            className="text-xs sm:text-sm text-[#4A4036] dark:text-[#D1C7BD] line-clamp-3 leading-relaxed mb-4 cursor-pointer hover:text-[#1F1914] dark:hover:text-[#FAF7F2] transition-colors"
          >
            {article.subtitle}
          </p>
        </div>
      </div>

      {/* Footer: Author & Reading Time */}
      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[#E2D3BE]/60 dark:border-[#3D352E] flex items-center justify-between">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectAuthor) {
              onSelectAuthor(article.author.name);
            } else {
              onRead(article);
            }
          }}
          title={`Показать все эссе автора: ${article.author.name}`}
          className="flex items-center gap-2.5 text-left group/author cursor-pointer"
        >
          <img
            src={article.author.avatar || undefined}
            alt={article.author.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(article.author.name || 'Author')}`;
            }}
            className="w-7 h-7 rounded-full object-cover border border-[#DFCEB4] group-hover/author:border-[#C85D36] transition-colors"
          />
          <div>
            <div className="text-xs font-semibold text-[#1F1914] dark:text-[#FAF7F2] group-hover/author:text-[#C85D36] dark:group-hover/author:text-[#E8A87C] transition-colors truncate max-w-[130px]">
              {article.author.name}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-3 text-xs text-[#4A4036] dark:text-[#D1C7BD]">
          <div className="flex items-center gap-1 font-bold text-[#1F1914] dark:text-[#FAF7F2]">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{article.rating.average.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <ShareEssayModal
        article={article}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </article>
  );
}
