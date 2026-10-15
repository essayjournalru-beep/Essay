import { Article } from '../types';
import { HERO_COVER_PATH } from '../data/seedData';

export function getLocalizedArticle(article: Article): Article {
  return {
    ...article,
    coverImage: article.coverImage || HERO_COVER_PATH,
  };
}
