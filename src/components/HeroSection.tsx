import { ArrowRight, Star, Eye, Flame } from 'lucide-react';
import { Article } from '../types';
import { getImageCopyrightAttribution, getArticleDailyViews } from '../data/seedData';
import { TranslationDictionary } from '../i18n/translations';
import { ThemeLogo } from './BrandAssets';

interface HeroSectionProps {
  featuredArticle?: Article;
  onReadArticle: (article: Article) => void;
  onSelectAuthor?: (authorName: string) => void;
  totalArticlesCount: number;
  t: TranslationDictionary;
}

export function HeroSection({
  featuredArticle,
  onReadArticle,
  onSelectAuthor,
  t,
}: HeroSectionProps) {
  if (!featuredArticle) return null;

  const dailyViews = getArticleDailyViews(featuredArticle);
  const copyrightText = getImageCopyrightAttribution(featuredArticle.coverImage, featuredArticle.coverSource);

  return (
    <section id="hero-spotlight-section" className="relative pt-4 pb-8 sm:pb-12">
      {/* Warm ambient radial glow in terracotta & sand */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-[#EBDBC4]/40 via-[#F5EFE6]/20 to-transparent dark:from-[#2A231D]/40 dark:via-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Card Container */}
        <div className="relative rounded-3xl overflow-hidden border border-[#E2D3BE] dark:border-[#3D352E] bg-[#F4EFE6] dark:bg-[#241E1A] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            {/* Left Col: High-Res Editorial Artwork */}
            <div
              onClick={() => onReadArticle(featuredArticle)}
              className="lg:col-span-6 relative min-h-[300px] sm:min-h-[380px] lg:min-h-full overflow-hidden bg-[#E2D3BE]/30 dark:bg-[#1A1613] border-b lg:border-b-0 lg:border-r border-[#E2D3BE] dark:border-[#3D352E] cursor-pointer group"
            >
              <img
                src={featuredArticle.coverImage || 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1200'}
                alt={featuredArticle.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1200';
                }}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

              {/* Bottom Caption & Copyright Attribution Pill */}
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs backdrop-blur-md bg-black/55 p-3 rounded-2xl border border-white/15 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1 font-medium">
                    {featuredArticle.coverCaption || 'Обложка номера: Рабочее место эссеиста'}
                  </span>
                  <span className="text-[11px] font-bold text-[#E2D3BE] shrink-0">ЭССЕ</span>
                </div>
                <div className="text-[10px] text-white/75 line-clamp-1">
                  © {copyrightText}
                </div>
              </div>
            </div>

            {/* Right Col: Editorial Context & Headline */}
            <div className="lg:col-span-6 p-6 sm:p-10 xl:p-12 flex flex-col justify-between">
              <div>
                {/* Quiet Typographic Kicker */}
                <div className="flex flex-wrap items-center gap-2 mb-3 text-xs font-bold tracking-wider uppercase text-[#C85D36] dark:text-[#E8A87C]">
                  <ThemeLogo className="w-4 h-4" />
                  <span>{t.mainResearch}</span>
                  <span className="text-[#8C827A] dark:text-[#A89F95]">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4A4036] dark:text-[#D1C7BD] normal-case tracking-normal">
                    <Flame className="w-3.5 h-3.5 text-[#C85D36]" />
                    <span>Лидер чтения за 24 часа</span>
                  </span>
                </div>

                {/* Main Headline (Editorial Serif) */}
                <h1
                  onClick={() => onReadArticle(featuredArticle)}
                  className="font-serif text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight text-[#1F1914] dark:text-[#FAF7F2] leading-snug mb-4 hover:text-[#C85D36] dark:hover:text-[#E8A87C] cursor-pointer transition-colors"
                >
                  {featuredArticle.title}
                </h1>

                {/* Subtitle / Excerpt */}
                <p
                  onClick={() => onReadArticle(featuredArticle)}
                  className="text-sm sm:text-base text-[#4A4036] dark:text-[#D1C7BD] leading-relaxed mb-6 cursor-pointer font-normal line-clamp-4"
                >
                  {featuredArticle.subtitle}
                </p>

                {/* Author attribution */}
                <div
                  onClick={() => onSelectAuthor?.(featuredArticle.author.name)}
                  title={`Все эссе автора: ${featuredArticle.author.name}`}
                  className="flex items-center gap-3 mb-6 pb-6 border-b border-[#E2D3BE] dark:border-[#3D352E] cursor-pointer group/heroauthor"
                >
                  <img
                    src={featuredArticle.author.avatar || undefined}
                    alt={featuredArticle.author.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(featuredArticle.author.name || 'Author')}`;
                    }}
                    className="w-10 h-10 rounded-full object-cover border border-[#DFCEB4] group-hover/heroauthor:border-[#C85D36] transition-colors"
                  />
                  <div>
                    <div className="text-sm font-bold text-[#1F1914] dark:text-[#FAF7F2] group-hover/heroauthor:text-[#C85D36] dark:group-hover/heroauthor:text-[#E8A87C] transition-colors">
                      {featuredArticle.author.name}
                    </div>
                    <div className="text-xs text-[#4A4036] dark:text-[#D1C7BD] font-medium">
                      {featuredArticle.author.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Quick Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <button
                  id="hero-read-btn"
                  onClick={() => onReadArticle(featuredArticle)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#C85D36] hover:bg-[#B34E28] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <span>{t.readMore}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center gap-4 text-xs text-[#4A4036] dark:text-[#D1C7BD]">
                  <div
                    className="flex items-center gap-1.5"
                    title={`Просмотров за сутки: ${dailyViews > 0 ? dailyViews : featuredArticle.viewsCount} (всего: ${featuredArticle.viewsCount})`}
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C85D36]" />
                    <span className="font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                      {dailyViews > 0 ? `${dailyViews} за сутки` : featuredArticle.viewsCount.toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                      {featuredArticle.rating.average.toFixed(1)}
                    </span>
                    <span>({featuredArticle.rating.totalVotes})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
