export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  socials: {
    telegram?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

export interface Rubric {
  id: string;
  slug: string;
  title: string;
  description: string;
  color: string; // e.g. emerald, teal, amber, sky, lime
  iconName: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
  replies?: Comment[];
}

export interface ArticleSection {
  type: 'paragraph' | 'heading2' | 'heading3' | 'callout' | 'quote' | 'image' | 'key-takeaways' | 'stat-grid';
  text?: string;
  authorQuote?: string;
  quoteSource?: string;
  imageUrl?: string;
  imageCaption?: string;
  imageSource?: string;
  items?: string[];
  stats?: { value: string; label: string; subtext?: string }[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  rubricId: string;
  tags: string[];
  coverImage: string;
  coverCaption?: string;
  coverSource?: string;
  author: Author;
  authorProfileId?: string; // Links to author UserProfile ID
  readTimeMinutes: number;
  publishedAt: string;
  updatedAt?: string;
  sections: ArticleSection[];
  viewsCount: number;
  dailyViews?: Record<string, number>;
  rating: {
    average: number;
    totalVotes: number;
    userRating?: number;
  };
  comments: Comment[];
  isFeatured?: boolean;
  isEditorPick?: boolean;
  // Editorial workflow & approval fields
  status?: 'draft' | 'pending_review' | 'revision_requested' | 'reviewed';
  isReviewedByEditor?: boolean;
  reviewedByEditorId?: string;
  reviewedByEditorName?: string;
  reviewedAt?: string;
  editorFeedback?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  topics: string[];
}

export type ThemeMode = 'light' | 'dark';
export type ViewMode = 'feed' | 'article' | 'admin' | 'contacts' | 'privacy' | 'terms';
export type ReaderFont = 'literata' | 'merriweather' | 'sans';
export type ReaderFontSize = 'normal' | 'large' | 'xlarge';

export interface SiteContactDetails {
  city: string;
  address: string;
  legalEntity: string;
  binIin: string;
  bankDetails: string;
  email: string;
  phone: string;
  telegram: string;
  workingHours: string;
  updatedAt?: string;
}

export type UserRole = 'owner' | 'admin' | 'editor' | 'author' | 'reader';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  specialization?: string;
  socials?: {
    telegram?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  savedArticleIds?: string[];
  createdAt: string;
}

export interface EssaySubmission {
  id: string;
  authorName: string;
  authorEmail: string;
  authorContact?: string;
  title: string;
  rubricId: string;
  synopsis: string;
  content: string;
  tags: string[];
  submittedAt: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'declined';
  editorNotes?: string;
  userId?: string;
}
