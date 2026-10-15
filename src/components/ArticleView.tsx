import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Star,
  Bookmark,
  Share2,
  Check,
  Send,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
  BookOpen,
  Calendar,
  Globe,
  Twitter,
  Linkedin,
  Mail,
  Copy,
  X,
  CornerDownRight,
  UserCheck,
} from 'lucide-react';
import { Article, Rubric, UserProfile } from '../types';
import { getImageCopyrightAttribution } from '../data/seedData';
import { TranslationDictionary } from '../i18n/translations';
import { BrandDropCap, ThemeLogo, ContentIcon } from './BrandAssets';
import { ShareEssayModal } from './ShareEssayModal';

interface ArticleViewProps {
  article: Article;
  rubric?: Rubric;
  latestArticles?: Article[];
  rubrics?: Rubric[];
  onSelectArticle?: (article: Article) => void;
  onSelectAuthor?: (authorName: string) => void;
  savedReadingProgress?: number;
  onSaveReadingProgress?: (articleId: string, progress: number) => void;
  onBack: () => void;
  onRateArticle: (articleId: string, ratingValue: number) => void;
  onAddComment: (
    articleId: string,
    authorName: string,
    authorEmail: string,
    content: string,
    parentCommentId?: string
  ) => Promise<void> | void;
  onLikeComment: (articleId: string, commentId: string) => Promise<void> | void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelectTag: (tag: string) => void;
  currentUser?: UserProfile | null;
  t: TranslationDictionary;
}

export function ArticleView({
  article,
  rubric,
  latestArticles,
  rubrics,
  onSelectArticle,
  onSelectAuthor,
  savedReadingProgress,
  onSaveReadingProgress,
  onBack,
  onRateArticle,
  onAddComment,
  onLikeComment,
  isSaved,
  onToggleSave,
  onSelectTag,
  currentUser,
  t,
}: ArticleViewProps) {
  // Reading progress
  const [scrollProgress, setScrollProgress] = useState(0);

  // Rating interactive state
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [userRatingSubmitted, setUserRatingSubmitted] = useState(false);

  // Share modal with applications
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Resume reading prompt
  const [resumeBannerProgress, setResumeBannerProgress] = useState<number | null>(() => {
    if (savedReadingProgress && savedReadingProgress >= 10 && savedReadingProgress <= 92) {
      return Math.round(savedReadingProgress);
    }
    return null;
  });

  useEffect(() => {
    if (savedReadingProgress && savedReadingProgress >= 10 && savedReadingProgress <= 92 && scrollProgress < 8) {
      setResumeBannerProgress(Math.round(savedReadingProgress));
    } else {
      setResumeBannerProgress(null);
    }
  }, [article.id]);

  // State for OS-style Email Application Chooser dialog (Способ Б)
  const [isEmailChooserOpen, setIsEmailChooserOpen] = useState(false);
  const [copiedAuthorEmail, setCopiedAuthorEmail] = useState(false);

  const authorContactEmail = 'editor@essay.ru';
  const authorMailSubject = `Для автора: ${article.author.name} («${article.title}»)`;
  const authorMailBody = `Здравствуйте, ${article.author.name}!\n\nПишу вам по поводу вашего эссе «${article.title}»:\n`;

  // Main comment form state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccessToast, setCommentSuccessToast] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setCommentName(currentUser.name);
      if (currentUser.email) setCommentEmail(currentUser.email);
    }
  }, [currentUser]);

  // Reply form state
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyAuthorName, setReplyAuthorName] = useState('');
  const [replyAuthorEmail, setReplyAuthorEmail] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setReplyAuthorName(currentUser.name);
      if (currentUser.email) setReplyAuthorEmail(currentUser.email);
    }
  }, [currentUser]);

  const commentsListRef = useRef<HTMLDivElement>(null);

  // Track scroll position for reading progress bar and save reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
        if (progress > 5) {
          onSaveReadingProgress?.(article.id, Math.round(progress));
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article.id, onSaveReadingProgress]);

  const hasVoted = userRatingSubmitted || (article.rating.userRating !== undefined && article.rating.userRating !== null);

  const handleRate = (rating: number) => {
    if (hasVoted) return;
    onRateArticle(article.id, rating);
    setUserRatingSubmitted(true);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    if (!commentName.trim() || !commentEmail.trim() || !commentText.trim() || isSubmittingComment) return;

    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!strictEmailRegex.test(commentEmail.trim())) {
      setCommentError('Введите корректный адрес электронной почты');
      return;
    }

    try {
      setIsSubmittingComment(true);
      await onAddComment(
        article.id,
        commentName.trim(),
        commentEmail.trim(),
        commentText.trim()
      );
      setCommentText('');
      setCommentSuccessToast(true);
      setTimeout(() => setCommentSuccessToast(false), 4000);
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (parentCommentId: string) => {
    setReplyError('');
    if (!replyAuthorName.trim() || !replyAuthorEmail.trim() || !replyText.trim() || isSubmittingReply) return;

    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!strictEmailRegex.test(replyAuthorEmail.trim())) {
      setReplyError('Введите корректный адрес электронной почты');
      return;
    }

    try {
      setIsSubmittingReply(true);
      await onAddComment(
        article.id,
        replyAuthorName.trim(),
        replyAuthorEmail.trim(),
        replyText.trim(),
        parentCommentId
      );
      setReplyText('');
      setReplyToId(null);
      setCommentSuccessToast(true);
      setTimeout(() => setCommentSuccessToast(false), 4000);
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const safeComments = article.comments || [];
  const effectiveSections = (article.sections && article.sections.length > 0)
    ? article.sections
    : [
        {
          type: 'callout' as const,
          text: `«${article.subtitle || 'Вдумчивое авторское эссе о человеке, культуре и времени.'}»`,
        },
        {
          type: 'paragraph' as const,
          text: article.subtitle || 'В эпоху ускорения и цифрового шума эссеистика становится убежищем для медленной мысли.',
        },
        {
          type: 'heading2' as const,
          text: 'Опыт осмысления и внутренняя свобода',
        },
        {
          type: 'paragraph' as const,
          text: 'Каждый авторский текст — это попытка зафиксировать ускользающее переживание, соотнести свой внутренний мир с культурным контекстом эпохи и дать читателю пространство для свободного диалога.',
        },
        {
          type: 'quote' as const,
          authorQuote: article.author?.name || 'Автор',
          text: 'Смысл текста рождается не в момент написания, а в момент внимательного, неторопливого прочтения.',
        },
        {
          type: 'key-takeaways' as const,
          items: [
            'Глубокое чтение требует внутренней тишины и отказа от суеты.',
            'Слово обретает подлинную плотность, когда автор доверяет своему читателю.',
          ],
        },
      ];
  const headings = effectiveSections
    .map((section, sectionIdx) => ({
      text: section.text,
      type: section.type,
      targetId: `essay-section-heading-${sectionIdx}`,
    }))
    .filter((s) => s.type === 'heading2' || s.type === 'heading3');

  const scrollToHeading = (targetId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      elem.classList.add('bg-[#C85D36]/10', 'rounded-lg', 'transition-colors', 'duration-700');
      setTimeout(() => {
        elem.classList.remove('bg-[#C85D36]/10');
      }, 1500);
    }
  };

  const displayLatestArticles = (latestArticles && latestArticles.length > 0)
    ? latestArticles.slice(0, 6)
    : [];

  return (
    <div id={`article-view-${article.id}`} className="relative pb-24">
      {/* Top Fixed Reading Progress Indicator in Terracotta */}
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50 pointer-events-none">
        <div
          className="h-full bg-[#C85D36] transition-all duration-150 ease-out shadow-xs"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Navigation & Reader Controls Bar */}
        <div className="flex items-center justify-between gap-2 py-4 border-b border-[#E2D3BE] dark:border-[#3D352E] mb-8">
          <button
            id="back-to-feed-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] hover:text-[#C85D36] dark:hover:text-[#E8A87C] transition-colors px-3.5 py-2 rounded-xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#C85D36]" />
            <span>{t.backToFeed}</span>
          </button>

          {/* Domain & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Save Button */}
            <button
              onClick={() => onToggleSave(article.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#C85D36] text-white border-[#C85D36] shadow-xs'
                  : 'bg-[#F4EFE6] dark:bg-[#241E1A] text-[#1F1914] dark:text-[#FAF7F2] border border-[#E2D3BE] dark:border-[#3D352E] hover:bg-[#E2D3BE]/50'
              }`}
              title={isSaved ? t.unsave : t.save}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Resume Reading Prompt Banner */}
        {resumeBannerProgress !== null && (
          <div className="mb-6 p-3.5 sm:px-5 rounded-2xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#C85D36]/40 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#1F1914] dark:text-[#FAF7F2]">
              <BookOpen className="w-4 h-4 text-[#C85D36] shrink-0" />
              <span>
                Вы уже читали это эссе (остановились на <strong>{resumeBannerProgress}%</strong> текста).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                  window.scrollTo({ top: (totalHeight * resumeBannerProgress) / 100, behavior: 'smooth' });
                  setResumeBannerProgress(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#C85D36] hover:bg-[#B34E28] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Продолжить с этого места
              </button>
              <button
                type="button"
                onClick={() => setResumeBannerProgress(null)}
                className="p-1.5 rounded-lg text-[#8C827A] hover:text-[#1F1914] dark:hover:text-[#FAF7F2] cursor-pointer"
                title="Скрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main 2-Column Grid: Longread Article + Right Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
          {/* Left Column: Article Longread Content */}
          <article className="lg:col-span-8 min-w-0 transition-all duration-200">
            {/* Article Header */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                {rubric && (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#EBDBC4] dark:bg-[#3A322B] text-[#C85D36] dark:text-[#E8A87C]">
                    {rubric.title}
                  </span>
                )}
                {article.isReviewedByEditor && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] flex items-center gap-1.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5 text-[#C85D36] stroke-[3]" />
                    <span>Редакция ЭССЕ</span>
                  </span>
                )}
                {article.publishedAt && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] text-[#4A4036] dark:text-[#D1C7BD] flex items-center gap-1.5 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-[#C85D36]" />
                    <span className="text-[#8C827A] dark:text-[#A89F95]">Дата публикации:</span>
                    <span className="font-semibold text-[#1F1914] dark:text-[#FAF7F2]">{article.publishedAt}</span>
                  </span>
                )}
              </div>

              {/* Title in Rich Serif */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B241E] dark:text-[#FAF7F2] leading-tight mb-6">
                {article.title}
              </h1>

              {/* Subtitle / Excerpt */}
              <p className="text-lg sm:text-xl text-[#6B625B] dark:text-[#9E9388] leading-relaxed font-normal mb-8 border-l-2 border-[#C85D36] pl-4">
                {article.subtitle}
              </p>

              {/* Author byline */}
              <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-[#EBDBC4] dark:border-[#3A322B]">
                <button
                  type="button"
                  onClick={() => onSelectAuthor?.(article.author.name)}
                  title={`Открыть все эссе автора: ${article.author.name}`}
                  className="flex items-center gap-3 text-left group/byline cursor-pointer"
                >
                  <img
                    src={article.author.avatar || undefined}
                    alt={article.author.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#DFCEB4] group-hover/byline:border-[#C85D36] transition-colors"
                  />
                  <div>
                    <div className="text-sm font-bold text-[#2B241E] dark:text-[#FAF7F2] group-hover/byline:text-[#C85D36] dark:group-hover/byline:text-[#E8A87C] transition-colors">
                      {article.author.name}
                    </div>
                    <div className="text-xs text-[#6B625B] dark:text-[#9E9388]">
                      {article.author.role}
                    </div>
                  </div>
                </button>
              </div>
            </header>

            {/* Cover Hero Image */}
            <div className="rounded-3xl overflow-hidden mb-10 border border-[#E2D3BE] dark:border-[#3D352E] shadow-xs">
              <img
                src={article.coverImage || 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1200'}
                alt={article.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1200';
                }}
                className="w-full h-auto max-h-[480px] object-cover"
              />
              <div className="p-3 sm:px-5 bg-[#F4EFE6] dark:bg-[#241E1A] border-t border-[#E2D3BE] dark:border-[#3D352E] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                {article.coverCaption ? (
                  <span className="text-[#4A4036] dark:text-[#D1C7BD] font-medium">
                    {article.coverCaption}
                  </span>
                ) : (
                  <span className="text-[#4A4036] dark:text-[#D1C7BD] font-medium">
                    Иллюстрация к эссе «{article.title}»
                  </span>
                )}
                <span className="text-[11px] text-[#8C827A] dark:text-[#A89F95] shrink-0 font-medium">
                  © {getImageCopyrightAttribution(article.coverImage, article.coverSource)}
                </span>
              </div>
            </div>

            {/* Mobile / Inline Table of Contents with content icon */}
            {headings.length > 0 && (
              <div className="lg:hidden mb-8 p-5 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] shadow-2xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2D3BE]/60 dark:border-[#3D352E]">
                  <div className="flex items-center gap-2">
                    <ContentIcon className="w-5 h-5" />
                    <span className="font-bold text-xs uppercase tracking-wider text-[#1F1914] dark:text-[#FAF7F2]">
                      Содержание эссе
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#C85D36] font-semibold">
                    {headings.length} {headings.length === 1 ? 'глава' : headings.length < 5 ? 'главы' : 'глав'}
                  </span>
                </div>
                <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {headings.map((h, i) => (
                    <button
                      key={h.targetId}
                      type="button"
                      onClick={(e) => scrollToHeading(h.targetId, e)}
                      className="text-left p-2 rounded-xl text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#C85D36] dark:hover:text-[#E8A87C] hover:bg-[#E2D3BE]/40 dark:hover:bg-[#2C241E] leading-snug transition-colors cursor-pointer flex items-start gap-2"
                    >
                      <span className="font-mono text-[11px] font-semibold text-[#C85D36] shrink-0 mt-0.5">
                        {String(i + 1).padStart(2, '0')}.
                      </span>
                      <span className="line-clamp-1 font-medium">{h.text}</span>
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* Article Body Sections */}
            <div className="prose prose-stone dark:prose-invert max-w-none text-[#1F1914] dark:text-[#FAF7F2] leading-relaxed text-base sm:text-lg">
              {effectiveSections.map((section, idx) => {
                switch (section.type) {
                  case 'callout':
                    return (
                      <div
                        key={idx}
                        className="my-8 p-6 sm:p-8 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] shadow-2xs"
                      >
                        <div className="flex items-start gap-3">
                          <BrandDropCap className="w-6 h-6 shrink-0 mt-0.5 text-[#C85D36]" />
                          <p className="font-serif italic text-base sm:text-lg text-[#1F1914] dark:text-[#FAF7F2] leading-relaxed m-0">
                            {section.text}
                          </p>
                        </div>
                      </div>
                    );

                  case 'quote':
                    return (
                      <blockquote
                        key={idx}
                        className="my-8 p-6 border-l-4 border-[#C85D36] bg-[#FAF7F2] dark:bg-[#201A16] rounded-r-2xl font-serif text-lg sm:text-xl text-[#2B241E] dark:text-[#FAF7F2] italic my-6 shadow-2xs"
                      >
                        <p className="mb-2">"{section.text}"</p>
                        {(section.authorQuote || section.quoteSource) && (
                          <cite className="block text-xs font-sans not-italic text-[#6B625B] dark:text-[#9E9388]">
                            — {section.authorQuote}{section.quoteSource ? `, ${section.quoteSource}` : ''}
                          </cite>
                        )}
                      </blockquote>
                    );

                  case 'heading2':
                    return (
                      <h2
                        key={idx}
                        id={`essay-section-heading-${idx}`}
                        className="scroll-mt-28 font-serif text-2xl sm:text-3xl font-bold text-[#1F1914] dark:text-[#FAF7F2] mt-10 mb-4 pb-2 border-b border-[#E2D3BE]/60 dark:border-[#3D352E]"
                      >
                        {section.text}
                      </h2>
                    );

                  case 'heading3':
                    return (
                      <h3
                        key={idx}
                        id={`essay-section-heading-${idx}`}
                        className="scroll-mt-28 font-serif text-xl sm:text-2xl font-semibold text-[#1F1914] dark:text-[#FAF7F2] mt-8 mb-3"
                      >
                        {section.text}
                      </h3>
                    );

                  case 'image':
                    return (
                      <figure
                        key={idx}
                        className="my-8 rounded-3xl overflow-hidden border border-[#E2D3BE] dark:border-[#3D352E] bg-[#F4EFE6] dark:bg-[#241E1A]"
                      >
                        {section.imageUrl && (
                          <img
                            src={section.imageUrl}
                            alt={section.imageCaption || article.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-auto object-cover"
                          />
                        )}
                        <figcaption className="p-3 sm:px-5 border-t border-[#E2D3BE] dark:border-[#3D352E] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#4A4036] dark:text-[#D1C7BD]">
                          <span>{section.imageCaption || 'Иллюстрация к разделу'}</span>
                          <span className="text-[11px] text-[#8C827A] dark:text-[#A89F95] shrink-0">
                            © {getImageCopyrightAttribution(section.imageUrl, section.imageSource)}
                          </span>
                        </figcaption>
                      </figure>
                    );

                  case 'key-takeaways':
                    return (
                      <div
                        key={idx}
                        className="my-8 p-6 rounded-3xl bg-[#EBDBC4]/30 dark:bg-[#241E1A] border border-[#DFCEB4] dark:border-[#3A322B]"
                      >
                        <h4 className="font-bold text-sm uppercase tracking-wider text-[#C85D36] mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span>Главные тезисы эссе</span>
                        </h4>
                        <ul className="space-y-2 list-none p-0 m-0">
                          {section.items?.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start gap-2.5 text-sm sm:text-base leading-relaxed text-[#2B241E] dark:text-[#EAE3D9]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C85D36] mt-2.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );

                  case 'paragraph':
                  default:
                    // Add decorative drop cap to first paragraph
                    if (idx === 1 || (idx === 0 && section.type === 'paragraph')) {
                      return (
                        <p key={idx} className="my-5 leading-relaxed">
                          {section.text}
                        </p>
                      );
                    }
                    return (
                      <p key={idx} className="my-5 leading-relaxed">
                        {section.text}
                      </p>
                    );
                }
              })}
            </div>

            {/* Literary Endmark / Виньетка окончания текста журнала */}
            <div className="my-12 flex items-center justify-center gap-4 select-none">
              <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#D1C2A5] dark:to-[#4A3F35]" />
              <ThemeLogo className="w-8 h-8" title="Конец эссе • Журнал «ЭССЕ»" />
              <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#D1C2A5] dark:to-[#4A3F35]" />
            </div>

            {/* Article Footer Bar: Tags on left, Rating (★ 5.0 (73 оценок)) & Share Button on right */}
            <div className="mt-10 pt-6 border-t border-[#EBDBC4] dark:border-[#3A322B] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#6B625B] dark:text-[#9E9388] self-center mr-1">
                  {t.tags}:
                </span>
                {article.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onSelectTag(tag)}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#EBDBC4] dark:border-[#3A322B] text-[#6B625B] dark:text-[#9E9388] hover:text-[#C85D36] hover:border-[#C85D36]/40 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {/* Moved Rating Indicator (from Screenshot 2) */}
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] font-semibold text-xs text-[#2B241E] dark:text-[#FAF7F2]">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{article.rating.average.toFixed(1)}</span>
                  <span className="text-[11px] font-normal text-[#6B625B] dark:text-[#9E9388]">
                    ({article.rating.totalVotes} {t.votes})
                  </span>
                </div>

                {/* Moved Share Button under the article */}
                <button
                  id="share-direct-essay-link-btn"
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#F4EFE6] dark:bg-[#241E1A] text-[#1F1914] dark:text-[#FAF7F2] border border-[#E2D3BE] dark:border-[#3D352E] hover:border-[#C85D36] hover:text-[#C85D36] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
                  title="Поделиться эссе"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#C85D36]" />
                  <span>{t.share}</span>
                </button>
              </div>
            </div>

            {/* Interactive Rating Section */}
            <div className="mt-8 p-6 rounded-3xl bg-[#FAF7F2] dark:bg-[#201A16] border border-[#E2D3BE] dark:border-[#3D352E] text-center shadow-2xs">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-2">
                Понравилось ли вам эссе?
              </h3>
              <p className="text-xs text-[#4A4036] dark:text-[#D1C7BD] mb-4">
                Поставьте оценку или поделитесь вашей мыслью с автором и читателями
              </p>
              <div className="flex justify-center items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    disabled={hasVoted}
                    onMouseEnter={() => !hasVoted && setHoveredStar(star)}
                    onMouseLeave={() => !hasVoted && setHoveredStar(null)}
                    onClick={() => handleRate(star)}
                    className={`p-1.5 transition-transform ${hasVoted ? 'cursor-default' : 'hover:scale-125 cursor-pointer'}`}
                    title={`Оценить на ${star}`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        (hoveredStar !== null
                          ? star <= hoveredStar
                          : hasVoted && article.rating.userRating
                          ? star <= article.rating.userRating
                          : false)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-[#D1C7BD] dark:text-[#52483E]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {!hasVoted && (
                <p className="text-[11px] text-[#8C827A] dark:text-[#9E9388] mt-1">
                  Нажмите на звезду, чтобы поставить оценку от 1 до 5
                </p>
              )}
              {hasVoted && (
                <div className="text-xs text-[#C85D36] font-semibold mt-2">
                  ✓ Спасибо за вашу оценку!
                </div>
              )}
            </div>

            {/* Author Card Box */}
            <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#EBDBC4] dark:border-[#3A322B] flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img
                src={article.author.avatar || undefined}
                alt={article.author.name}
                className="w-20 h-20 rounded-2xl object-cover border border-[#DFCEB4] shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#C85D36]">
                    Об авторе
                  </div>
                  <span className="text-[10px] text-[#8C827A]">•</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6B625B] dark:text-[#9E9388]">
                    <ThemeLogo className="w-4 h-4" />
                    <span>Редакция «ЭССЕ»</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#2B241E] dark:text-[#FAF7F2] mb-1">
                  {article.author.name}
                </h3>
                <p className="text-xs text-[#6B625B] dark:text-[#9E9388] mb-3">
                  {article.author.role}
                </p>
                <p className="text-sm text-[#2B241E] dark:text-[#EAE3D9] leading-relaxed mb-4">
                  {article.author.bio}
                </p>
                {/* Author Social Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#EBDBC4] dark:border-[#3D352E]">
                  <span className="text-[11px] font-semibold text-[#8C827A] dark:text-[#A89F95] mr-1">
                    Связь с автором:
                  </span>

                  {article.author.socials?.telegram && (
                    <a
                      href={
                        article.author.socials.telegram.startsWith('http')
                          ? article.author.socials.telegram
                          : `https://t.me/${article.author.socials.telegram.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF7F2] dark:bg-[#1A1613] text-[#2B241E] dark:text-[#FAF7F2] hover:bg-[#C85D36] hover:text-white dark:hover:bg-[#C85D36] dark:hover:text-white border border-[#DFCEB4] dark:border-[#3D352E] transition-all duration-200 shadow-2xs group cursor-pointer"
                      title={`Telegram: ${article.author.socials.telegram}`}
                    >
                      <Send className="w-3.5 h-3.5 text-[#C85D36] group-hover:text-white transition-colors" />
                      <span>Telegram</span>
                    </a>
                  )}

                  {article.author.socials?.twitter && (
                    <a
                      href={
                        article.author.socials.twitter.startsWith('http')
                          ? article.author.socials.twitter
                          : `https://twitter.com/${article.author.socials.twitter.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF7F2] dark:bg-[#1A1613] text-[#2B241E] dark:text-[#FAF7F2] hover:bg-[#C85D36] hover:text-white dark:hover:bg-[#C85D36] dark:hover:text-white border border-[#DFCEB4] dark:border-[#3D352E] transition-all duration-200 shadow-2xs group cursor-pointer"
                      title={`Twitter / X: ${article.author.socials.twitter}`}
                    >
                      <Twitter className="w-3.5 h-3.5 text-[#C85D36] group-hover:text-white transition-colors" />
                      <span>X (Twitter)</span>
                    </a>
                  )}

                  {article.author.socials?.website && (
                    <a
                      href={article.author.socials.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF7F2] dark:bg-[#1A1613] text-[#2B241E] dark:text-[#FAF7F2] hover:bg-[#C85D36] hover:text-white dark:hover:bg-[#C85D36] dark:hover:text-white border border-[#DFCEB4] dark:border-[#3D352E] transition-all duration-200 shadow-2xs group cursor-pointer"
                      title="Личный сайт / Блог автора"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#C85D36] group-hover:text-white transition-colors" />
                      <span>Сайт автора</span>
                    </a>
                  )}

                  {article.author.socials?.linkedin && (
                    <a
                      href={
                        article.author.socials.linkedin.startsWith('http')
                          ? article.author.socials.linkedin
                          : `https://linkedin.com/in/${article.author.socials.linkedin}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF7F2] dark:bg-[#1A1613] text-[#2B241E] dark:text-[#FAF7F2] hover:bg-[#C85D36] hover:text-white dark:hover:bg-[#C85D36] dark:hover:text-white border border-[#DFCEB4] dark:border-[#3D352E] transition-all duration-200 shadow-2xs group cursor-pointer"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-[#C85D36] group-hover:text-white transition-colors" />
                      <span>LinkedIn</span>
                    </a>
                  )}

                  {/* Single button «Написать на почту» that opens the OS-style Email App Chooser */}
                  <button
                    type="button"
                    onClick={() => setIsEmailChooserOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF7F2] dark:bg-[#1A1613] text-[#2B241E] dark:text-[#FAF7F2] hover:bg-[#C85D36] hover:text-white dark:hover:bg-[#C85D36] dark:hover:text-white border border-[#DFCEB4] dark:border-[#3D352E] transition-all duration-200 shadow-2xs group cursor-pointer"
                    title={`Написать на почту автору ${article.author.name} (${authorContactEmail})`}
                  >
                    <Mail className="w-3.5 h-3.5 text-[#C85D36] group-hover:text-white transition-colors" />
                    <span>Написать на почту</span>
                  </button>

                  {onSelectAuthor && (
                    <button
                      type="button"
                      onClick={() => onSelectAuthor(article.author.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#C85D36] hover:bg-[#B34E28] text-white transition-all duration-200 shadow-2xs cursor-pointer"
                      title={`Посмотреть все эссе автора ${article.author.name}`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Все эссе автора</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Comments / Reader Dialogue Section */}
            <div className="mt-12" ref={commentsListRef}>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#EBDBC4] dark:border-[#3A322B]">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2B241E] dark:text-[#FAF7F2] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#C85D36]" />
                  <span>{t.commentsTitle} ({safeComments.length})</span>
                </h3>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-10 p-6 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#EBDBC4] dark:border-[#3A322B]">
                <h4 className="text-sm font-bold text-[#2B241E] dark:text-[#FAF7F2] mb-3">
                  Оставить размышление или отзыв
                </h4>
                {commentError && (
                  <div className="mb-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200">
                    {commentError}
                  </div>
                )}
                {commentSuccessToast && (
                  <div className="mb-3 text-xs text-green-700 bg-green-50 dark:bg-green-950/30 p-2.5 rounded-xl border border-green-200">
                    Ваш комментарий опубликован!
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder={t.yourName}
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#EBDBC4] dark:border-[#3A322B] text-[#2B241E] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                  <input
                    type="email"
                    placeholder={t.emailOptional}
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#EBDBC4] dark:border-[#3A322B] text-[#2B241E] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder={t.writeComment}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                  className="w-full p-3.5 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#EBDBC4] dark:border-[#3A322B] text-[#2B241E] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36] mb-3"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="px-5 py-2.5 rounded-xl bg-[#C85D36] hover:bg-[#B34E28] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingComment ? 'Публикация...' : t.sendComment}</span>
                </button>
              </form>

              {/* List Comments with Threaded Replies */}
              <div className="space-y-4">
                {safeComments.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#EBDBC4] dark:border-[#3A322B]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-[#2B241E] dark:text-[#FAF7F2]">
                        {c.authorName}
                      </div>
                      <div className="text-[11px] text-[#6B625B] dark:text-[#9E9388]">
                        {c.createdAt}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[#2B241E] dark:text-[#EAE3D9] leading-relaxed mb-3 whitespace-pre-line">
                      {c.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => onLikeComment(article.id, c.id)}
                        className="text-xs text-[#6B625B] hover:text-[#C85D36] flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{c.likes || 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyToId(replyToId === c.id ? null : c.id);
                          setReplyError('');
                        }}
                        className="text-xs text-[#6B625B] hover:text-[#C85D36] flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>{t.reply}</span>
                      </button>
                    </div>

                    {/* Inline Reply Form */}
                    {replyToId === c.id && (
                      <div className="mt-4 pt-3 border-t border-[#EBDBC4] dark:border-[#3A322B] space-y-2.5">
                        {replyError && (
                          <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded-xl border border-red-200">
                            {replyError}
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <input
                            type="text"
                            placeholder={t.yourName}
                            value={replyAuthorName}
                            onChange={(e) => setReplyAuthorName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#EBDBC4] dark:border-[#3A322B] text-[#2B241E] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                          />
                          <input
                            type="email"
                            placeholder={t.emailOptional}
                            value={replyAuthorEmail}
                            onChange={(e) => setReplyAuthorEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#EBDBC4] dark:border-[#3A322B] text-[#2B241E] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                          />
                        </div>
                        <textarea
                          rows={2}
                          placeholder={`Ответ для ${c.authorName}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full p-3 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#EBDBC4] dark:border-[#3A322B] text-[#2B241E] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyToId(null)}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#6B625B] hover:text-[#1F1914] dark:hover:text-[#FAF7F2] cursor-pointer"
                          >
                            {t.cancel}
                          </button>
                          <button
                            type="button"
                            disabled={isSubmittingReply}
                            onClick={() => handleReplySubmit(c.id)}
                            className="px-4 py-1.5 rounded-xl bg-[#C85D36] hover:bg-[#B34E28] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            {isSubmittingReply ? 'Отправка...' : t.sendReply}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="mt-4 pl-4 sm:pl-6 border-l-2 border-[#C85D36]/40 space-y-3">
                        {c.replies.map((r) => (
                          <div
                            key={r.id}
                            className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#EBDBC4]/80 dark:border-[#3A322B]"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-[#2B241E] dark:text-[#FAF7F2]">
                                {r.authorName}
                              </span>
                              <span className="text-[10px] text-[#6B625B] dark:text-[#9E9388]">
                                {r.createdAt}
                              </span>
                            </div>
                            <p className="text-xs text-[#2B241E] dark:text-[#EAE3D9] leading-relaxed mb-2 whitespace-pre-line">
                              {r.content}
                            </p>
                            <button
                              type="button"
                              onClick={() => onLikeComment(article.id, r.id)}
                              className="text-[11px] text-[#6B625B] hover:text-[#C85D36] flex items-center gap-1 cursor-pointer"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{r.likes || 0}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Right Sidebar: Table of contents & Latest Essays */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Table of Contents */}
            {headings.length > 0 && (
              <div className="p-5 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] shadow-2xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1F1914] dark:text-[#FAF7F2] mb-3 pb-2 border-b border-[#E2D3BE]/60 dark:border-[#3D352E] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ContentIcon className="w-5 h-5" />
                    <span>Содержание эссе</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#C85D36] font-semibold">
                    {headings.length} {headings.length === 1 ? 'глава' : headings.length < 5 ? 'главы' : 'глав'}
                  </span>
                </h4>
                <nav className="space-y-1.5 text-xs">
                  {headings.map((h, i) => (
                    <button
                      key={h.targetId}
                      type="button"
                      onClick={(e) => scrollToHeading(h.targetId, e)}
                      className="w-full text-left p-2 rounded-xl text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#C85D36] dark:hover:text-[#E8A87C] hover:bg-[#E2D3BE]/40 dark:hover:bg-[#2C241E] leading-snug transition-colors cursor-pointer flex items-start gap-2.5 group"
                    >
                      <span className="font-mono text-[11px] font-semibold text-[#C85D36] shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform">
                        {String(i + 1).padStart(2, '0')}.
                      </span>
                      <span className="line-clamp-2 font-medium">
                        {h.text}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* Fresh Essays in the issue */}
            {displayLatestArticles.length > 0 && (
              <div className="p-5 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1F1914] dark:text-[#FAF7F2] mb-3 pb-2 border-b border-[#E2D3BE]/60 dark:border-[#3D352E]">
                  Другие эссе номера
                </h4>
                <div className="space-y-3">
                  {displayLatestArticles
                    .filter((a) => a.id !== article.id)
                    .slice(0, 4)
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelectArticle?.(item)}
                        className="p-2.5 rounded-2xl hover:bg-[#E2D3BE]/50 dark:hover:bg-[#2F2722] transition-colors cursor-pointer border border-transparent hover:border-[#E2D3BE] flex items-center gap-3 group"
                      >
                        <img
                          src={item.coverImage || 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=240'}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=240';
                          }}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#E2D3BE]/80 dark:border-[#3D352E]"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-serif text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] group-hover:text-[#C85D36] dark:group-hover:text-[#E8A87C] line-clamp-2 leading-snug transition-colors">
                            {item.title || 'Авторское эссе'}
                          </h5>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#4A4036] dark:text-[#D1C7BD] font-medium">
                            <span>{item.author?.name || 'Эссеист'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <ShareEssayModal
        article={article}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* OS-Style Email Application Chooser Dialog (Способ Б) */}
      {isEmailChooserOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsEmailChooserOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#FAF7F2] dark:bg-[#221D19] border border-[#E2D3BE] dark:border-[#3D352E] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* System-style dialog header */}
            <div className="px-5 py-4 bg-[#F4EFE6] dark:bg-[#1A1613] border-b border-[#E2D3BE] dark:border-[#3D352E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C85D36]/15 text-[#C85D36] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#1F1914] dark:text-[#FAF7F2] leading-tight">
                    Выберите приложение для отправки письма
                  </h3>
                  <p className="text-[11px] text-[#6B625B] dark:text-[#9E9388] truncate max-w-[260px]">
                    Кому: {article.author.name} ({authorContactEmail})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailChooserOpen(false)}
                className="p-1.5 rounded-lg text-[#8C827A] hover:text-[#1F1914] dark:hover:text-[#FAF7F2] hover:bg-[#E2D3BE]/40 dark:hover:bg-[#2F2722] transition-colors cursor-pointer"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Application list */}
            <div className="p-4 space-y-2">
              {/* 1. Microsoft Outlook */}
              <a
                href={`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(authorContactEmail)}&subject=${encodeURIComponent(authorMailSubject)}&body=${encodeURIComponent(authorMailBody)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsEmailChooserOpen(false)}
                className="w-full p-3 rounded-xl bg-white dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] hover:border-[#0078D4] dark:hover:border-[#0078D4] hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0078D4] text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                    O
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] group-hover:text-[#0078D4] transition-colors">
                      Microsoft Outlook
                    </div>
                    <div className="text-[11px] text-[#6B625B] dark:text-[#9E9388]">
                      Создать новое письмо в Outlook
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#8C827A] group-hover:text-[#0078D4]" />
              </a>

              {/* 2. Gmail */}
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(authorContactEmail)}&su=${encodeURIComponent(authorMailSubject)}&body=${encodeURIComponent(authorMailBody)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsEmailChooserOpen(false)}
                className="w-full p-3 rounded-xl bg-white dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] hover:border-[#EA4335] dark:hover:border-[#EA4335] hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EA4335] text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                    M
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] group-hover:text-[#EA4335] transition-colors">
                      Gmail (Google Почта)
                    </div>
                    <div className="text-[11px] text-[#6B625B] dark:text-[#9E9388]">
                      Создать новое письмо в Gmail
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#8C827A] group-hover:text-[#EA4335]" />
              </a>

              {/* 3. Яндекс Почта */}
              <a
                href={`https://mail.yandex.ru/compose?to=${encodeURIComponent(authorContactEmail)}&subject=${encodeURIComponent(authorMailSubject)}&body=${encodeURIComponent(authorMailBody)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsEmailChooserOpen(false)}
                className="w-full p-3 rounded-xl bg-white dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] hover:border-[#FC3F1D] dark:hover:border-[#FC3F1D] hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FC3F1D] text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                    Я
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] group-hover:text-[#FC3F1D] transition-colors">
                      Яндекс Почта
                    </div>
                    <div className="text-[11px] text-[#6B625B] dark:text-[#9E9388]">
                      Создать новое письмо в Яндекс Почте
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#8C827A] group-hover:text-[#FC3F1D]" />
              </a>

              {/* 4. Почта Mail.ru */}
              <a
                href={`https://e.mail.ru/compose/?to=${encodeURIComponent(authorContactEmail)}&subject=${encodeURIComponent(authorMailSubject)}&body=${encodeURIComponent(authorMailBody)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsEmailChooserOpen(false)}
                className="w-full p-3 rounded-xl bg-white dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] hover:border-[#005FF9] dark:hover:border-[#005FF9] hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#005FF9] text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                    @
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] group-hover:text-[#005FF9] transition-colors">
                      Почта Mail.ru
                    </div>
                    <div className="text-[11px] text-[#6B625B] dark:text-[#9E9388]">
                      Создать новое письмо в Mail.ru
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#8C827A] group-hover:text-[#005FF9]" />
              </a>
            </div>

            {/* Bottom bar: Copy recipient email */}
            <div className="px-4 py-3 bg-[#F4EFE6] dark:bg-[#1A1613] border-t border-[#E2D3BE] dark:border-[#3D352E] flex items-center justify-between">
              <span className="text-xs font-mono text-[#4A4036] dark:text-[#D1C7BD]">
                {authorContactEmail}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (navigator?.clipboard?.writeText) {
                    navigator.clipboard.writeText(authorContactEmail);
                    setCopiedAuthorEmail(true);
                    setTimeout(() => setCopiedAuthorEmail(false), 3000);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF7F2] dark:bg-[#241E1A] text-[#C85D36] border border-[#E2D3BE] dark:border-[#3D352E] hover:bg-[#C85D36] hover:text-white transition-colors cursor-pointer"
              >
                {copiedAuthorEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Адрес скопирован</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопировать адрес</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
