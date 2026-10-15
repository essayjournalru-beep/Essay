import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Star,
  MessageSquare,
  Users as UsersIcon,
  BarChart3,
  FileText,
  Save,
  X,
  Sparkles,
  ArrowLeft,
  Download,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Feather,
  Check,
  Award,
  RotateCcw,
  Inbox,
  ChevronUp,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { Article, ArticleSection, Author, EssaySubmission, NewsletterSubscriber, Rubric, UserProfile, UserRole } from '../types';
import { HERO_COVER_PATH } from '../data/seedData';
import { ThemeLogo } from './BrandAssets';

interface AdminDashboardProps {
  articles: Article[];
  rubrics: Rubric[];
  authors: Author[];
  subscribers: NewsletterSubscriber[];
  users: UserProfile[];
  submissions?: EssaySubmission[];
  currentUser: UserProfile | null;
  onAddArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onDeleteComment: (articleId: string, commentId: string) => void;
  onUpdateUserRole: (uid: string, role: UserRole) => void;
  onUpdateProfile?: (profile: UserProfile) => void;
  onReviewArticle?: (
    articleId: string,
    isReviewed: boolean,
    feedback?: string,
    nextStatus?: 'draft' | 'pending_review' | 'revision_requested' | 'reviewed'
  ) => void;
  onUpdateSubmissionStatus?: (
    submissionId: string,
    status: EssaySubmission['status'],
    editorNotes?: string
  ) => void;
  onDeleteSubmission?: (submissionId: string) => void;
  onReadArticle?: (article: Article) => void;
  onExitAdmin: () => void;
}

type DashboardTab =
  | 'author_profile'
  | 'my_articles'
  | 'articles'
  | 'submissions'
  | 'comments'
  | 'subscribers'
  | 'users'
  | 'analytics'
  | 'profile';

export function AdminDashboard({
  articles,
  rubrics,
  authors,
  subscribers,
  users,
  submissions = [],
  currentUser,
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  onDeleteComment,
  onUpdateUserRole,
  onUpdateProfile,
  onReviewArticle,
  onUpdateSubmissionStatus,
  onDeleteSubmission,
  onReadArticle,
  onExitAdmin,
}: AdminDashboardProps) {
  const currentRole: UserRole = currentUser?.role || 'reader';
  const isGodzhaev = currentUser?.email?.toLowerCase() === 'godzhaev23@gmail.com';
  const isRealOwner =
    currentUser?.email?.toLowerCase() === 'elshan@ozat.kz' ||
    currentUser?.email?.toLowerCase() === 'owner@essay.ru';

  // Role capabilities strictly match the selected active role
  const isOwner = currentRole === 'owner';
  const isAuthor = currentRole === 'author';
  const isEditor = currentRole === 'editor';
  const isAdmin = currentRole === 'admin';
  const isReader = currentRole === 'reader';

  // Permission to use the role switcher: real owner, Godzhaev, or if the role is owner/admin
  const canSwitchRole = isRealOwner || isGodzhaev || isOwner || isAdmin;

  // Исключительное право публикации нового эссе принадлежит роли «Автор»
  const canPublishArticle = isAuthor;

  // Initial active tab based on role
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    if (isAuthor) return 'author_profile';
    if (isEditor) return 'articles';
    if (isAdmin || isOwner) return 'articles';
    return 'profile';
  });

  // When role changes, switch active tab appropriately if current tab is not allowed
  useEffect(() => {
    if (isReader && activeTab !== 'profile') {
      setActiveTab('profile');
    } else if (
      isAuthor &&
      (activeTab === 'users' || activeTab === 'analytics' || activeTab === 'articles' || activeTab === 'submissions' || activeTab === 'comments' || activeTab === 'subscribers')
    ) {
      setActiveTab('author_profile');
    } else if (
      isEditor &&
      (activeTab === 'author_profile' || activeTab === 'my_articles' || activeTab === 'users' || activeTab === 'analytics')
    ) {
      setActiveTab('articles');
    } else if (
      (isAdmin || isOwner) &&
      (activeTab === 'author_profile' || activeTab === 'my_articles')
    ) {
      setActiveTab('articles');
    }
  }, [currentRole]);

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [submitToEditorOnSave, setSubmitToEditorOnSave] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<EssaySubmission | null>(null);
  const [submissionEditorNotes, setSubmissionEditorNotes] = useState('');
  const [lockedModalOpen, setLockedModalOpen] = useState<string | null>(null);
  const [reviewNoteModalArticle, setReviewNoteModalArticle] = useState<Article | null>(null);
  const [reviewFeedbackText, setReviewFeedbackText] = useState('');
  const [reviewActionType, setReviewActionType] = useState<'approve' | 'revision'>('approve');
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);

  const showBanner = (text: string, type: 'success' | 'warning' = 'success') => {
    setStatusBanner({ text, type });
    setTimeout(() => {
      setStatusBanner(null);
    }, 4000);
  };

  // Profile editing state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || '');
  const [profileBio, setProfileBio] = useState(currentUser?.bio || '');
  const [profileSpecialization, setProfileSpecialization] = useState(currentUser?.specialization || '');
  const [profileTelegram, setProfileTelegram] = useState(currentUser?.socials?.telegram || '');
  const [profileLinkedin, setProfileLinkedin] = useState(currentUser?.socials?.linkedin || '');
  const [profileWebsite, setProfileWebsite] = useState(currentUser?.socials?.website || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileEmail(currentUser.email || '');
      setProfileAvatar(currentUser.avatar || '');
      setProfileBio(currentUser.bio || '');
      setProfileSpecialization(currentUser.specialization || '');
      setProfileTelegram(currentUser.socials?.telegram || '');
      setProfileLinkedin(currentUser.socials?.linkedin || '');
      setProfileWebsite(currentUser.socials?.website || '');
    }
  }, [currentUser]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      name: profileName.trim(),
      email: profileEmail.trim(),
      avatar: profileAvatar.trim(),
      bio: profileBio.trim(),
      specialization: profileSpecialization.trim(),
      socials: {
        telegram: profileTelegram.trim(),
        linkedin: profileLinkedin.trim(),
        website: profileWebsite.trim(),
      },
    };
    onUpdateProfile?.(updated);
    setProfileSuccess(true);
    showBanner('Профиль успешно сохранён и обновлён.');
    setTimeout(() => setProfileSuccess(false), 3500);
  };

  // Permissions strictly by current role
  const canManageUsers = isOwner || isAdmin;
  const canAccessManagement = isOwner || isAdmin || isEditor;

  // New / Edit form state with full dynamic sections support
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    rubricId: rubrics[0]?.id || 'culture',
    authorId: authors[0]?.id || '',
    authorName: currentUser?.name || 'Автор эссе',
    tagsString: '',
    readTimeMinutes: 8,
    coverImage: HERO_COVER_PATH,
    coverCaption: '',
    coverSource: 'Иллюстрация: Редакция «ЭССЕ»',
    sections: [] as ArticleSection[],
    isFeatured: false,
    isEditorPick: false,
    status: 'draft' as 'draft' | 'pending_review' | 'revision_requested' | 'reviewed',
  });

  // Open modal to create a new essay (ONLY AUTHOR CAN TRIGGER THIS)
  const openNewArticleModal = () => {
    if (!canPublishArticle) {
      showBanner('Публикация новых эссе доступна исключительно пользователям с ролью «Автор».', 'warning');
      return;
    }
    setEditingArticle(null);
    setSubmitToEditorOnSave(false);
    setFormData({
      title: '',
      subtitle: '',
      rubricId: rubrics[0]?.id || 'culture',
      authorId: authors[0]?.id || '',
      authorName: currentUser?.name || 'Автор эссе',
      tagsString: 'культура, человек, мысль, литература',
      readTimeMinutes: 8,
      coverImage: HERO_COVER_PATH,
      coverCaption: 'Иллюстрация к авторскому эссе',
      coverSource: 'Иллюстрация: Редакция «ЭССЕ»',
      sections: [
        {
          type: 'paragraph',
          text: 'Вдумчивое эссе требует не просто изложения фактов, но глубокого личного переживания темы, погружения в природу слова и неспешного размышления.',
        },
        {
          type: 'heading2',
          text: 'Внутренний диалог и границы высказывания',
        },
        {
          type: 'paragraph',
          text: 'Когда автор доверяет своему читателю, текст обретает подлинную плотность, раскрывая новые грани знакомых явлений.',
        },
        {
          type: 'key-takeaways',
          items: ['Жанр эссе открывает пространство для свободного поиска истины через живое слово.'],
        },
      ],
      isFeatured: false,
      isEditorPick: false,
      status: 'draft',
    });
    setIsEditorOpen(true);
  };

  // Open modal to edit an essay with strict role-based permission checks
  const openEditArticleModal = (art: Article) => {
    // После проверки эссе ролью «Редактор» автор не имеет возможности редактировать публикацию, пока редактор не вернёт эссе на доработку
    if (isAuthor && art.isReviewedByEditor) {
      setLockedModalOpen(art.title);
      return;
    }

    setEditingArticle(art);
    setSubmitToEditorOnSave(false);
    const initialSections: ArticleSection[] =
      art.sections && art.sections.length > 0
        ? art.sections.map((s) => ({ ...s, items: s.items ? [...s.items] : undefined }))
        : [
            { type: 'paragraph', text: art.subtitle || '' },
            { type: 'heading2', text: 'Основная часть эссе' },
            { type: 'paragraph', text: '' },
          ];

    setFormData({
      title: art.title,
      subtitle: art.subtitle,
      rubricId: art.rubricId,
      authorId: art.author.id,
      authorName: art.author.name,
      tagsString: art.tags.join(', '),
      readTimeMinutes: art.readTimeMinutes,
      coverImage: art.coverImage,
      coverCaption: art.coverCaption || '',
      coverSource: art.coverSource || 'Фото: Unsplash (Unsplash License)',
      sections: initialSections,
      isFeatured: art.isFeatured || false,
      isEditorPick: art.isEditorPick || false,
      status: art.status || (art.isReviewedByEditor ? 'reviewed' : 'draft'),
    });
    setIsEditorOpen(true);
  };

  const handleAddSection = (type: ArticleSection['type']) => {
    const newSec: ArticleSection =
      type === 'key-takeaways'
        ? { type: 'key-takeaways', items: ['Ключевой тезис эссе'] }
        : type === 'quote'
        ? { type: 'quote', text: '', authorQuote: formData.authorName }
        : type === 'image'
        ? { type: 'image', imageUrl: '', imageCaption: '', imageSource: 'Фото: Unsplash' }
        : { type, text: '' };
    setFormData((prev) => ({ ...prev, sections: [...prev.sections, newSec] }));
  };

  const handleUpdateSection = (index: number, patch: Partial<ArticleSection>) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((sec, idx) => (idx === index ? { ...sec, ...patch } : sec)),
    }));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const next = [...prev.sections];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return { ...prev, sections: next };
    });
  };

  const handleRemoveSection = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== index),
    }));
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenAuthor = authors.find((a) => a.id === formData.authorId) || {
      id: currentUser?.id || 'author-custom',
      name: formData.authorName || currentUser?.name || 'Автор эссе',
      role: 'Автор эссе & Исследователь',
      avatar:
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      bio: currentUser?.bio || 'Автор эссе и аналитических публикаций.',
      socials: currentUser?.socials || {},
    };

    const tags = formData.tagsString
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const sections: ArticleSection[] =
      formData.sections.length > 0
        ? formData.sections
        : [{ type: 'paragraph', text: formData.subtitle }];

    if (editingArticle) {
      if (isAuthor && editingArticle.isReviewedByEditor) {
        showBanner(
          'Редактирование отклонено: это эссе уже проверено Редактором. Все финальные поправки вносит только Редактор.',
          'warning'
        );
        setIsEditorOpen(false);
        return;
      }

      const nextStatusForEdit = submitToEditorOnSave
        ? 'pending_review'
        : isEditor
        ? editingArticle.status || 'reviewed'
        : formData.status === 'revision_requested'
        ? 'revision_requested'
        : formData.status;

      const updated: Article = {
        ...editingArticle,
        title: formData.title,
        subtitle: formData.subtitle,
        rubricId: formData.rubricId,
        author: { ...chosenAuthor, name: formData.authorName || chosenAuthor.name },
        tags,
        readTimeMinutes: Number(formData.readTimeMinutes),
        coverImage: formData.coverImage,
        coverCaption: formData.coverCaption,
        coverSource: formData.coverSource,
        sections,
        isFeatured: formData.isFeatured,
        isEditorPick: formData.isEditorPick,
        status: nextStatusForEdit,
      };
      onUpdateArticle(updated);
      showBanner(
        submitToEditorOnSave
          ? `Исправленное эссе «${updated.title}» сохранено и отправлено Редактору на повторную вычитку.`
          : isEditor
          ? `Финальные редакторские правки для эссе «${updated.title}» сохранены.`
          : `Изменения в эссе «${updated.title}» сохранены.`
      );
    } else {
      if (!canPublishArticle) {
        showBanner('Только пользователь с ролью «Автор» имеет право публиковать новые эссе.', 'warning');
        return;
      }

      const newArticle: Article = {
        id: `custom-${Date.now()}`,
        slug: `essay-${Date.now()}`,
        title: formData.title,
        subtitle: formData.subtitle,
        rubricId: formData.rubricId,
        author: { ...chosenAuthor, name: formData.authorName || chosenAuthor.name },
        authorProfileId: currentUser?.id,
        tags,
        readTimeMinutes: Number(formData.readTimeMinutes),
        coverImage: formData.coverImage,
        coverCaption: formData.coverCaption,
        coverSource: formData.coverSource,
        publishedAt: new Date().toISOString().split('T')[0],
        viewsCount: 1,
        dailyViews: { [new Date().toISOString().split('T')[0]]: 1 },
        rating: { average: 5.0, totalVotes: 1 },
        comments: [],
        sections,
        isFeatured: formData.isFeatured,
        isEditorPick: formData.isEditorPick,
        status: submitToEditorOnSave ? 'pending_review' : 'draft',
        isReviewedByEditor: false,
      };
      onAddArticle(newArticle);
      showBanner(
        submitToEditorOnSave
          ? `Новое эссе «${newArticle.title}» создано и сразу отправлено Редактору на вычитку.`
          : `Новое эссе «${newArticle.title}» создано и добавлено в ваш портфель.`
      );
    }

    setIsEditorOpen(false);
    setSubmitToEditorOnSave(false);
  };

  // Convert an incoming manuscript submission into an Article in the editorial portfolio
  const handleConvertSubmissionToArticle = (sub: EssaySubmission) => {
    const paragraphs = sub.content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const generatedSections: ArticleSection[] =
      paragraphs.length > 0
        ? paragraphs.map((p) => ({ type: 'paragraph' as const, text: p }))
        : [{ type: 'paragraph' as const, text: sub.content }];

    const wordCount = sub.content.split(/\s+/).length;
    const estReadTime = Math.max(3, Math.min(35, Math.ceil(wordCount / 160)));

    const newArticle: Article = {
      id: `sub-essay-${Date.now()}`,
      slug: `essay-${Date.now()}`,
      title: sub.title,
      subtitle: sub.synopsis || 'Авторское эссе, принятое редакционным советом «ЭССЕ».',
      rubricId: sub.rubricId || rubrics[0]?.id || 'culture',
      author: {
        id: sub.userId || `author-${Date.now()}`,
        name: sub.authorName,
        role: 'Автор эссе',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sub.authorName)}`,
        bio: sub.synopsis || 'Автор журнала «ЭССЕ».',
        socials: sub.authorContact ? { telegram: sub.authorContact } : {},
      },
      authorProfileId: sub.userId || undefined,
      tags: sub.tags && sub.tags.length > 0 ? sub.tags : ['Эссе', 'Культура'],
      readTimeMinutes: estReadTime,
      coverImage: HERO_COVER_PATH,
      coverCaption: `Иллюстрация к эссе «${sub.title}»`,
      coverSource: 'Иллюстрация: Редакция «ЭССЕ»',
      publishedAt: new Date().toISOString().split('T')[0],
      viewsCount: 1,
      dailyViews: { [new Date().toISOString().split('T')[0]]: 1 },
      rating: { average: 5.0, totalVotes: 1 },
      comments: [],
      sections: generatedSections,
      isFeatured: false,
      isEditorPick: false,
      status: 'pending_review',
      isReviewedByEditor: false,
    };

    onAddArticle(newArticle);
    onUpdateSubmissionStatus?.(
      sub.id,
      'accepted',
      submissionEditorNotes.trim() || 'Рукопись принята в редакционный портфель и переведена в формат эссе.'
    );
    setSelectedSubmission(null);
    setSubmissionEditorNotes('');
    showBanner(`Рукопись «${sub.title}» принята и добавлена в портфель эссе!`);
  };

  // Author action: Send essay for editor review
  const handleSendToEditor = (articleId: string) => {
    const art = articles.find((a) => a.id === articleId);
    if (!art) return;
    const updated: Article = {
      ...art,
      status: 'pending_review',
    };
    onUpdateArticle(updated);
    showBanner(`Эссе «${art.title}» отправлено на вычитку Редактору.`);
  };

  // Editor action: Open review modal or toggle review status
  const openReviewModal = (art: Article, action: 'approve' | 'revision') => {
    setReviewNoteModalArticle(art);
    setReviewActionType(action);
    setReviewFeedbackText(art.editorFeedback || '');
  };

  const handleConfirmReviewModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewNoteModalArticle) return;
    const isApproving = reviewActionType === 'approve';
    handleToggleReview(reviewNoteModalArticle, isApproving, reviewFeedbackText.trim() || undefined);
  };

  const handleToggleReview = (art: Article, reviewState: boolean, feedback?: string) => {
    if (!isEditor && !isAdmin && !isOwner) {
      showBanner('Только Редактор может утверждать проверку эссе или отправлять его на доработку.', 'warning');
      return;
    }
    const editorName = currentUser?.name || 'Редактор';
    const editorId = currentUser?.id || 'editor-id';
    const nextStatus = reviewState ? 'reviewed' : 'revision_requested';

    if (onReviewArticle) {
      onReviewArticle(art.id, reviewState, feedback, nextStatus);
    } else {
      const updated: Article = {
        ...art,
        isReviewedByEditor: reviewState,
        status: nextStatus,
        reviewedByEditorId: editorId,
        reviewedByEditorName: editorName,
        reviewedAt: reviewState ? new Date().toISOString() : undefined,
        editorFeedback: feedback !== undefined ? feedback : art.editorFeedback,
      };
      onUpdateArticle(updated);
    }
    showBanner(
      reviewState
        ? `Эссе «${art.title}» утверждено Редактором. Редактирование для автора заблокировано.`
        : `Эссе «${art.title}» отправлено обратно автору (${art.author.name}) для исправления и редактирования.`
    );
    setReviewNoteModalArticle(null);
    setReviewFeedbackText('');
  };

  // Admin / Owner action: Toggle Editor's Pick or Featured status
  const handleToggleEditorPick = (art: Article) => {
    if (!isAdmin && !isOwner && !isEditor) return;
    const updated: Article = {
      ...art,
      isEditorPick: !art.isEditorPick,
    };
    onUpdateArticle(updated);
    showBanner(
      updated.isEditorPick
        ? `Эссе «${art.title}» отмечено знаком «Выбор редакции».`
        : `Отметка «Выбор редакции» снята с эссе «${art.title}».`
    );
  };

  // Author's personal essays
  const authorArticles = articles.filter(
    (a) =>
      a.authorProfileId === currentUser?.id ||
      a.author.id === currentUser?.id ||
      (currentUser?.name && a.author.name.toLowerCase() === currentUser.name.toLowerCase()) ||
      isAuthor
  );

  // Author's aggregated metrics
  const authorTotalViews = authorArticles.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
  const authorAvgRating = (
    authorArticles.reduce((acc, a) => acc + (a.rating?.average || 5), 0) / (authorArticles.length || 1)
  ).toFixed(1);
  const authorTotalComments = authorArticles.reduce((acc, a) => acc + (a.comments?.length || 0), 0);

  // Global project stats
  const totalViews = articles.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
  const totalComments = articles.reduce((acc, a) => acc + (a.comments?.length || 0), 0);
  const avgRating = (
    articles.reduce((acc, a) => acc + (a.rating?.average || 5), 0) / (articles.length || 1)
  ).toFixed(1);
  const reviewedCount = articles.filter((a) => a.isReviewedByEditor).length;
  const pendingReviewCount = articles.filter((a) => !a.isReviewedByEditor && a.status === 'pending_review').length;

  const exportSubscribersCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Email,Дата подписки,Темы']
        .concat(
          subscribers.map((s) => `"${s.email}","${s.subscribedAt}","${s.topics.join(';')}"`)
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `subscribers_essay_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showBanner('База подписчиков экспортирована в CSV.');
  };

  return (
    <div id="admin-dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Notification Toast Banner */}
      {statusBanner && (
        <div
          className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xs transition-all ${
            statusBanner.type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            {statusBanner.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-emerald-900/10 dark:border-emerald-500/10">
        <div>
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-100 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Вернуться к журналу «ЭССЕ»</span>
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <ThemeLogo className="w-8 h-8 rounded-xl shadow-2xs" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-50">
              {isAuthor
                ? 'Авторская студия и личный профайл'
                : isEditor
                ? 'Редакционный кабинет (Вычитка и правки эссе)'
                : isReader
                ? 'Личный кабинет читателя'
                : 'Административная панель издания'}
            </h1>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                isAuthor
                  ? 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/80 dark:text-teal-200'
                  : isEditor
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200'
                  : isAdmin
                  ? 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-200'
                  : isOwner
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200'
                  : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {isAuthor
                ? '🖋️ Автор'
                : isEditor
                ? '✍️ Редактор'
                : isAdmin
                ? '🛡️ Администратор'
                : isOwner
                ? '👑 Владелец'
                : '👤 Читатель'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-800/70 dark:text-emerald-400/70 mt-1">
            {isAuthor
              ? 'Вы имеете исключительное право создавать и публиковать новые эссе. После утверждения Редактором редактирование фиксируется.'
              : isEditor
              ? 'Вы осуществляете экспертную вычитку, утверждение эссе и вносите все финальные поправки в публикации.'
              : isReader
              ? 'Режим чтения. Административные и редакционные действия отключены. Доступны настройки личного профиля.'
              : 'Полное управление пользователями, ролями доступа, модерацией эссе, комментариями и аналитикой платформы.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Role Switcher is available to Owner, Godzhaev23@gmail.com, and Admins */}
          {canSwitchRole && currentUser && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-2 rounded-xl border border-emerald-600/30 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {isOwner ? 'Режим Владельца:' : 'Смена роли:'}
              </span>
              <select
                id="role-switcher-select"
                value={currentUser.role}
                onChange={(e) => {
                  const nextRole = e.target.value as UserRole;
                  onUpdateUserRole(currentUser.id, nextRole);
                  showBanner(`Активная роль переключена на: ${nextRole.toUpperCase()}`);
                }}
                className="bg-transparent text-xs font-extrabold text-emerald-950 dark:text-emerald-100 focus:outline-none cursor-pointer"
                title="Переключить роль для тестирования возможностей"
              >
                <option value="owner">👑 Владелец (Owner)</option>
                <option value="admin">🛡️ Администратор (Admin)</option>
                <option value="editor">✍️ Редактор (Проверка и правки)</option>
                <option value="author">🖋️ Автор (Публикация эссе)</option>
                <option value="reader">👤 Читатель (Reader)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs based on Role */}
      <div className="flex items-center gap-2 mb-6 border-b border-emerald-900/10 dark:border-emerald-500/10 pb-2 overflow-x-auto">
        {/* Author tabs */}
        {isAuthor && (
          <>
            <button
              onClick={() => setActiveTab('author_profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'author_profile'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                  : 'text-emerald-900/80 dark:text-emerald-200/80 hover:bg-emerald-100/50'
              }`}
            >
              <Feather className="w-4 h-4" />
              <span>Авторская студия</span>
            </button>

            <button
              onClick={() => setActiveTab('my_articles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'my_articles'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                  : 'text-emerald-900/80 dark:text-emerald-200/80 hover:bg-emerald-100/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Мои эссе ({authorArticles.length})</span>
            </button>
          </>
        )}

        {/* Editor, Admin, and Owner tabs */}
        {(isEditor || isAdmin || isOwner) && (
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                : 'text-emerald-900/80 dark:text-emerald-200/80 hover:bg-emerald-100/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>
              {isEditor ? 'Редакционный портфель и проверка' : 'Все эссе'} ({articles.length})
            </span>
          </button>
        )}

        {(isEditor || isAdmin || isOwner) && (
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                : 'text-emerald-900/80 dark:text-emerald-200/80 hover:bg-emerald-100/50'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Заявки авторов ({submissions.length})</span>
          </button>
        )}

        {(isEditor || isAdmin || isOwner) && (
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'comments'
                ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                : 'text-emerald-900/80 dark:text-emerald-200/80 hover:bg-emerald-100/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Модерация комментариев ({totalComments})</span>
          </button>
        )}

        {(isEditor || isAdmin || isOwner) && (
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'subscribers'
                ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                : 'text-emerald-900/80 dark:text-emerald-200/80 hover:bg-emerald-100/50'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            <span>Подписчики ({subscribers.length})</span>
          </button>
        )}

        {canManageUsers && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                : 'text-emerald-900/80 dark:text-emerald-200/80 hover:bg-emerald-100/50'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            <span>Пользователи и роли ({users.length})</span>
          </button>
        )}

        {(isAdmin || isOwner) && (
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                : 'text-emerald-900/80 dark:text-emerald-200/80 hover:bg-emerald-100/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Аналитика</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-emerald-800 text-white dark:bg-emerald-600'
              : 'text-emerald-900/80 dark:text-emerald-200/80 hover:bg-emerald-100/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Настройки аккаунта</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB: AUTHOR PROFILE (DEDICATED STUDIO FOR ROLE "АВТОР") */}
      {/* ========================================================================= */}
      {activeTab === 'author_profile' && isAuthor && currentUser && (
        <div className="space-y-8">
          {/* Author Header Card */}
          <div className="bg-white dark:bg-[#121c16] rounded-3xl border border-emerald-900/10 dark:border-emerald-500/20 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-emerald-900/10 dark:border-emerald-500/10">
              <div className="flex items-center gap-5">
                <img
                  src={profileAvatar || currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-3 border-teal-500/40 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-50">
                      {currentUser.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 border border-teal-300">
                      🖋️ Автор эссе
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {profileSpecialization || 'Эссеист, исследователь культуры и автор аналитических текстов'}
                  </p>
                  <p className="text-xs text-emerald-800/60 dark:text-emerald-400/60 font-mono mt-1">
                    {currentUser.email} • ID: {currentUser.id.slice(0, 10)}
                  </p>
                </div>
              </div>

              {/* Action: Author Write New Essay */}
              <div>
                <button
                  onClick={openNewArticleModal}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-800 text-white dark:bg-emerald-600 hover:bg-emerald-900 dark:hover:bg-emerald-500 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Создать новое эссе</span>
                </button>
              </div>
            </div>

            {/* Author Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-900/5 dark:border-emerald-500/10">
                <div className="text-[11px] font-semibold text-emerald-800/70 dark:text-emerald-400/70 uppercase tracking-wider">
                  Эссе в портфеле
                </div>
                <div className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-50 mt-1">
                  {authorArticles.length}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-900/5 dark:border-emerald-500/10">
                <div className="text-[11px] font-semibold text-emerald-800/70 dark:text-emerald-400/70 uppercase tracking-wider">
                  Просмотров читателями
                </div>
                <div className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-50 mt-1">
                  {authorTotalViews.toLocaleString('ru-RU')}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-900/5 dark:border-emerald-500/10">
                <div className="text-[11px] font-semibold text-emerald-800/70 dark:text-emerald-400/70 uppercase tracking-wider">
                  Средний рейтинг
                </div>
                <div className="text-2xl font-extrabold text-amber-500 flex items-center gap-1 mt-1">
                  <Star className="w-5 h-5 fill-amber-400" />
                  <span>{authorAvgRating}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-900/5 dark:border-emerald-500/10">
                <div className="text-[11px] font-semibold text-emerald-800/70 dark:text-emerald-400/70 uppercase tracking-wider">
                  Отзывов и комментариев
                </div>
                <div className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-50 mt-1">
                  {authorTotalComments}
                </div>
              </div>
            </div>

            {/* Author Bio & Socials */}
            <div className="mt-6 pt-6 border-t border-emerald-900/10 dark:border-emerald-500/10 flex flex-col md:flex-row justify-between gap-4">
              <div className="max-w-2xl">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  О себе и литературном опыте
                </div>
                <p className="text-xs sm:text-sm text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed">
                  {profileBio ||
                    'Биография автора ещё не заполнена. Вы можете указать свою сферу интересов, исследовательский опыт и темы эссе во вкладке «Настройки аккаунта».'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {profileTelegram && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-600/20">
                    TG: {profileTelegram}
                  </span>
                )}
                {profileLinkedin && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-600/20">
                    LinkedIn: {profileLinkedin}
                  </span>
                )}
                {profileWebsite && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-600/20">
                    Веб-сайт
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Author Publications Section */}
          <div className="bg-white dark:bg-[#121c16] rounded-3xl border border-emerald-900/10 dark:border-emerald-500/10 overflow-hidden shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-50">
                Мои эссе и текущие статусы ({authorArticles.length})
              </h3>
              <button
                onClick={openNewArticleModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-800 text-white dark:bg-emerald-600 hover:bg-emerald-900 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Новое эссе</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold border-b border-emerald-900/10 dark:border-emerald-500/10">
                  <tr>
                    <th className="p-3">Заголовок эссе</th>
                    <th className="p-3">Рубрика</th>
                    <th className="p-3">Статус проверки</th>
                    <th className="p-3">Просмотры</th>
                    <th className="p-3">Рейтинг</th>
                    <th className="p-3 text-right">Возможность правок</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/5 dark:divide-emerald-500/10">
                  {authorArticles.map((art) => {
                    const r = rubrics.find((item) => item.id === art.rubricId);
                    const isReviewed = Boolean(art.isReviewedByEditor);

                    return (
                      <tr key={art.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                        <td className="p-3 max-w-xs">
                          <div className="font-bold text-emerald-950 dark:text-emerald-100 line-clamp-1">
                            {art.title}
                          </div>
                          <div className="text-[11px] text-emerald-800/60 dark:text-emerald-400/60">
                            {art.publishedAt}
                          </div>
                          {art.editorFeedback && (
                            <div
                              className={`mt-1 text-[11px] px-2.5 py-1.5 rounded-lg border ${
                                art.status === 'revision_requested'
                                  ? 'text-amber-950 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800'
                                  : 'text-teal-800 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800/60'
                              }`}
                            >
                              <strong>
                                {art.status === 'revision_requested'
                                  ? 'Возвращено редактором на исправление:'
                                  : 'Комментарий редактора:'}
                              </strong>{' '}
                              {art.editorFeedback}
                            </div>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {r?.title || art.rubricId}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {isReviewed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Проверено редактором</span>
                            </span>
                          ) : art.status === 'revision_requested' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300">
                              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                              <span>Требует исправления автора</span>
                            </span>
                          ) : art.status === 'pending_review' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>На проверке у редактора</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300">
                              <span>Черновик автора</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-emerald-900 dark:text-emerald-300">
                          {art.viewsCount}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            {art.rating.average.toFixed(1)}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {isReviewed ? (
                            <button
                              onClick={() => setLockedModalOpen(art.title)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Нажмите для справки о блокировке"
                            >
                              <Lock className="w-3.5 h-3.5 text-rose-600" />
                              <span>Правки заблокированы</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditArticleModal(art)}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                                  art.status === 'revision_requested'
                                    ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs'
                                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                                }`}
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>
                                  {art.status === 'revision_requested' ? 'Исправить эссе' : 'Редактировать'}
                                </span>
                              </button>
                              {art.status !== 'pending_review' && (
                                <button
                                  onClick={() => handleSendToEditor(art.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 hover:bg-teal-100 cursor-pointer"
                                  title="Отправить эссе на проверку редактору"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>
                                    {art.status === 'revision_requested' ? 'Повторно редактору' : 'На проверку'}
                                  </span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: MY ESSAYS (FOR AUTHOR SHORTCUT) */}
      {/* ========================================================================= */}
      {activeTab === 'my_articles' && isAuthor && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
                Мои эссе
              </h2>
              <p className="text-xs text-emerald-800/70 dark:text-emerald-400/70">
                Управление публикациями, отправка на рецензию редактору и отслеживание читательского отклика.
              </p>
            </div>
            <button
              onClick={openNewArticleModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-800 text-white dark:bg-emerald-600 hover:bg-emerald-900 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Создать эссе</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authorArticles.map((art) => {
              const r = rubrics.find((item) => item.id === art.rubricId);
              const isReviewed = Boolean(art.isReviewedByEditor);

              return (
                <div
                  key={art.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#121c16] border border-emerald-900/10 dark:border-emerald-500/10 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        {r?.title || art.rubricId}
                      </span>
                      {isReviewed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Проверено Редактором</span>
                        </span>
                      ) : art.status === 'revision_requested' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300">
                          <RotateCcw className="w-3 h-3 text-rose-600" />
                          <span>Возвращено на исправление</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{art.status === 'pending_review' ? 'На проверке' : 'Черновик'}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100 line-clamp-2 mb-1">
                      {art.title}
                    </h3>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 line-clamp-2">
                      {art.subtitle}
                    </p>
                    {art.editorFeedback && (
                      <div
                        className={`mt-2.5 p-2.5 rounded-xl border text-xs ${
                          art.status === 'revision_requested'
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                            : 'bg-teal-50/80 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800/60 text-teal-900 dark:text-teal-200'
                        }`}
                      >
                        <strong>
                          {art.status === 'revision_requested'
                            ? 'Замечания редактора для исправления:'
                            : 'Заметка редактора:'}
                        </strong>{' '}
                        {art.editorFeedback}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-emerald-900/10 dark:border-emerald-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-emerald-800/70 dark:text-emerald-400/70">
                      <span>{art.viewsCount} просм.</span>
                      <span>★ {art.rating.average.toFixed(1)}</span>
                      <span>{art.comments.length} комм.</span>
                    </div>

                    {isReviewed ? (
                      <button
                        onClick={() => setLockedModalOpen(art.title)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 cursor-pointer"
                        title="Редактирование автором заблокировано"
                      >
                        <Lock className="w-3.5 h-3.5 text-rose-600" />
                        <span>Правки закрыты</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditArticleModal(art)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer ${
                            art.status === 'revision_requested'
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-emerald-800 dark:bg-emerald-600 hover:bg-emerald-900'
                          }`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{art.status === 'revision_requested' ? 'Исправить эссе' : 'Редактировать'}</span>
                        </button>
                        {art.status !== 'pending_review' && (
                          <button
                            onClick={() => handleSendToEditor(art.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 hover:bg-teal-100 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{art.status === 'revision_requested' ? 'Повторно редактору' : 'На проверку'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: ESSAYS (FOR EDITOR / ADMIN / OWNER) */}
      {/* ========================================================================= */}
      {activeTab === 'articles' && (isEditor || isAdmin || isOwner) && (
        <div className="space-y-4">
          {/* Header banner explaining rules */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121c16] border border-emerald-900/10 dark:border-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-50">
                {isEditor ? 'Редакционный портфель и вычитка эссе' : 'Управление эссе и публикациями журнала'}
              </h2>
              <p className="text-xs text-emerald-800/70 dark:text-emerald-400/70">
                {isEditor
                  ? 'Редактор рецензирует материалы авторов, утверждает эссе к выпуску и вносит все финальные правки.'
                  : 'Список всех опубликованных и находящихся на проверке эссе. Администраторы и Владелец управляют витриной и модерацией.'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                Проверено: {reviewedCount}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                Ожидают вычитки: {pendingReviewCount}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121c16] rounded-3xl border border-emerald-900/10 dark:border-emerald-500/10 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold border-b border-emerald-900/10 dark:border-emerald-500/10">
                  <tr>
                    <th className="p-4">Заголовок эссе</th>
                    <th className="p-4">Автор</th>
                    <th className="p-4">Статус проверки</th>
                    <th className="p-4">Рецензент</th>
                    <th className="p-4">Просмотры</th>
                    <th className="p-4 text-right">Редакционные и админ-действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/5 dark:divide-emerald-500/10">
                  {articles.map((art) => {
                    const r = rubrics.find((item) => item.id === art.rubricId);
                    const isReviewed = Boolean(art.isReviewedByEditor);

                    return (
                      <tr key={art.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                        <td className="p-4 max-w-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-emerald-950 dark:text-emerald-100 line-clamp-1">
                              {art.title}
                            </span>
                            {art.isEditorPick && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                ★ Выбор редакции
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-emerald-800/60 dark:text-emerald-400/60 flex items-center gap-2 mt-0.5">
                            <span>{r?.title || art.rubricId}</span>
                            <span>•</span>
                            <span>{art.publishedAt}</span>
                          </div>
                          {art.editorFeedback && (
                            <div className="mt-1 text-[11px] text-teal-800 dark:text-teal-300 italic line-clamp-1">
                              Рецензия: «{art.editorFeedback}»
                            </div>
                          )}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <div className="font-semibold text-emerald-950 dark:text-emerald-200">
                            {art.author.name}
                          </div>
                          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
                            Автор эссе
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          {isReviewed ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Проверено Редактором</span>
                            </span>
                          ) : art.status === 'revision_requested' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300">
                              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                              <span>Возвращено автору на исправление</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>{art.status === 'pending_review' ? 'На проверке' : 'Черновик автора'}</span>
                            </span>
                          )}
                        </td>

                        <td className="p-4 whitespace-nowrap text-xs text-emerald-800/80 dark:text-emerald-300/80">
                          {isReviewed ? (
                            <div>
                              <p className="font-medium text-emerald-950 dark:text-emerald-200">
                                {art.reviewedByEditorName || 'Редактор'}
                              </p>
                              {art.reviewedAt && (
                                <p className="text-[10px] text-emerald-800/60">
                                  {new Date(art.reviewedAt).toLocaleDateString('ru-RU')}
                                </p>
                              )}
                            </div>
                          ) : art.status === 'revision_requested' ? (
                            <span className="text-rose-700 dark:text-rose-300 font-semibold">
                              Ожидает правок автора
                            </span>
                          ) : (
                            <span className="italic text-emerald-800/50">Не проверено</span>
                          )}
                        </td>

                        <td className="p-4 whitespace-nowrap font-medium text-emerald-900 dark:text-emerald-300">
                          {art.viewsCount.toLocaleString('ru-RU')}
                        </td>

                        <td className="p-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Editor Review, Approval & Return to Author for Revision/Editing Actions */}
                            {(isEditor || isOwner || isAdmin) && (
                              <>
                                {!isReviewed && (
                                  <button
                                    onClick={() => openReviewModal(art, 'approve')}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-800 text-white dark:bg-teal-600 hover:bg-teal-900 shadow-xs cursor-pointer inline-flex items-center gap-1"
                                    title="Утвердить эссе как проверенное Редактором"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Утвердить эссе</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => openReviewModal(art, 'revision')}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200 hover:bg-amber-100 cursor-pointer inline-flex items-center gap-1"
                                  title="Отправить эссе обратно автору для исправления или редактирования"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Автору на исправление</span>
                                </button>
                              </>
                            )}

                            {/* Все финальные поправки вносит Редактор (и Владелец) */}
                            {(isEditor || isOwner) && (
                              <button
                                onClick={() => openEditArticleModal(art)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 hover:bg-emerald-200 cursor-pointer"
                                title="Внести финальные поправки в эссе как Редактор"
                              >
                                <Edit className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Финальные правки</span>
                              </button>
                            )}

                            {/* Отметка «Выбор редакции» для Админа, Редактора и Владельца */}
                            {(isAdmin || isOwner || isEditor) && (
                              <button
                                onClick={() => handleToggleEditorPick(art)}
                                className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                                  art.isEditorPick
                                    ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                                    : 'border-emerald-900/10 dark:border-emerald-500/20 text-emerald-800/70 dark:text-emerald-300/70 hover:bg-emerald-50'
                                }`}
                                title={
                                  art.isEditorPick
                                    ? 'Снять отметку «Выбор редакции»'
                                    : 'Отметить как «Выбор редакции»'
                                }
                              >
                                <Award className="w-4 h-4" />
                              </button>
                            )}

                            {/* Удаление публикации доступно Администратору и Владельцу */}
                            {(isAdmin || isOwner) && (
                              <button
                                onClick={() => setArticleToDelete(art)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                title="Удалить эссе"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: COMMENTS MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'comments' && canAccessManagement && (
        <div className="space-y-4">
          {articles.flatMap((art) => (art.comments || []).map((c) => ({ ...c, articleTitle: art.title }))).length ===
          0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#121c16] text-xs sm:text-sm text-emerald-800/70">
              Нет комментариев для модерации.
            </div>
          ) : (
            articles.flatMap((art) =>
              (art.comments || []).map((comment) => (
                <div
                  key={comment.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#121c16] border border-emerald-900/10 dark:border-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                        {comment.authorName}
                      </span>
                      <span className="text-[11px] text-emerald-800/60 dark:text-emerald-400/60">
                        ({comment.authorEmail || 'без email'}) • {comment.createdAt}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 italic">
                      К эссе: «{art.title}»
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-950/80 dark:text-emerald-200/80">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        onDeleteComment(art.id, comment.id);
                        showBanner('Комментарий удалён модератором.');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Удалить</span>
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: SUBSCRIBERS */}
      {/* ========================================================================= */}
      {activeTab === 'subscribers' && canAccessManagement && (
        <div className="bg-white dark:bg-[#121c16] rounded-3xl border border-emerald-900/10 dark:border-emerald-500/10 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
              База подписчиков дайджеста «ЭССЕ» ({subscribers.length})
            </h3>
            <button
              onClick={exportSubscribersCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Экспорт в CSV</span>
            </button>
          </div>

          <div className="divide-y divide-emerald-900/5 dark:divide-emerald-500/10">
            {subscribers.map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                    {sub.email}
                  </div>
                  <div className="text-[11px] text-emerald-800/60 dark:text-emerald-400/60">
                    Дата: {sub.subscribedAt} • Темы: {sub.topics.join(', ') || 'Все темы'}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Активен
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: USERS & ROLES */}
      {/* ========================================================================= */}
      {activeTab === 'users' && canManageUsers && (
        <div className="bg-white dark:bg-[#121c16] rounded-3xl border border-emerald-900/10 dark:border-emerald-500/10 overflow-hidden shadow-xs p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
              Управление пользователями и ролями (RBAC)
            </h2>
            <p className="text-xs text-emerald-800/70 dark:text-emerald-400/70">
              Назначайте роли пользователям (Автор, Редактор, Администратор, Владелец, Читатель) для разграничения прав публикации эссе и модерации.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold border-b border-emerald-900/10 dark:border-emerald-500/10">
                <tr>
                  <th className="p-4">Пользователь</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Дата регистрации</th>
                  <th className="p-4">Текущая роль</th>
                  <th className="p-4 text-right">Назначить роль</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/5 dark:divide-emerald-500/10">
                {users.map((u) => {
                  const targetIsOwner = u.role === 'owner';
                  // Администратор не может менять права Владельца
                  const disableSelect = (!isOwner && !isGodzhaev && !isAdmin) || (isAdmin && !isOwner && !isRealOwner && targetIsOwner);

                  return (
                    <tr key={u.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover bg-emerald-200"
                        />
                        <div>
                          <p className="font-bold text-emerald-950 dark:text-emerald-100">{u.name}</p>
                          <p className="text-[10px] text-emerald-800/60 font-mono">ID: {u.id.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="p-4 text-emerald-900/80 dark:text-emerald-300">{u.email}</td>
                      <td className="p-4 text-emerald-800/70 dark:text-emerald-400">
                        {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            u.role === 'author'
                              ? 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/85 dark:text-teal-200'
                              : u.role === 'editor'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/85 dark:text-emerald-200'
                              : u.role === 'admin'
                              ? 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/85 dark:text-indigo-200'
                              : u.role === 'owner'
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/85 dark:text-amber-200'
                              : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {u.role === 'author'
                            ? '🖋️ Автор'
                            : u.role === 'editor'
                            ? '✍️ Редактор'
                            : u.role === 'admin'
                            ? '🛡️ Админ'
                            : u.role === 'owner'
                            ? '👑 Владелец'
                            : '👤 Читатель'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={u.role}
                          disabled={disableSelect}
                          onChange={(e) => {
                            const nextRole = e.target.value as UserRole;
                            onUpdateUserRole(u.id, nextRole);
                            showBanner(`Пользователю «${u.name}» назначена роль: ${nextRole.toUpperCase()}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-500/20 text-xs font-semibold text-emerald-950 dark:text-emerald-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          title={
                            disableSelect
                              ? 'Недостаточно прав для изменения роли этого пользователя'
                              : 'Назначить роль пользователю'
                          }
                        >
                          <option value="reader">👤 Читатель</option>
                          <option value="author">🖋️ Автор (Публикация эссе)</option>
                          <option value="editor">✍️ Редактор (Проверка и правки)</option>
                          <option value="admin">🛡️ Администратор</option>
                          {(isOwner || isRealOwner) && <option value="owner">👑 Владелец</option>}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (isAdmin || isOwner) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#121c16] border border-emerald-900/10 dark:border-emerald-500/10">
              <div className="text-xs text-emerald-800/70 dark:text-emerald-400/70 mb-1">
                Всего просмотров эссе
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-50">
                {totalViews.toLocaleString('ru-RU')}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#121c16] border border-emerald-900/10 dark:border-emerald-500/10">
              <div className="text-xs text-emerald-800/70 dark:text-emerald-400/70 mb-1">
                Средняя оценка читателей
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 flex items-center gap-1.5">
                <Star className="w-6 h-6 fill-amber-400" />
                {avgRating}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#121c16] border border-emerald-900/10 dark:border-emerald-500/10">
              <div className="text-xs text-emerald-800/70 dark:text-emerald-400/70 mb-1">
                Комментарии и отклики
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-50">
                {totalComments}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#121c16] border border-emerald-900/10 dark:border-emerald-500/10">
              <div className="text-xs text-emerald-800/70 dark:text-emerald-400/70 mb-1">
                Подписчиков на дайджест
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-50">
                {subscribers.length}
              </div>
            </div>
          </div>

          {/* Rubric distribution breakdown */}
          <div className="bg-white dark:bg-[#121c16] rounded-3xl border border-emerald-900/10 dark:border-emerald-500/10 p-6">
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50 mb-4">
              Распределение эссе и читательского интереса по рубрикам
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rubrics.map((r) => {
                const rubricEssays = articles.filter((a) => a.rubricId === r.id);
                const rubricViews = rubricEssays.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
                return (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-500/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                        {r.title}
                      </div>
                      <div className="text-[11px] text-emerald-800/70 dark:text-emerald-400/70">
                        Эссе в рубрике: {rubricEssays.length}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-emerald-900 dark:text-emerald-300">
                        {rubricViews.toLocaleString('ru-RU')}
                      </div>
                      <div className="text-[10px] text-emerald-800/60 dark:text-emerald-400/60">просмотров</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: PROFILE & ACCOUNT SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && currentUser && (
        <div className="bg-white dark:bg-[#121c16] rounded-3xl border border-emerald-900/10 dark:border-emerald-500/10 overflow-hidden shadow-xs p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
          <div>
            <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50 mb-1">
              Персональный профайл ({currentRole})
            </h2>
            <p className="text-xs sm:text-sm text-emerald-800/70 dark:text-emerald-400/70">
              Настройте личные данные, отображаемое имя, аватар, специализацию и ссылки на контакты.
            </p>
          </div>

          {profileSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/80 text-emerald-950 dark:text-emerald-100 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Профиль успешно сохранён и обновлён!</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-emerald-900/10 dark:border-emerald-500/10">
              <img
                src={profileAvatar || currentUser.avatar}
                alt={profileName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600/40"
              />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                  Ссылка на аватар (URL)
                </label>
                <input
                  type="url"
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                  Ваше Имя / Псевдоним *
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                  Электронный адрес *
                </label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                Специализация / Область эссеистики
              </label>
              <input
                type="text"
                value={profileSpecialization}
                onChange={(e) => setProfileSpecialization(e.target.value)}
                placeholder="Например: Философия культуры, литературная критика, антропология"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                О себе / Биография автора
              </label>
              <textarea
                rows={3}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Расскажите о своей литературной и исследовательской деятельности..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                  Telegram
                </label>
                <input
                  type="text"
                  value={profileTelegram}
                  onChange={(e) => setProfileTelegram(e.target.value)}
                  placeholder="@username"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={profileLinkedin}
                  onChange={(e) => setProfileLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                  Веб-сайт / Блог
                </label>
                <input
                  type="url"
                  value={profileWebsite}
                  onChange={(e) => setProfileWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                id="save-profile-btn"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить профиль</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LOCKED ESSAY WARNING FOR AUTHOR */}
      {/* ========================================================================= */}
      {lockedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121c16] rounded-3xl max-w-md w-full border border-rose-300 dark:border-rose-900/50 p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-rose-600 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                  Редактирование заблокировано
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-400 font-semibold">
                  Эссе проверено Редактором
                </p>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed bg-rose-50/60 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-900/40">
              Эссе <strong className="text-emerald-950 dark:text-emerald-100">«{lockedModalOpen}»</strong> успешно прошло редакционную вычитку и утверждено к публикации.
              <br />
              <br />
              Согласно правилам издания: <strong>автор больше не имеет возможности вносить изменения</strong> в данный материал. Все последующие правки и финальные корректировки может осуществлять только <strong>«Редактор»</strong>.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setLockedModalOpen(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white dark:bg-emerald-600 hover:bg-emerald-900 cursor-pointer"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITOR REVIEW & FEEDBACK (APPROVE OR SEND BACK TO AUTHOR FOR REVISION) */}
      {/* ========================================================================= */}
      {reviewNoteModalArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121c16] rounded-3xl max-w-lg w-full border border-emerald-900/15 dark:border-emerald-500/20 p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10 dark:border-emerald-500/10">
              <div className="flex items-center gap-2.5">
                {reviewActionType === 'approve' ? (
                  <Sparkles className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                ) : (
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                )}
                <h3 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-50">
                  {reviewActionType === 'approve'
                    ? 'Утверждение эссе Редактором'
                    : 'Отправить эссе обратно автору на исправление'}
                </h3>
              </div>
              <button
                onClick={() => setReviewNoteModalArticle(null)}
                className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReviewModal} className="space-y-4">
              <div className="text-xs sm:text-sm text-emerald-900/80 dark:text-emerald-200/80">
                Эссе: <strong className="text-emerald-950 dark:text-emerald-50">«{reviewNoteModalArticle.title}»</strong>
                <br />
                Автор: <span className="font-semibold">{reviewNoteModalArticle.author.name}</span>
              </div>

              {reviewActionType === 'revision' && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  После отправки эссе получит статус <strong>«Возвращено на исправление»</strong>. Автор увидит ваши замечания в своём кабинете, сможет отредактировать текст и повторно отправить его вам на вычитку.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1.5">
                  {reviewActionType === 'approve'
                    ? 'Редакционная рецензия для автора (необязательно):'
                    : 'Укажите, что именно автору нужно исправить или отредактировать в эссе:'}
                </label>
                <textarea
                  rows={4}
                  required={reviewActionType === 'revision'}
                  value={reviewFeedbackText}
                  onChange={(e) => setReviewFeedbackText(e.target.value)}
                  placeholder={
                    reviewActionType === 'approve'
                      ? 'Например: Текст вычитан, стилистика и аргументация утверждены к выпуску.'
                      : 'Опишите правки: какие абзацы, формулировки или тезисы автору необходимо доработать...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewNoteModalArticle(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer ${
                    reviewActionType === 'approve'
                      ? 'bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600'
                      : 'bg-amber-700 hover:bg-amber-800'
                  }`}
                >
                  {reviewActionType === 'approve'
                    ? 'Утвердить и заблокировать правки автора'
                    : 'Отправить эссе автору на исправление'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW & REVIEW INCOMING MANUSCRIPT SUBMISSION */}
      {/* ========================================================================= */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#121c16] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-emerald-900/15 dark:border-emerald-500/20 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10 dark:border-emerald-500/10">
              <div>
                <h3 className="text-base sm:text-xl font-bold text-emerald-950 dark:text-emerald-50">
                  {selectedSubmission.title}
                </h3>
                <p className="text-xs text-emerald-800/70 dark:text-emerald-400/70">
                  Автор: {selectedSubmission.authorName} ({selectedSubmission.authorEmail})
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedSubmission.synopsis && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-900/10 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                <strong>Синопсис автора:</strong> {selectedSubmission.synopsis}
              </div>
            )}

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2">
                Текст рукописи / ссылка:
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-900/10 max-h-72 overflow-y-auto text-xs sm:text-sm font-serif leading-relaxed whitespace-pre-line text-emerald-950 dark:text-emerald-100">
                {selectedSubmission.content}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                Пометка редактора по заявке:
              </label>
              <textarea
                rows={2}
                value={submissionEditorNotes}
                onChange={(e) => setSubmissionEditorNotes(e.target.value)}
                placeholder="Комментарий редакции..."
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 text-emerald-950 dark:text-emerald-100"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-emerald-900/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSubmissionStatus?.(selectedSubmission.id, 'reviewing', submissionEditorNotes);
                    setSelectedSubmission(null);
                    showBanner('Статус заявки обновлён: На рассмотрении.');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 cursor-pointer"
                >
                  Взять на вычитку
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSubmissionStatus?.(selectedSubmission.id, 'declined', submissionEditorNotes);
                    setSelectedSubmission(null);
                    showBanner('Заявка отклонена.');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-100 text-rose-900 hover:bg-rose-200 cursor-pointer"
                >
                  Отклонить
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleConvertSubmissionToArticle(selectedSubmission)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Принять в портфель и создать эссе</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121c16] rounded-3xl max-w-md w-full border border-red-300 dark:border-red-900/50 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/80 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                  Удалить эссе?
                </h3>
                <p className="text-xs text-red-700 dark:text-red-400">
                  Это действие необратимо
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-950/80 dark:text-emerald-200/80">
              Вы действительно хотите удалить эссе <strong>«{articleToDelete.title}»</strong> из базы данных журнала?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setArticleToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  onDeleteArticle(articleToDelete.id);
                  showBanner(`Эссе «${articleToDelete.title}» удалено.`);
                  setArticleToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Удалить эссе
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITOR FORM (ESSAY CREATOR & AMENDMENT TOOL) */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#121c16] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-emerald-900/10 dark:border-emerald-500/20 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-emerald-900/10 dark:border-emerald-500/10">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-50">
                  {editingArticle
                    ? isEditor
                      ? 'Внесение финальных правок в эссе (Редактор)'
                      : 'Редактировать черновик эссе'
                    : 'Написать новое эссе (Автор)'}
                </h2>
                {isEditor && editingArticle && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    Редакторская вычитка
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950 cursor-pointer"
              >
                <X className="w-5 h-5 text-emerald-950 dark:text-emerald-200" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1 text-emerald-950 dark:text-emerald-100">
                  Заголовок эссе *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Архитектура тишины в эпоху цифрового шума..."
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-emerald-950 dark:text-emerald-100">
                  Подзаголовок / Лид эссе *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Краткий тезис и философский контекст размышления..."
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-emerald-950 dark:text-emerald-100">
                    Рубрика *
                  </label>
                  <select
                    value={formData.rubricId}
                    onChange={(e) => setFormData({ ...formData, rubricId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100 cursor-pointer"
                  >
                    {rubrics.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-emerald-950 dark:text-emerald-100">
                    Автор эссе
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-emerald-950 dark:text-emerald-100">
                    Время чтения (мин)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={formData.readTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, readTimeMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-emerald-950 dark:text-emerald-100">
                  Темы и теги (через запятую)
                </label>
                <input
                  type="text"
                  value={formData.tagsString}
                  onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                  placeholder="культура, память, эстетика, литература"
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-emerald-950 dark:text-emerald-100">
                    URL обложки
                  </label>
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-emerald-950 dark:text-emerald-100">
                    Подпись к обложке
                  </label>
                  <input
                    type="text"
                    value={formData.coverCaption}
                    onChange={(e) => setFormData({ ...formData, coverCaption: e.target.value })}
                    placeholder="Описание иллюстрации..."
                    className="w-full px-3.5 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-emerald-950 dark:text-emerald-100">
                    Автор / Источник фото (Копирайт) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.coverSource}
                    onChange={(e) => setFormData({ ...formData, coverSource: e.target.value })}
                    placeholder="Фото: Unsplash / Автор или Архив редакции"
                    className="w-full px-3.5 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-500/20 text-emerald-950 dark:text-emerald-100"
                  />
                </div>
              </div>

              {/* Dynamic Essay Sections Builder */}
              <div className="border-t border-emerald-900/10 dark:border-emerald-500/10 pt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block font-bold text-emerald-950 dark:text-emerald-100">
                    Структура и текст эссе ({formData.sections.length} разд.) *
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddSection('paragraph')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 cursor-pointer"
                    >
                      + Абзац
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSection('heading2')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 cursor-pointer"
                    >
                      + Подзаголовок H2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSection('quote')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 cursor-pointer"
                    >
                      + Цитата
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSection('callout')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 cursor-pointer"
                    >
                      + Врезка
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSection('key-takeaways')}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 cursor-pointer"
                    >
                      + Тезисы
                    </button>
                  </div>
                </div>

                {editingArticle?.editorFeedback && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200">
                    <strong>Комментарий редактора к этому эссе:</strong> {editingArticle.editorFeedback}
                  </div>
                )}

                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {formData.sections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-500/20 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            #{idx + 1}
                          </span>
                          <select
                            value={sec.type}
                            onChange={(e) =>
                              handleUpdateSection(idx, { type: e.target.value as ArticleSection['type'] })
                            }
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#121c16] border border-emerald-900/15 text-emerald-950 dark:text-emerald-100 cursor-pointer"
                          >
                            <option value="paragraph">Абзац текста</option>
                            <option value="heading2">Подзаголовок (H2)</option>
                            <option value="heading3">Подзаголовок (H3)</option>
                            <option value="quote">Цитата</option>
                            <option value="callout">Литературная врезка</option>
                            <option value="key-takeaways">Главные тезисы</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSection(idx, 'up')}
                            className="p-1 rounded hover:bg-emerald-200/50 disabled:opacity-30 cursor-pointer"
                            title="Переместить выше"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === formData.sections.length - 1}
                            onClick={() => handleMoveSection(idx, 'down')}
                            className="p-1 rounded hover:bg-emerald-200/50 disabled:opacity-30 cursor-pointer"
                            title="Переместить ниже"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          {formData.sections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSection(idx)}
                              className="p-1 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Удалить блок"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {sec.type === 'key-takeaways' ? (
                        <textarea
                          rows={2}
                          value={(sec.items || []).join('\n')}
                          onChange={(e) =>
                            handleUpdateSection(idx, {
                              items: e.target.value.split('\n').filter((line) => line.trim().length > 0),
                            })
                          }
                          placeholder="Каждый тезис с новой строки..."
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121c16] border border-emerald-900/10 text-emerald-950 dark:text-emerald-100 text-xs"
                        />
                      ) : (
                        <textarea
                          rows={sec.type === 'heading2' || sec.type === 'heading3' ? 1 : 3}
                          value={sec.text || ''}
                          onChange={(e) => handleUpdateSection(idx, { text: e.target.value })}
                          placeholder={
                            sec.type === 'heading2' || sec.type === 'heading3'
                              ? 'Введите текст подзаголовка...'
                              : 'Введите текст раздела...'
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121c16] border border-emerald-900/10 text-emerald-950 dark:text-emerald-100 text-xs"
                        />
                      )}

                      {sec.type === 'quote' && (
                        <input
                          type="text"
                          value={sec.authorQuote || ''}
                          onChange={(e) => handleUpdateSection(idx, { authorQuote: e.target.value })}
                          placeholder="Автор цитаты / источник"
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#121c16] border border-emerald-900/10 text-emerald-950 dark:text-emerald-100 text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                <label className="flex items-center gap-2 font-semibold text-emerald-950 dark:text-emerald-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Разместить как главное эссе номера (Hero)</span>
                </label>

                {(isEditor || isAdmin || isOwner) && (
                  <label className="flex items-center gap-2 font-semibold text-emerald-950 dark:text-emerald-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isEditorPick}
                      onChange={(e) => setFormData({ ...formData, isEditorPick: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Отметить как «Выбор редакции»</span>
                  </label>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-2.5 pt-4 border-t border-emerald-900/10 dark:border-emerald-500/10">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
                >
                  Отмена
                </button>
                {isAuthor && (
                  <button
                    type="submit"
                    onClick={() => setSubmitToEditorOnSave(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Сохранить и отправить Редактору</span>
                  </button>
                )}
                <button
                  type="submit"
                  id="save-article-submit-btn"
                  onClick={() => setSubmitToEditorOnSave(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {editingArticle
                      ? isEditor
                        ? 'Применить финальные правки'
                        : 'Сохранить эссе'
                      : 'Опубликовать эссе (Автор)'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
