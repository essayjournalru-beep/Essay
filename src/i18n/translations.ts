export type Language = 'ru';

export interface TranslationDictionary {
  appName: string;
  subtitle: string;
  domainName: string;
  allArticles: string;
  savedArticles: string;
  searchPlaceholder: string;
  login: string;
  logout: string;
  profile: string;
  adminPanel: string;
  writeEssay: string;
  popular: string;
  rating: string;
  readTime: string;
  latest: string;
  readMore: string;
  minutesRead: string;
  views: string;
  comments: string;
  share: string;
  save: string;
  saved: string;
  unsave: string;
  subscribe: string;
  subscribeTitle: string;
  subscribeDesc: string;
  emailPlaceholder: string;
  subscribedSuccess: string;
  commentsTitle: string;
  writeComment: string;
  sendComment: string;
  rateArticle: string;
  author: string;
  tags: string;
  backToFeed: string;
  noArticles: string;
  resetFilters: string;
  search: string;
  allMaterials: string;
  adminManagement: string;
  blog: string;
  mainResearch: string;
  votes: string;
  coverConcept: string;
  expertAuthors: string;
  scientistsAndEngineers: string;
  longreadFormat: string;
  deepAnalysis: string;
  newMaterials: string;
  regularUpdates: string;
  readerRating: string;
  footerDesc: string;
  firebaseConnected: string;
  rubricsTitle: string;
  resetRubricFilter: string;
  editorialTitle: string;
  editorialEthics: string;
  scientificReviewers: string;
  suggestLongread: string;
  copyrightText: string;
  sortBy: string;
  sortLatest: string;
  sortPopular: string;
  sortRating: string;
  sortReadTime: string;
  interestedTopics: string;
  newsletterBadge: string;
  noSpam: string;
  copyLink: string;
  linkCopied: string;
  ratingSubmitted: string;
  alreadyVoted: string;
  yourName: string;
  emailOptional: string;
  reply: string;
  cancel: string;
  sendReply: string;
  editorPick: string;
  verifiedEditor: string;
  readingProgress: string;
  fontSize: string;
  fontSerif: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  ru: {
    appName: 'ЭССЕ',
    subtitle: 'Платформа публикации статей в жанре ЭССЕ',
    domainName: 'essay.ru',
    allArticles: 'Все эссе',
    savedArticles: 'Закладки',
    searchPlaceholder: 'Поиск по эссе, авторам, темам и идеям...',
    login: 'Войти',
    logout: 'Выйти',
    profile: 'Профиль автора',
    adminPanel: 'Редакция',
    writeEssay: 'Написать эссе',
    popular: 'Популярные',
    rating: 'Оценка',
    readTime: 'Время чтения',
    latest: 'Свежие',
    readMore: 'Читать эссе',
    minutesRead: 'мин чтения',
    views: 'просмотров',
    comments: 'комментариев',
    share: 'Поделиться',
    save: 'В закладки',
    saved: 'В закладках',
    unsave: 'Убрать из закладок',
    subscribe: 'Подписаться',
    subscribeTitle: 'Почтовая рассылка «ЭССЕ»',
    subscribeDesc: 'Раз в неделю отправляем дайджест самых глубоких размышлений и авторских текстов номера. Никакого спама.',
    emailPlaceholder: 'Ваш email для связи...',
    subscribedSuccess: 'Вы подписались на еженедельный выпуск эссе!',
    commentsTitle: 'Диалог читателей',
    writeComment: 'Поделитесь вашей мыслью или отзывом на эссе...',
    sendComment: 'Отправить комментарий',
    rateArticle: 'Понравилось ли вам эссе?',
    author: 'Автор эссе',
    tags: 'Темы и идеи',
    backToFeed: '← Ко всем эссе',
    noArticles: 'По заданным параметрам эссе не найдены',
    resetFilters: 'Сбросить фильтры',
    search: 'Поиск',
    allMaterials: 'Все материалы',
    adminManagement: 'Кабинет редакции',
    blog: 'Журнал',
    mainResearch: 'Главное эссе номера',
    votes: 'оценок',
    coverConcept: 'Иллюстрация номера',
    expertAuthors: 'Авторы-эссеисты',
    scientistsAndEngineers: 'Философы, культурологи и писатели',
    longreadFormat: 'Жанр ЭССЕ',
    deepAnalysis: 'Глубокие тексты и личный взгляд',
    newMaterials: 'Свежие размышления',
    regularUpdates: 'Новые публикации каждую неделю',
    readerRating: 'Репутация текстов',
    footerDesc: '«ЭССЕ» — независимая литературно-публицистическая платформа для авторов и читателей, ценящих глубокую мысль, тактильность языка и неторопливый диалог.',
    firebaseConnected: 'База данных и синхронизация подключены',
    rubricsTitle: 'Рубрики',
    resetRubricFilter: 'Все рубрики',
    editorialTitle: 'Редакция',
    editorialEthics: 'Редакционный манифест',
    scientificReviewers: 'Коллегия авторов',
    suggestLongread: 'Предложить своё эссе',
    copyrightText: '© 2026 Издание «ЭССЕ». Все авторские права защищены.',
    sortBy: 'Сортировка:',
    sortLatest: 'Свежие',
    sortPopular: 'Популярные',
    sortRating: 'Высокий рейтинг',
    sortReadTime: 'По хронометражу',
    interestedTopics: 'Интересующие темы:',
    newsletterBadge: 'Еженедельный дайджест',
    noSpam: 'Бережное отношение к вашему времени.',
    copyLink: 'Скопировать ссылку',
    linkCopied: 'Ссылка на эссе скопирована!',
    ratingSubmitted: 'Спасибо за оценку эссе!',
    alreadyVoted: 'Вы уже оценили этот материал',
    yourName: 'Ваше имя',
    emailOptional: 'Email (для уведомлений об ответах)',
    reply: 'Ответить',
    cancel: 'Отмена',
    sendReply: 'Отправить ответ',
    editorPick: 'Выбор редакции',
    verifiedEditor: 'Материал проверен редакцией',
    readingProgress: 'Прочитано',
    fontSize: 'Размер шрифта',
    fontSerif: 'Книжный шрифт',
  },
};
