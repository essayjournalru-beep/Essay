import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RubricsAndFilters } from './components/RubricsAndFilters';
import { ArticleCard } from './components/ArticleCard';
import { ArticleView } from './components/ArticleView';
import { NewsletterSection } from './components/NewsletterSection';
import { AdminDashboard } from './components/AdminDashboard';
import { SearchModal } from './components/SearchModal';
import { SavedArticlesModal } from './components/SavedArticlesModal';
import { Footer } from './components/Footer';
import { LegalAndContactsPages } from './components/LegalAndContactsPages';
import { DEFAULT_RUBRICS, INITIAL_ARTICLES, getArticleDailyViews, getTodayDateKey } from './data/seedData';
import {
  Article,
  Comment,
  EssaySubmission,
  NewsletterSubscriber,
  Rubric,
  Author,
  ThemeMode,
  ViewMode,
  UserProfile,
  UserRole,
  ReaderFont,
  ReaderFontSize,
  SiteContactDetails,
} from './types';
import { translations } from './i18n/translations';
import { getLocalizedArticle } from './i18n/localizedContent';
import {
  subscribeArticles,
  subscribeRubrics,
  subscribeAuthors,
  subscribeSubscribers,
  subscribeUsers,
  subscribeEssaySubmissions,
  updateEssaySubmissionInFirestore,
  deleteEssaySubmissionFromFirestore,
  addCommentToFirestore,
  likeCommentInFirestore,
  deleteCommentInFirestore,
  rateArticleInFirestore,
  incrementArticleViews,
  saveArticleToFirestore,
  deleteArticleFromFirestore,
  saveSubscriberToFirestore,
  getUserProfile,
  saveUserProfile,
  updateUserRoleInFirestore,
  reviewArticleInFirestore,
  DEFAULT_SITE_CONTACTS,
  subscribeSiteContacts,
  saveSiteContactsToFirestore,
} from './services/firebaseService';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { AuthModal } from './components/AuthModal';
import { SubmitEssayModal } from './components/SubmitEssayModal';
import { Loader2, Tag, X, BookOpen, ArrowRight, UserCheck } from 'lucide-react';

const STORAGE_KEY_THEME = 'essay_theme_v2';
const STORAGE_KEY_SAVED = 'essay_saved_v2';

export default function App() {
  // 1. Theme State - Light theme default
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 2. Dynamic State loaded 100% from Firebase Firestore with offline fallback
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [rubrics, setRubrics] = useState<Rubric[]>(DEFAULT_RUBRICS);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [essaySubmissions, setEssaySubmissions] = useState<EssaySubmission[]>([]);
  const [isLoadingFromFirebase, setIsLoadingFromFirebase] = useState(false);

  // Subscribe to Firestore collections in real time
  useEffect(() => {
    // 1. Articles listener
    const unsubArticles = subscribeArticles(
      (fireArticles) => {
        if (fireArticles.length > 0) {
          // Keep curated high-res covers and complete sections aligned
          const aligned = fireArticles.map((art) => {
            const seed = INITIAL_ARTICLES.find((s) => s.id === art.id);
            if (seed) {
              const updated: Article = {
                ...art,
                coverImage: seed.coverImage,
                coverCaption: seed.coverCaption,
                coverSource: art.coverSource || seed.coverSource,
                dailyViews: {
                  ...(seed.dailyViews || {}),
                  ...(art.dailyViews || {}),
                },
                sections: (art.sections && art.sections.length > 0) ? art.sections : seed.sections,
              };
              return updated;
            }
            return art;
          });
          setArticles(aligned);
        } else {
          // Seed initial 10 articles if Firestore is empty or purged
          INITIAL_ARTICLES.forEach(async (art) => {
            try {
              await saveArticleToFirestore(art);
            } catch (e) {
              console.error('Error seeding article:', e);
            }
          });
          setArticles(INITIAL_ARTICLES);
        }
        setIsLoadingFromFirebase(false);
      },
      (err) => {
        console.warn('Articles offline/subscription note:', err);
        setArticles(INITIAL_ARTICLES);
        setIsLoadingFromFirebase(false);
      }
    );

    // 2. Rubrics listener
    const unsubRubrics = subscribeRubrics(
      (fireRubrics) => {
        if (fireRubrics.length > 0) {
          setRubrics(fireRubrics);
        } else {
          setRubrics(DEFAULT_RUBRICS);
        }
      },
      (err) => console.warn('Rubrics subscription error:', err)
    );

    // 3. Authors listener
    const unsubAuthors = subscribeAuthors(
      (fireAuthors) => {
        setAuthors(fireAuthors);
      },
      (err) => console.warn('Authors subscription error:', err)
    );

    // 4. Subscribers listener
    const unsubSubscribers = subscribeSubscribers(
      (fireSubs) => {
        setSubscribers(fireSubs);
      },
      (err) => console.warn('Subscribers subscription error:', err)
    );

    // 5. Users listener, Essay Submissions & Auth State
    const unsubContacts = subscribeSiteContacts((contacts) => {
      setSiteContacts(contacts);
    });

    const unsubSubmissions = subscribeEssaySubmissions(
      (subs) => {
        setEssaySubmissions(subs);
      },
      (err) => console.warn('Essay submissions subscription note:', err)
    );

    const unsubUsers = subscribeUsers(
      (fireUsers) => {
        setUsers(fireUsers);
        // Automatically ensure Godzhaev23@gmail.com has admin role if currently reader
        const gzUser = fireUsers.find((u) => u.email?.toLowerCase() === 'godzhaev23@gmail.com');
        if (gzUser && gzUser.role === 'reader') {
          updateUserRoleInFirestore(gzUser.id, 'admin').catch(console.error);
        }
      },
      (err) => console.warn('Users subscription error:', err)
    );

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profile = await getUserProfile(firebaseUser.uid);
        const emailLower = firebaseUser.email?.toLowerCase() || '';
        const isOwnerEmail = emailLower === 'elshan@ozat.kz' || emailLower === 'owner@essay.ru';
        const isGodzhaev = emailLower === 'godzhaev23@gmail.com';

        if (!profile) {
          profile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || (isGodzhaev ? 'Администратор' : 'Пользователь'),
            avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            role: isOwnerEmail ? 'owner' : isGodzhaev ? 'admin' : 'reader',
            createdAt: new Date().toISOString().split('T')[0],
          };
          await saveUserProfile(profile);
        } else {
          // STRICT REQUIREMENT: Role assigned by Owner in Firestore is permanent and authoritative!
          if (isOwnerEmail && profile.role !== 'owner') {
            profile.role = 'owner';
            await saveUserProfile(profile);
          } else if (isGodzhaev && profile.role === 'reader') {
            profile.role = 'admin';
            await saveUserProfile(profile);
          }
        }
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      unsubArticles();
      unsubRubrics();
      unsubAuthors();
      unsubSubscribers();
      unsubUsers();
      unsubContacts();
      unsubSubmissions();
      unsubscribeAuth();
    };
  }, []);

  const [siteContacts, setSiteContacts] = useState<SiteContactDetails>(DEFAULT_SITE_CONTACTS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitEssayOpen, setIsSubmitEssayOpen] = useState(false);
  const [globalFontSize, setGlobalFontSize] = useState<ReaderFontSize>(() => {
    try {
      const saved = localStorage.getItem('essay_global_font_size');
      if (saved === 'normal' || saved === 'large' || saved === 'xlarge') return saved as ReaderFontSize;
    } catch {}
    return 'normal';
  });

  useEffect(() => {
    try {
      localStorage.setItem('essay_global_font_size', globalFontSize);
      document.documentElement.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');
      document.documentElement.classList.add(`font-size-${globalFontSize}`);
    } catch {}
  }, [globalFontSize]);

  const [globalFontFamily, setGlobalFontFamily] = useState<ReaderFont>(() => {
    try {
      const saved = localStorage.getItem('essay_global_font_family');
      if (saved === 'literata' || saved === 'merriweather' || saved === 'sans') return saved as ReaderFont;
    } catch {}
    return 'literata';
  });

  useEffect(() => {
    try {
      localStorage.setItem('essay_global_font_family', globalFontFamily);
      document.documentElement.classList.remove('font-family-literata', 'font-family-merriweather', 'font-family-sans');
      document.documentElement.classList.add(`font-family-${globalFontFamily}`);
    } catch {}
  }, [globalFontFamily]);

  // Russian only as requested
  const t = translations['ru'];

  // User Ratings (Local storage persistence per user device)
  const [userRatings, setUserRatings] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('essay_user_ratings_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem('essay_user_ratings_v1', JSON.stringify(userRatings));
    } catch (e) {}
  }, [userRatings]);

  const localizedRubrics = rubrics;

  const localizedArticles = useMemo(() => {
    return articles.map((a) => {
      const localized = getLocalizedArticle(a);
      return {
        ...localized,
        rating: {
          ...localized.rating,
          userRating: userRatings[a.id] ?? localized.rating.userRating,
        },
      };
    });
  }, [articles, userRatings]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handleUpdateUserRole = async (uid: string, role: UserRole) => {
    try {
      await updateUserRoleInFirestore(uid, role);
      // Optimistic update
      setUsers((prev) => prev.map((u) => u.id === uid ? { ...u, role } : u));
      if (currentUser && currentUser.id === uid) {
        setCurrentUser({ ...currentUser, role });
      }
    } catch (e) {
      console.error('Error updating user role:', e);
      alert('Ошибка при обновлении роли пользователя');
    }
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    try {
      await saveUserProfile(updated);
      setCurrentUser(updated);
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === updated.id);
        if (exists) {
          return prev.map((u) => u.id === updated.id ? updated : u);
        }
        return [...prev, updated];
      });
    } catch (e) {
      console.error('Error saving user profile:', e);
      alert('Ошибка при сохранении профиля');
    }
  };

  // 3. Saved / Bookmarked Articles (Local + Cloud user profile sync)
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedArticleIds));
  }, [savedArticleIds]);

  // Merge cloud savedArticleIds when user logs in
  useEffect(() => {
    if (currentUser?.savedArticleIds && Array.isArray(currentUser.savedArticleIds)) {
      setSavedArticleIds((prev) => {
        const merged = Array.from(new Set([...prev, ...(currentUser.savedArticleIds || [])]));
        return merged;
      });
    }
  }, [currentUser?.id]);

  const toggleSaveArticle = (articleId: string) => {
    setSavedArticleIds((prev) => {
      const next = prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId];
      if (currentUser) {
        const updatedProfile: UserProfile = { ...currentUser, savedArticleIds: next };
        setCurrentUser(updatedProfile);
        saveUserProfile(updatedProfile).catch(() => {});
      }
      return next;
    });
  };

  // 4. Newsletter Subscribers Handler (deduplicated by email)
  const handleSubscribe = async (email: string, topics: string[]) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existingSub = subscribers.find(
      (s) => s.email.trim().toLowerCase() === normalizedEmail
    );
    const newSub: NewsletterSubscriber = {
      id: existingSub ? existingSub.id : `sub-${normalizedEmail.replace(/[^a-z0-9._-]/g, '_')}`,
      email: normalizedEmail,
      subscribedAt: existingSub ? existingSub.subscribedAt : new Date().toISOString().split('T')[0],
      topics,
    };
    try {
      await saveSubscriberToFirestore(newSub);
    } catch (e) {
      console.error('Error saving subscriber to Firebase:', e);
    }
  };

  // 5. Navigation & View Modes + Direct Essay Link Routing
  const getInitialEssayIdFromUrl = (): string | null => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get('essay');
      if (fromQuery) return fromQuery;
      if (window.location.hash.startsWith('#essay-')) {
        return decodeURIComponent(window.location.hash.replace('#essay-', ''));
      }
    } catch {}
    return null;
  };

  const initialUrlEssayId = getInitialEssayIdFromUrl();
  const [viewMode, setViewMode] = useState<ViewMode>(() => (initialUrlEssayId ? 'article' : 'feed'));
  const [activeArticleId, setActiveArticleId] = useState<string | null>(() => initialUrlEssayId);
  const [activeRubricId, setActiveRubricId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeAuthorName, setActiveAuthorName] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating' | 'readTime'>('latest');

  // Reading progress memory for "Continue Reading" banner
  const [readingProgressMap, setReadingProgressMap] = useState<Record<string, { progress: number; updatedAt: number }>>(() => {
    try {
      const raw = localStorage.getItem('essay_reading_progress_v1');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  });

  useEffect(() => {
    if (viewMode === 'feed') {
      try {
        const raw = localStorage.getItem('essay_reading_progress_v1');
        if (raw) setReadingProgressMap(JSON.parse(raw));
      } catch {}
    }
  }, [viewMode]);

  // Listen to browser back/forward or direct hash/query changes
  useEffect(() => {
    const syncFromUrl = () => {
      const essayId = getInitialEssayIdFromUrl();
      if (essayId) {
        setActiveArticleId(essayId);
        setViewMode('article');
      }
    };
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('hashchange', syncFromUrl);
    };
  }, []);

  const clearEssayFromUrl = () => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('essay') || url.hash.startsWith('#essay-')) {
        url.searchParams.delete('essay');
        if (url.hash.startsWith('#essay-')) url.hash = '';
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
    } catch {}
  };

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);

  // Read article handler
  const handleReadArticle = (article: Article) => {
    const todayKey = getTodayDateKey();
    setActiveArticleId(article.id);
    setViewMode('article');

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('essay', article.id);
      window.history.replaceState({ essayId: article.id }, '', url.pathname + url.search);
    } catch {}

    // Optimistically update total views and 24h daily views
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id !== article.id) return a;
        const currentDaily = a.dailyViews?.[todayKey] || 0;
        return {
          ...a,
          viewsCount: (a.viewsCount || 0) + 1,
          dailyViews: {
            ...(a.dailyViews || {}),
            [todayKey]: currentDaily + 1,
          },
        };
      })
    );

    incrementArticleViews(article.id, article.viewsCount, article.dailyViews);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentArticle = useMemo(() => {
    if (!localizedArticles || localizedArticles.length === 0) return null;
    return localizedArticles.find((a) => a.id === activeArticleId) || localizedArticles[0];
  }, [localizedArticles, activeArticleId]);

  // Rating action in Firebase
  const handleRateArticle = async (articleId: string, ratingValue: number) => {
    const art = articles.find((a) => a.id === articleId);
    if (!art) return;

    const existingUserRating = userRatings[articleId] !== undefined ? userRatings[articleId] : art.rating.userRating;
    if (existingUserRating !== undefined && existingUserRating !== null) {
      return; // Disable repeated voting
    }

    const currentTotal = art.rating.totalVotes || 0;
    const currentAverage = art.rating.average || 5;

    const newTotal = currentTotal + 1;
    const currentSum = currentAverage * currentTotal;
    const newAvg = parseFloat(((currentSum + ratingValue) / newTotal).toFixed(2));

    setUserRatings((prev) => ({ ...prev, [articleId]: ratingValue }));

    // Optimistic local update
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId
          ? {
              ...a,
              rating: {
                average: newAvg,
                totalVotes: newTotal,
                userRating: ratingValue,
              },
            }
          : a
      )
    );

    // Persist directly to Firebase Firestore
    try {
      await rateArticleInFirestore(articleId, currentAverage, currentTotal, ratingValue, undefined);
    } catch (e) {
      console.error('Failed to rate article in Firebase:', e);
    }
  };

  // Comments actions in Firebase
  const handleAddComment = async (
    articleId: string,
    authorName: string,
    authorEmail: string,
    content: string,
    parentCommentId?: string
  ) => {
    // Auto-register / login user on comment submission with Name and Email
    if (authorEmail && authorName) {
      const normalizedEmail = authorEmail.trim().toLowerCase();
      const isOwnerEmail = normalizedEmail === 'elshan@ozat.kz' || normalizedEmail === 'owner@essay.ru';
      const isGodzhaev = normalizedEmail === 'godzhaev23@gmail.com';
      let existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!existingUser) {
        const newUser: UserProfile = {
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          email: authorEmail.trim(),
          name: authorName.trim(),
          role: isOwnerEmail ? 'owner' : isGodzhaev ? 'admin' : 'reader',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName.trim())}`,
          createdAt: new Date().toISOString().split('T')[0],
        };
        try {
          await saveUserProfile(newUser);
          setUsers((prev) => [...prev, newUser]);
          setCurrentUser(newUser);
        } catch (e) {
          console.error('Error saving auto-registered user:', e);
        }
      } else {
        // STRICT: Do NOT overwrite the existing user's role that was set by Owner!
        if (!currentUser || currentUser.email !== authorEmail.trim()) {
          setCurrentUser(existingUser);
        }
      }
    }

    const now = new Date();
    const dateFormatted = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    const newComment: Comment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postId: articleId,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      content: content.trim(),
      createdAt: dateFormatted,
      likes: 0,
      replies: [],
    };

    const targetArticle = articles.find((a) => a.id === articleId);
    const existingComments = targetArticle?.comments || [];

    // Optimistic UI update
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id !== articleId) return a;
        const currentList = a.comments || [];
        if (parentCommentId) {
          const updated = currentList.map((c) => {
            if (c.id === parentCommentId) {
              return { ...c, replies: [...(c.replies || []), newComment] };
            }
            return c;
          });
          return { ...a, comments: updated };
        } else {
          return { ...a, comments: [newComment, ...currentList] };
        }
      })
    );

    // Persist directly to Firebase Firestore
    try {
      await addCommentToFirestore(articleId, existingComments, newComment, parentCommentId);
    } catch (err) {
      console.error('Error saving comment to Firebase:', err);
    }
  };

  const handleLikeComment = async (articleId: string, commentId: string) => {
    const targetArticle = articles.find((a) => a.id === articleId);
    const existingComments = targetArticle?.comments || [];

    // Optimistic UI update
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id !== articleId) return a;
        const updated = (a.comments || []).map((c) => {
          if (c.id === commentId) {
            return { ...c, likes: (c.likes || 0) + 1 };
          }
          if (c.replies && c.replies.some((r) => r.id === commentId)) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId ? { ...r, likes: (r.likes || 0) + 1 } : r
              ),
            };
          }
          return c;
        });
        return { ...a, comments: updated };
      })
    );

    // Persist to Firebase Firestore
    try {
      await likeCommentInFirestore(articleId, existingComments, commentId);
    } catch (err) {
      console.error('Error liking comment in Firebase:', err);
    }
  };

  // Admin Actions with Firebase Sync
  const handleAddArticle = async (newArticle: Article) => {
    try {
      await saveArticleToFirestore(newArticle);
    } catch (e) {
      console.error('Error adding article to Firebase:', e);
    }
  };

  const handleUpdateArticle = async (updated: Article) => {
    try {
      await saveArticleToFirestore(updated);
    } catch (e) {
      console.error('Error updating article in Firebase:', e);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      await deleteArticleFromFirestore(articleId);
    } catch (e) {
      console.error('Error deleting article from Firebase:', e);
    }
  };

  const handleDeleteComment = async (articleId: string, commentId: string) => {
    const targetArticle = articles.find((a) => a.id === articleId);
    const existingComments = targetArticle?.comments || [];

    try {
      await deleteCommentInFirestore(articleId, existingComments, commentId);
    } catch (e) {
      console.error('Error deleting comment in Firebase:', e);
    }
  };

  const handleReviewArticle = async (
    articleId: string,
    isReviewed: boolean,
    feedback?: string,
    nextStatus?: 'draft' | 'pending_review' | 'revision_requested'
  ) => {
    const editorName = currentUser?.name || 'Редактор';
    const editorId = currentUser?.id || 'editor-default';
    const targetStatus = isReviewed ? 'reviewed' : (nextStatus || 'draft');
    try {
      await reviewArticleInFirestore(articleId, { id: editorId, name: editorName }, isReviewed, feedback, nextStatus);
      setArticles((prev) =>
        prev.map((a) =>
          a.id === articleId
            ? {
                ...a,
                isReviewedByEditor: isReviewed,
                status: targetStatus,
                reviewedByEditorId: editorId,
                reviewedByEditorName: editorName,
                reviewedAt: new Date().toISOString().split('T')[0],
                editorFeedback: feedback,
              }
            : a
        )
      );
    } catch (e) {
      console.error('Error reviewing article in Firebase:', e);
    }
  };

  const handleUpdateSubmissionStatus = async (
    submissionId: string,
    status: EssaySubmission['status'],
    editorNotes?: string
  ) => {
    try {
      await updateEssaySubmissionInFirestore(submissionId, status, editorNotes);
      setEssaySubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, status, ...(editorNotes !== undefined ? { editorNotes } : {}) }
            : s
        )
      );
    } catch (e) {
      console.error('Error updating submission status:', e);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      await deleteEssaySubmissionFromFirestore(submissionId);
      setEssaySubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    } catch (e) {
      console.error('Error deleting submission:', e);
    }
  };

  // Filter and sort articles for feed
  const filteredArticles = useMemo(() => {
    let list = [...localizedArticles];

    if (activeRubricId) {
      list = list.filter((a) => a.rubricId === activeRubricId);
    }

    if (activeTag) {
      list = list.filter((a) => (a.tags || []).includes(activeTag));
    }

    if (activeAuthorName) {
      list = list.filter(
        (a) => a.author?.name?.trim().toLowerCase() === activeAuthorName.trim().toLowerCase()
      );
    }

    // Sorting
    switch (sortBy) {
      case 'popular':
        list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'readTime':
        list.sort((a, b) => (b.readTimeMinutes || 0) - (a.readTimeMinutes || 0));
        break;
      case 'latest':
      default:
        list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
    }

    return list;
  }, [localizedArticles, activeRubricId, activeTag, activeAuthorName, sortBy]);

  // Most recent partially read essay for "Continue Reading" banner
  const continueReadingItem = useMemo(() => {
    const entries = Object.entries(readingProgressMap)
      .filter(([, data]) => data && data.progress >= 8 && data.progress < 95)
      .sort((a, b) => (b[1]?.updatedAt || 0) - (a[1]?.updatedAt || 0));
    if (entries.length === 0) return null;
    const [artId, info] = entries[0];
    const found = localizedArticles.find((a) => a.id === artId);
    if (!found) return null;
    return { article: found, progress: info.progress };
  }, [readingProgressMap, localizedArticles]);

  // Extract all available unique tags dynamically from localized articles
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    localizedArticles.forEach((a) => (a.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).slice(0, 18);
  }, [localizedArticles]);

  // Articles count by rubric
  const articlesCountByRubric = useMemo(() => {
    const map: Record<string, number> = {};
    localizedArticles.forEach((a) => {
      map[a.rubricId] = (map[a.rubricId] || 0) + 1;
    });
    return map;
  }, [localizedArticles]);

  // Самая популярная (по посещаемости) статья за сутки для главного тизера
  const featuredArticle = useMemo(() => {
    if (!localizedArticles || localizedArticles.length === 0) return undefined;
    const sortedByDailyPopularity = [...localizedArticles].sort((a, b) => {
      const dailyDiff = getArticleDailyViews(b) - getArticleDailyViews(a);
      if (dailyDiff !== 0) return dailyDiff;
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    });
    return sortedByDailyPopularity[0];
  }, [localizedArticles]);

  const savedArticlesList = useMemo(() => {
    return localizedArticles.filter((a) => savedArticleIds.includes(a.id));
  }, [localizedArticles, savedArticleIds]);

  // Последние 5 статей для сайтбара открытого лонгрида
  const latestArticles = useMemo(() => {
    return [...localizedArticles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5);
  }, [localizedArticles]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2B241E] dark:bg-[#1A1613] dark:text-[#E8E2D9] selection:bg-[#EBDBC4] selection:text-[#B74D28] dark:selection:bg-[#C85D36]/40 dark:selection:text-[#FAF7F2]">
      {/* Top Navigation */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        onOpenSearch={() => setIsSearchOpen(true)}
        savedCount={savedArticleIds.length}
        onOpenSaved={() => setIsSavedOpen(true)}
        onGoHome={() => {
          clearEssayFromUrl();
          setActiveRubricId(null);
          setActiveTag(null);
          setActiveAuthorName(null);
          setActiveArticleId(null);
          setSortBy('latest');
          setViewMode('feed');
          setIsSearchOpen(false);
          setIsSavedOpen(false);
          setIsAuthOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        fontSize={globalFontSize}
        onFontSizeChange={setGlobalFontSize}
        fontFamily={globalFontFamily}
        onFontFamilyChange={setGlobalFontFamily}
        t={t}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {isLoadingFromFirebase && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4">
            <Loader2 className="w-8 h-8 text-[#C85D36] animate-spin" />
            <p className="text-xs sm:text-sm font-medium text-[#6B625B] dark:text-[#9E9388]">
              Загрузка эссе и публикаций из базы данных...
            </p>
          </div>
        ) : viewMode === 'admin' ? (
          /* Admin View */
          <AdminDashboard
            articles={localizedArticles}
            rubrics={localizedRubrics}
            authors={authors}
            subscribers={subscribers}
            users={users}
            submissions={essaySubmissions}
            currentUser={currentUser}
            onAddArticle={handleAddArticle}
            onUpdateArticle={handleUpdateArticle}
            onDeleteArticle={handleDeleteArticle}
            onDeleteComment={handleDeleteComment}
            onUpdateUserRole={handleUpdateUserRole}
            onUpdateProfile={handleUpdateProfile}
            onReviewArticle={handleReviewArticle}
            onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
            onDeleteSubmission={handleDeleteSubmission}
            onReadArticle={handleReadArticle}
            onExitAdmin={() => {
              clearEssayFromUrl();
              setViewMode('feed');
            }}
          />
        ) : viewMode === 'contacts' || viewMode === 'privacy' || viewMode === 'terms' ? (
          <LegalAndContactsPages
            page={viewMode}
            onBack={() => {
              setViewMode('feed');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigatePage={(targetPage) => {
              setViewMode(targetPage);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSubmitEssay={() => setIsSubmitEssayOpen(true)}
            currentUser={currentUser}
            contactDetails={siteContacts}
            onSaveContactDetails={async (updated) => {
              setSiteContacts(updated);
              await saveSiteContactsToFirestore(updated);
            }}
          />
        ) : viewMode === 'article' && currentArticle ? (
          /* Full Longread Article Reader View with Sidebar */
          <ArticleView
            article={currentArticle}
            rubric={localizedRubrics.find((r) => r.id === currentArticle.rubricId)}
            latestArticles={latestArticles}
            rubrics={localizedRubrics}
            onSelectArticle={handleReadArticle}
            onBack={() => {
              clearEssayFromUrl();
              setViewMode('feed');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRateArticle={handleRateArticle}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
            isSaved={savedArticleIds.includes(currentArticle.id)}
            onToggleSave={toggleSaveArticle}
            onSelectTag={(tag) => {
              clearEssayFromUrl();
              setActiveTag(tag);
              setViewMode('feed');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectAuthor={(authorName) => {
              clearEssayFromUrl();
              setActiveAuthorName(authorName);
              setActiveRubricId(null);
              setActiveTag(null);
              setViewMode('feed');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            t={t}
          />
        ) : (
          /* Reader Main Feed */
          <div>
            {/* Тематические рубрики */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
              <RubricsAndFilters
                rubrics={localizedRubrics}
                activeRubricId={activeRubricId}
                onSelectRubric={setActiveRubricId}
                availableTags={availableTags}
                activeTag={activeTag}
                onSelectTag={setActiveTag}
                sortBy={sortBy}
                onSortChange={setSortBy}
                articlesCountByRubric={articlesCountByRubric}
                t={t}
              />
            </div>

            {/* Главное эссе номера */}
            {!activeTag && !activeRubricId && !activeAuthorName && featuredArticle && (
              <HeroSection
                featuredArticle={featuredArticle}
                onReadArticle={handleReadArticle}
                onSelectAuthor={(authorName) => {
                  setActiveAuthorName(authorName);
                  window.scrollTo({ top: 280, behavior: 'smooth' });
                }}
                totalArticlesCount={localizedArticles.length}
                t={t}
              />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
              {/* Continue Reading Banner */}
              {continueReadingItem && !activeAuthorName && !activeRubricId && !activeTag && (
                <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#C85D36]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#C85D36]/15 text-[#C85D36] flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85D36]">
                          Продолжить чтение • прочитано {continueReadingItem.progress}%
                        </span>
                      </div>
                      <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F1914] dark:text-[#FAF7F2] line-clamp-1">
                        {continueReadingItem.article.title}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleReadArticle(continueReadingItem.article)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#C85D36] text-white hover:bg-[#B34E28] transition-colors cursor-pointer"
                    >
                      Вернуться к эссе
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        try {
                          const next = { ...readingProgressMap };
                          delete next[continueReadingItem.article.id];
                          setReadingProgressMap(next);
                          localStorage.setItem('essay_reading_progress_v1', JSON.stringify(next));
                        } catch {}
                      }}
                      className="p-2 rounded-xl text-[#847970] hover:text-[#1F1914] dark:hover:text-[#FAF7F2] cursor-pointer"
                      title="Скрыть напоминание"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Author Portfolio Card when filtered by Author */}
              {activeAuthorName && (
                <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] shadow-2xs">
                  {(() => {
                    const sampleAuthor =
                      filteredArticles[0]?.author ||
                      localizedArticles.find(
                        (a) => a.author?.name?.toLowerCase() === activeAuthorName.toLowerCase()
                      )?.author;
                    const totalViews = filteredArticles.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
                    return (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                          {sampleAuthor?.avatar && (
                            <img
                              src={sampleAuthor.avatar}
                              alt={activeAuthorName}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#C85D36]"
                            />
                          )}
                          <div>
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C85D36] mb-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              Авторская колонка и портфолио
                            </div>
                            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                              {activeAuthorName}
                            </h3>
                            {sampleAuthor?.role && (
                              <p className="text-xs font-medium text-[#6B625B] dark:text-[#9E9388] mt-0.5">
                                {sampleAuthor.role}
                              </p>
                            )}
                            {sampleAuthor?.bio && (
                              <p className="text-xs sm:text-sm text-[#383028] dark:text-[#D1C7BD] mt-2 max-w-2xl leading-relaxed">
                                {sampleAuthor.bio}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-[#6B625B] dark:text-[#BDAA97]">
                              <span>Опубликовано эссе: {filteredArticles.length}</span>
                              <span>•</span>
                              <span>Всего прочтений: {totalViews.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveAuthorName(null)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] dark:bg-[#1A1613] text-[#1F1914] dark:text-[#FAF7F2] border border-[#E2D3BE] dark:border-[#3D352E] hover:border-[#C85D36] transition-colors cursor-pointer shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                          Все авторы
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Mobile quick filters (visible only on screens < lg so users don't have to scroll) */}
              <div className="block lg:hidden mb-6 p-4 rounded-2xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E]">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F1914] dark:text-[#FAF7F2]">
                    {t.sortBy}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] cursor-pointer"
                  >
                    <option value="latest">{t.sortLatest}</option>
                    <option value="popular">{t.sortPopular}</option>
                    <option value="rating">{t.sortRating}</option>
                    <option value="readTime">{t.sortReadTime}</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  <span className="text-[11px] font-semibold text-[#4A4036] dark:text-[#D1C7BD] shrink-0 mr-1">Темы:</span>
                  {activeTag && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#C85D36] text-white shrink-0">
                      #{activeTag}
                      <button onClick={() => setActiveTag(null)} className="cursor-pointer ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {availableTags.map((tag) => {
                    if (tag === activeTag) return null;
                    return (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FAF7F2] dark:bg-[#1A1613] text-[#1F1914] dark:text-[#FAF7F2] border border-[#E2D3BE] dark:border-[#3D352E] shrink-0 cursor-pointer"
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Articles Grid & Tags Sidebar Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Left Column: Articles Grid (2 columns) */}
                <div className="lg:col-span-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                      {activeAuthorName
                        ? `Эссе автора: ${activeAuthorName}`
                        : activeRubricId
                        ? localizedRubrics.find((r) => r.id === activeRubricId)?.title
                        : activeTag
                        ? `#${activeTag}`
                        : t.allArticles}
                    </h2>
                  </div>

                  {filteredArticles.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E]">
                      <p className="text-base text-[#1F1914] dark:text-[#FAF7F2] font-semibold mb-2">
                        {t.noArticles}
                      </p>
                      <button
                        onClick={() => {
                          setActiveRubricId(null);
                          setActiveTag(null);
                          setActiveAuthorName(null);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C85D36] text-white hover:bg-[#B34E28] cursor-pointer"
                      >
                        {t.resetFilters}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          rubric={localizedRubrics.find((r) => r.id === article.rubricId)}
                          onRead={handleReadArticle}
                          isSaved={savedArticleIds.includes(article.id)}
                          onToggleSave={toggleSaveArticle}
                          onSelectTag={(tag) => {
                            setActiveTag(tag);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          onSelectAuthor={(authorName) => {
                            setActiveAuthorName(authorName);
                            window.scrollTo({ top: 280, behavior: 'smooth' });
                          }}
                          t={t}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column / Sidebar: Desktop Sorting & Expanded 2x Tags Block */}
                <div className="hidden lg:block lg:col-span-4">
                  <div className="p-6 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] shadow-2xs sticky top-24 min-h-[480px] flex flex-col justify-between space-y-6">
                    {/* Upper Section */}
                    <div className="space-y-6">
                      {/* Блок сортировки */}
                      <div>
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2D3BE]/60 dark:border-[#3D352E]">
                          <label htmlFor="article-sort-sidebar-select" className="text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] uppercase tracking-wider">
                            {t.sortBy}
                          </label>
                        </div>
                        <select
                          id="article-sort-sidebar-select"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36] cursor-pointer"
                        >
                          <option value="latest">{t.sortLatest}</option>
                          <option value="popular">{t.sortPopular}</option>
                          <option value="rating">{t.sortRating}</option>
                          <option value="readTime">{t.sortReadTime}</option>
                        </select>
                      </div>

                      {/* Блок тегов - увеличен вертикально в 2 раза */}
                      <div>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E2D3BE]/60 dark:border-[#3D352E]">
                          <Tag className="w-4 h-4 text-[#C85D36]" />
                          <h3 className="text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] uppercase tracking-wider">
                            {t.tags}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {activeTag && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#C85D36] text-white shadow-2xs">
                              #{activeTag}
                              <button
                                onClick={() => setActiveTag(null)}
                                className="hover:opacity-80 p-0.5 cursor-pointer"
                                title="Очистить тег"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          )}

                          {availableTags.map((tag) => {
                            if (tag === activeTag) return null;
                            return (
                              <button
                                key={tag}
                                id={`tag-sidebar-btn-${tag}`}
                                onClick={() => setActiveTag(tag)}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#1F1914] dark:text-[#FAF7F2] bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] hover:border-[#C85D36]/60 hover:text-[#C85D36] dark:hover:text-[#E8A87C] transition-colors cursor-pointer"
                              >
                                #{tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Editorial Accent in the expanded block */}
                    <div className="pt-4 border-t border-[#E2D3BE]/60 dark:border-[#3D352E] text-[11px] text-[#4A4036] dark:text-[#D1C7BD] leading-relaxed italic font-serif">
                      «Эссе — это пространство неспешной мысли, где важен путь рассуждения, а не готовый ответ.»
                    </div>
                  </div>
                </div>
              </div>

              {/* Newsletter Subscription Box */}
              <NewsletterSection
                rubrics={localizedRubrics}
                onSubscribe={handleSubscribe}
                t={t}
              />
            </div>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={localizedArticles}
        rubrics={localizedRubrics}
        onSelectArticle={handleReadArticle}
        t={t}
      />

      <SavedArticlesModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedArticles={savedArticlesList}
        onSelectArticle={handleReadArticle}
        onRemoveSaved={toggleSaveArticle}
        t={t}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(profile) => setCurrentUser(profile)}
      />

      <SubmitEssayModal
        isOpen={isSubmitEssayOpen}
        onClose={() => setIsSubmitEssayOpen(false)}
        rubrics={localizedRubrics}
        currentUser={currentUser}
        t={t}
      />

      {/* Footer with Firebase Status indicator */}
      <Footer
        rubrics={localizedRubrics}
        onSelectRubric={(id) => {
          setActiveRubricId(id);
          setViewMode('feed');
        }}
        onSelectPage={(page) => {
          setViewMode(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSubmitEssay={() => setIsSubmitEssayOpen(true)}
        onOpenAdmin={() => {
          setViewMode('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        t={t}
      />
    </div>
  );
}
