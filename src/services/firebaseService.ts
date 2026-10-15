import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article, Comment, NewsletterSubscriber, Rubric, Author, UserProfile, UserRole, EssaySubmission, SiteContactDetails } from '../types';
import { HERO_COVER_PATH, INITIAL_ARTICLES, INITIAL_RUBRICS, getImageCopyrightAttribution, getTodayDateKey } from '../data/seedData';

const ARTICLES_COLLECTION = 'articles';
const SUBSCRIBERS_COLLECTION = 'subscribers';
const RUBRICS_COLLECTION = 'rubrics';
const AUTHORS_COLLECTION = 'authors';
const USERS_COLLECTION = 'users';
const ESSAY_SUBMISSIONS_COLLECTION = 'essay_submissions';
const SETTINGS_COLLECTION = 'settings';
const CONTACTS_DOC_ID = 'contacts_info';
const CONTACTS_STORAGE_KEY = 'essay_site_contacts_v2';

export const DEFAULT_SITE_CONTACTS: SiteContactDetails = {
  city: 'Международная редакция',
  address: '',
  legalEntity: 'Издание современной эссеистики «ЭССЕ»',
  binIin: '',
  bankDetails: '',
  email: 'elshan@ozat.kz',
  phone: '',
  telegram: '@essay_editorial',
  workingHours: 'Пн–Пт: 09:00 – 18:00',
};

/**
 * Real-time listener for articles from Firestore
 */
export function subscribeArticles(
  onUpdate: (articles: Article[]) => void,
  onError?: (err: Error) => void
) {
  const articlesRef = collection(db, ARTICLES_COLLECTION);
  return onSnapshot(
    articlesRef,
    (snapshot) => {
      const list: Article[] = [];
      snapshot.forEach((d) => {
        const data = d.data();

        // Defensive mapping to ensure comments and arrays are always valid
        const cleanComments: Comment[] = (data.comments || []).map((c: any) => ({
          id: c.id || `c-${Date.now()}`,
          postId: c.postId || d.id,
          authorName: c.authorName || 'Читатель',
          authorEmail: c.authorEmail || '',
          content: c.content || '',
          createdAt: c.createdAt || 'Недавно',
          likes: typeof c.likes === 'number' ? c.likes : 0,
          replies: (c.replies || []).map((r: any) => ({
            id: r.id || `r-${Date.now()}`,
            postId: r.postId || d.id,
            authorName: r.authorName || 'Читатель',
            authorEmail: r.authorEmail || '',
            content: r.content || '',
            createdAt: r.createdAt || 'Недавно',
            likes: typeof r.likes === 'number' ? r.likes : 0,
          })),
        }));

        const canonical = INITIAL_ARTICLES.find((s) => s.id === d.id);
        const rawSections = Array.isArray(data.sections) && data.sections.length > 0
          ? data.sections
          : canonical?.sections || [];

        // Ensure fallback sections if empty
        const finalSections = rawSections.length > 0 ? rawSections : [
          {
            type: 'paragraph',
            text: data.subtitle || 'Вдумчивое авторское эссе о человеке, культуре и времени.',
          },
          {
            type: 'heading2',
            text: 'Опыт осмысления',
          },
          {
            type: 'paragraph',
            text: 'Размышление над темой раскрывает скрытые связи между личным переживанием и общим движением культуры.',
          },
        ];

        const cleanCover = canonical?.coverImage || data.coverImage || HERO_COVER_PATH;
        const todayKey = getTodayDateKey();
        const rawDailyViews = (data.dailyViews && typeof data.dailyViews === 'object') ? data.dailyViews : {};
        const mergedDailyViews: Record<string, number> = {
          ...(canonical?.dailyViews || {}),
          ...rawDailyViews,
        };
        if (typeof mergedDailyViews[todayKey] !== 'number' && canonical?.dailyViews?.[todayKey]) {
          mergedDailyViews[todayKey] = canonical.dailyViews[todayKey];
        }

        list.push({
          id: d.id,
          slug: data.slug || canonical?.slug || d.id,
          title: data.title || canonical?.title || 'Авторское эссе',
          subtitle: data.subtitle || canonical?.subtitle || '',
          rubricId: data.rubricId || canonical?.rubricId || 'culture',
          tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : (canonical?.tags || ['Культура', 'Эссе']),
          coverImage: cleanCover,
          coverCaption: data.coverCaption || canonical?.coverCaption || '',
          coverSource: data.coverSource || canonical?.coverSource || getImageCopyrightAttribution(cleanCover),
          author: data.author || canonical?.author || {
            id: 'author',
            name: 'Автор',
            role: 'Эссеист',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            bio: '',
            socials: {},
          },
          readTimeMinutes: data.readTimeMinutes || canonical?.readTimeMinutes || 8,
          publishedAt: data.publishedAt || canonical?.publishedAt || new Date().toISOString().split('T')[0],
          viewsCount: typeof data.viewsCount === 'number' ? data.viewsCount : 100,
          dailyViews: mergedDailyViews,
          rating: {
            average: data.rating?.average || canonical?.rating.average || 4.9,
            totalVotes: data.rating?.totalVotes || canonical?.rating.totalVotes || 10,
            userRating: data.rating?.userRating,
          },
          sections: finalSections,
          comments: cleanComments.length > 0 ? cleanComments : (canonical?.comments || []),
          isFeatured: canonical ? canonical.isFeatured : Boolean(data.isFeatured),
          isEditorPick: canonical ? canonical.isEditorPick : Boolean(data.isEditorPick),
          authorProfileId: data.authorProfileId || undefined,
          status: data.status || (data.isReviewedByEditor ? 'reviewed' : 'draft'),
          isReviewedByEditor: Boolean(data.isReviewedByEditor || canonical?.isReviewedByEditor),
          reviewedByEditorId: data.reviewedByEditorId || undefined,
          reviewedByEditorName: data.reviewedByEditorName || 'Редакция ЭССЕ',
          reviewedAt: data.reviewedAt || undefined,
          editorFeedback: data.editorFeedback || undefined,
        });
      });

      // If Firestore is empty or missing canonical literary essays, seed all 10
      if (list.length === 0) {
        INITIAL_ARTICLES.forEach((art) => {
          setDoc(doc(db, ARTICLES_COLLECTION, art.id), art).catch(() => {});
        });
        onUpdate(INITIAL_ARTICLES);
        return;
      }

      // Check if canonical articles (1..10) exist; if not, supplement them
      INITIAL_ARTICLES.forEach((canonicalArt) => {
        const found = list.find((a) => a.id === canonicalArt.id);
        if (!found) {
          list.push(canonicalArt);
          setDoc(doc(db, ARTICLES_COLLECTION, canonicalArt.id), canonicalArt).catch(() => {});
        }
      });

      // Sort by publish date
      list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      onUpdate(list);
    },
    (err) => {
      console.error('Firestore onSnapshot error for articles:', err);
      onError?.(err);
    }
  );
}

/**
 * Real-time listener for rubrics from Firestore
 */
export function subscribeRubrics(
  onUpdate: (rubrics: Rubric[]) => void,
  onError?: (err: Error) => void
) {
  const rubricsRef = collection(db, RUBRICS_COLLECTION);
  return onSnapshot(
    rubricsRef,
    (snapshot) => {
      const list: Rubric[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          slug: data.slug || d.id,
          title: data.title || '',
          description: data.description || '',
          color: data.color || 'terracotta',
          iconName: data.iconName || 'Palette',
        });
      });

      if (list.length === 0) {
        INITIAL_RUBRICS.forEach((r) => {
          setDoc(doc(db, RUBRICS_COLLECTION, r.id), r).catch(() => {});
        });
        onUpdate(INITIAL_RUBRICS);
        return;
      }

      // Check if canonical rubrics exist; if not, supplement them
      INITIAL_RUBRICS.forEach((canonicalRubric) => {
        const found = list.find((r) => r.id === canonicalRubric.id);
        if (!found) {
          list.push(canonicalRubric);
          setDoc(doc(db, RUBRICS_COLLECTION, canonicalRubric.id), canonicalRubric).catch(() => {});
        }
      });

      onUpdate(list);
    },
    (err) => {
      console.error('Firestore onSnapshot error for rubrics:', err);
      onUpdate(INITIAL_RUBRICS);
      onError?.(err);
    }
  );
}

/**
 * Real-time listener for authors from Firestore
 */
export function subscribeAuthors(
  onUpdate: (authors: Author[]) => void,
  onError?: (err: Error) => void
) {
  const authorsRef = collection(db, AUTHORS_COLLECTION);
  return onSnapshot(
    authorsRef,
    (snapshot) => {
      const list: Author[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        const avatar = data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=240';
        const name = data.name || 'Эссеист';
        list.push({
          id: d.id,
          name,
          role: data.role || 'Колумнист',
          avatar,
          bio: data.bio || '',
          socials: data.socials || {},
        });
      });
      onUpdate(list);
    },
    (err) => {
      console.error('Firestore onSnapshot error for authors:', err);
      onError?.(err);
    }
  );
}

export function getSubscriberDocId(email: string): string {
  return `sub-${email.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '_')}`;
}

/**
 * Real-time listener for newsletter subscribers from Firestore (with automatic deduplication)
 */
export function subscribeSubscribers(
  onUpdate: (subs: NewsletterSubscriber[]) => void,
  onError?: (err: Error) => void
) {
  const subsRef = collection(db, SUBSCRIBERS_COLLECTION);
  return onSnapshot(
    subsRef,
    (snapshot) => {
      const uniqueByEmail = new Map<string, NewsletterSubscriber>();

      snapshot.forEach((d) => {
        const data = d.data();
        const rawEmail = typeof data.email === 'string' ? data.email.trim() : '';
        if (!rawEmail || !rawEmail.includes('@')) {
          deleteDoc(doc(db, SUBSCRIBERS_COLLECTION, d.id)).catch(() => {});
          return;
        }

        const emailKey = rawEmail.toLowerCase();
        const incomingTopics = Array.isArray(data.topics) ? data.topics : [];
        const subscribedAt = data.subscribedAt || new Date().toISOString().split('T')[0];

        const existing = uniqueByEmail.get(emailKey);
        if (existing) {
          // Merge topics if needed and remove the duplicate document from Firestore
          const mergedTopics = Array.from(new Set([...existing.topics, ...incomingTopics]));
          existing.topics = mergedTopics;
          deleteDoc(doc(db, SUBSCRIBERS_COLLECTION, d.id)).catch(() => {});
          setDoc(doc(db, SUBSCRIBERS_COLLECTION, existing.id), existing, { merge: true }).catch(() => {});
        } else {
          uniqueByEmail.set(emailKey, {
            id: d.id,
            email: emailKey,
            subscribedAt,
            topics: incomingTopics,
          });
        }
      });

      const list = Array.from(uniqueByEmail.values()).sort(
        (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
      );
      onUpdate(list);
    },
    (err) => {
      console.error('Firestore onSnapshot error for subscribers:', err);
      onError?.(err);
    }
  );
}

/**
 * Add comment to Firestore article
 */
export async function addCommentToFirestore(
  articleId: string,
  currentComments: Comment[],
  newComment: Comment,
  parentCommentId?: string
) {
  const safeComments = currentComments || [];
  let updatedComments: Comment[];

  if (parentCommentId) {
    updatedComments = safeComments.map((c) => {
      if (c.id === parentCommentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newComment],
        };
      }
      return c;
    });
  } else {
    updatedComments = [newComment, ...safeComments];
  }

  const artRef = doc(db, ARTICLES_COLLECTION, articleId);
  await setDoc(
    artRef,
    {
      comments: updatedComments,
    },
    { merge: true }
  );

  return updatedComments;
}

/**
 * Like a comment in Firestore
 */
export async function likeCommentInFirestore(
  articleId: string,
  currentComments: Comment[],
  commentId: string
) {
  const safeComments = currentComments || [];
  const updatedComments = safeComments.map((c) => {
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

  const artRef = doc(db, ARTICLES_COLLECTION, articleId);
  await setDoc(
    artRef,
    {
      comments: updatedComments,
    },
    { merge: true }
  );

  return updatedComments;
}

/**
 * Delete a comment in Firestore
 */
export async function deleteCommentInFirestore(
  articleId: string,
  currentComments: Comment[],
  commentId: string
) {
  const safeComments = currentComments || [];
  const updatedComments = safeComments
    .filter((c) => c.id !== commentId)
    .map((c) => ({
      ...c,
      replies: (c.replies || []).filter((r) => r.id !== commentId),
    }));

  const artRef = doc(db, ARTICLES_COLLECTION, articleId);
  await setDoc(
    artRef,
    {
      comments: updatedComments,
    },
    { merge: true }
  );

  return updatedComments;
}

/**
 * Rate an article in Firestore
 */
export async function rateArticleInFirestore(
  articleId: string,
  currentAverage: number,
  currentTotal: number,
  newRatingValue: number,
  existingUserRating?: number
) {
  let newTotal = currentTotal || 0;
  const currentSum = (currentAverage || 5) * newTotal;
  let newAvg = 5;

  if (existingUserRating !== undefined && existingUserRating !== null) {
    newAvg = parseFloat(((currentSum - existingUserRating + newRatingValue) / (newTotal || 1)).toFixed(2));
  } else {
    newTotal = newTotal + 1;
    newAvg = parseFloat(((currentSum + newRatingValue) / newTotal).toFixed(2));
  }

  const artRef = doc(db, ARTICLES_COLLECTION, articleId);
  await setDoc(
    artRef,
    {
      rating: {
        average: newAvg,
        totalVotes: newTotal,
      },
    },
    { merge: true }
  );

  return { average: newAvg, totalVotes: newTotal };
}

/**
 * Increment article views in Firestore (both total and daily 24h counter)
 */
export async function incrementArticleViews(
  articleId: string,
  currentViews: number,
  currentDailyViews?: Record<string, number>
) {
  try {
    const todayKey = getTodayDateKey();
    const nextDailyCount = ((currentDailyViews && currentDailyViews[todayKey]) || 0) + 1;
    const artRef = doc(db, ARTICLES_COLLECTION, articleId);
    await setDoc(
      artRef,
      {
        viewsCount: (currentViews || 0) + 1,
        dailyViews: {
          ...(currentDailyViews || {}),
          [todayKey]: nextDailyCount,
        },
      },
      { merge: true }
    );
  } catch (e) {
    console.error('Error incrementing views:', e);
  }
}

/**
 * Save (create or update) article in Firestore
 */
export async function saveArticleToFirestore(article: Article) {
  const artRef = doc(db, ARTICLES_COLLECTION, article.id);
  const cleanComments = (article.comments || []).map((c) => ({
    ...c,
    replies: c.replies || [],
  }));

  await setDoc(
    artRef,
    {
      ...article,
      comments: cleanComments,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Delete article from Firestore
 */
export async function deleteArticleFromFirestore(articleId: string) {
  const artRef = doc(db, ARTICLES_COLLECTION, articleId);
  await deleteDoc(artRef);
}

/**
 * Save or update subscriber in Firestore without creating duplicate emails
 */
export async function saveSubscriberToFirestore(subscriber: NewsletterSubscriber) {
  const normalizedEmail = subscriber.email.trim().toLowerCase();
  const subsRef = collection(db, SUBSCRIBERS_COLLECTION);
  const snap = await getDocs(subsRef);

  let targetDocId = getSubscriberDocId(normalizedEmail);
  let existingSubscribedAt = subscriber.subscribedAt;

  for (const d of snap.docs) {
    const data = d.data();
    if (typeof data.email === 'string' && data.email.trim().toLowerCase() === normalizedEmail) {
      if (targetDocId === getSubscriberDocId(normalizedEmail) && d.id !== targetDocId) {
        targetDocId = d.id;
        existingSubscribedAt = data.subscribedAt || existingSubscribedAt;
      } else if (d.id !== targetDocId) {
        await deleteDoc(doc(db, SUBSCRIBERS_COLLECTION, d.id)).catch(() => {});
      }
    }
  }

  const subRef = doc(db, SUBSCRIBERS_COLLECTION, targetDocId);
  await setDoc(
    subRef,
    {
      id: targetDocId,
      email: normalizedEmail,
      subscribedAt: existingSubscribedAt,
      topics: subscriber.topics,
    },
    { merge: true }
  );
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

/**
 * Save or update user profile in Firestore
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, profile.id);
  await setDoc(userRef, profile, { merge: true });
}

/**
 * Update user role in Firestore
 */
export async function updateUserRoleInFirestore(uid: string, newRole: UserRole): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, { role: newRole });
}

/**
 * Real-time listener for users collection
 */
export function subscribeUsers(
  onUpdate: (users: UserProfile[]) => void,
  onError?: (err: Error) => void
) {
  const usersRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          email: data.email || '',
          name: data.name || 'Пользователь',
          role: data.role || 'reader',
          avatar: data.avatar || '',
          bio: data.bio || '',
          specialization: data.specialization || '',
          socials: data.socials || {},
          savedArticleIds: Array.isArray(data.savedArticleIds) ? data.savedArticleIds : undefined,
          createdAt: data.createdAt || new Date().toISOString().split('T')[0],
        });
      });
      onUpdate(list);
    },
    (err) => {
      console.error('Firestore users onSnapshot error:', err);
      onError?.(err);
    }
  );
}

/**
 * Editorial Review Action: Mark article as reviewed/approved by editor or return to author for revision/correction
 */
export async function reviewArticleInFirestore(
  articleId: string,
  editorProfile: { id: string; name: string },
  isReviewed: boolean,
  feedback?: string,
  nextStatus?: 'draft' | 'pending_review' | 'revision_requested' | 'reviewed'
) {
  const artRef = doc(db, ARTICLES_COLLECTION, articleId);
  await updateDoc(artRef, {
    isReviewedByEditor: isReviewed,
    status: nextStatus || (isReviewed ? 'reviewed' : 'revision_requested'),
    reviewedByEditorId: editorProfile.id,
    reviewedByEditorName: editorProfile.name,
    reviewedAt: isReviewed ? new Date().toISOString() : null,
    editorFeedback: feedback !== undefined ? feedback : '',
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Submit an essay proposal to the editorial board
 */
export async function submitEssayProposal(
  proposal: Omit<EssaySubmission, 'id' | 'submittedAt' | 'status'>,
  userId?: string
): Promise<string> {
  const submissionId = `submission-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const submissionData: EssaySubmission = {
    ...proposal,
    id: submissionId,
    submittedAt: new Date().toISOString(),
    status: 'pending',
    userId: userId || '',
  };
  await setDoc(doc(db, ESSAY_SUBMISSIONS_COLLECTION, submissionId), submissionData);
  return submissionId;
}

/**
 * Real-time listener for essay submissions (for editors and admin)
 */
export function subscribeEssaySubmissions(
  onUpdate: (submissions: EssaySubmission[]) => void,
  onError?: (err: Error) => void
) {
  const subRef = collection(db, ESSAY_SUBMISSIONS_COLLECTION);
  return onSnapshot(
    subRef,
    (snapshot) => {
      const list: EssaySubmission[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as EssaySubmission);
      });
      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      onUpdate(list);
    },
    (err) => {
      console.error('Firestore submissions onSnapshot error:', err);
      onError?.(err);
    }
  );
}

/**
 * Update status and editor notes of an essay submission
 */
export async function updateEssaySubmissionInFirestore(
  submissionId: string,
  status: EssaySubmission['status'],
  editorNotes?: string
): Promise<void> {
  const subRef = doc(db, ESSAY_SUBMISSIONS_COLLECTION, submissionId);
  await setDoc(
    subRef,
    {
      status,
      ...(editorNotes !== undefined ? { editorNotes } : {}),
    },
    { merge: true }
  );
}

/**
 * Delete an essay submission
 */
export async function deleteEssaySubmissionFromFirestore(submissionId: string): Promise<void> {
  const subRef = doc(db, ESSAY_SUBMISSIONS_COLLECTION, submissionId);
  await deleteDoc(subRef);
}

/**
 * Subscribe to site contact details & legal requisites (editable by owner)
 */
export function subscribeSiteContacts(
  onUpdate: (contacts: SiteContactDetails) => void
) {
  try {
    const cached = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      onUpdate({ ...DEFAULT_SITE_CONTACTS, ...parsed });
    }
  } catch {
    // ignore localStorage error
  }

  const docRef = doc(db, SETTINGS_COLLECTION, CONTACTS_DOC_ID);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<SiteContactDetails>;
        const merged: SiteContactDetails = {
          ...DEFAULT_SITE_CONTACTS,
          ...data,
        };
        try {
          localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore
        }
        onUpdate(merged);
      } else {
        onUpdate(DEFAULT_SITE_CONTACTS);
      }
    },
    (err) => {
      console.warn('Firestore site contacts subscription fallback:', err);
    }
  );
}

/**
 * Save site contact details & legal requisites (by site owner)
 */
export async function saveSiteContactsToFirestore(contacts: SiteContactDetails): Promise<void> {
  const payload: SiteContactDetails = {
    ...contacts,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
  const docRef = doc(db, SETTINGS_COLLECTION, CONTACTS_DOC_ID);
  await setDoc(docRef, payload, { merge: true });
}

