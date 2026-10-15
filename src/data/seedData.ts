import { Article, Author, Rubric } from '../types';

export const HERO_COVER_PATH = '/essaymeta.jpeg';

export function getTodayDateKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getArticleDailyViews(article: Article): number {
  const todayKey = getTodayDateKey();
  if (article.dailyViews && typeof article.dailyViews[todayKey] === 'number') {
    return article.dailyViews[todayKey];
  }
  return 0;
}

export function getImageCopyrightAttribution(imageUrl?: string, explicitSource?: string): string {
  if (explicitSource && explicitSource.trim().length > 0) {
    return explicitSource.trim();
  }
  if (!imageUrl) {
    return 'Фото: Unsplash (Unsplash License)';
  }
  const url = imageUrl.toLowerCase();
  if (url.includes('1517842645767')) return 'Фото: Thomas Lefebvre / Unsplash (Unsplash License)';
  if (url.includes('1501339847302')) return 'Фото: Nathan Dumlao / Unsplash (Unsplash License)';
  if (url.includes('1589829085413')) return 'Фото: Tingey Injury Law Firm / Unsplash (Unsplash License)';
  if (url.includes('1513694203232')) return 'Фото: Sidekix Media / Unsplash (Unsplash License)';
  if (url.includes('1457369804613')) return 'Фото: Patrick Tomasso / Unsplash (Unsplash License)';
  if (url.includes('1506703719100')) return 'Фото: NASA & Unsplash (Public Domain / Unsplash License)';
  if (url.includes('1489599849927')) return 'Фото: Felix Mooneeram / Unsplash (Unsplash License)';
  if (url.includes('1477959858617')) return 'Фото: Pedro Lastra / Unsplash (Unsplash License)';
  if (url.includes('1455390582262')) return 'Фото: Aaron Burden / Unsplash (Unsplash License)';
  if (url.includes('1511671782779')) return 'Фото: Caught In Joy / Unsplash (Unsplash License)';
  if (url.includes('images.unsplash.com')) return 'Фото: Коллекция Unsplash (Свободная лицензия Unsplash)';
  if (url.includes('essaymeta') || url.startsWith('/')) return 'Иллюстрация: Редакция «ЭССЕ»';
  try {
    const parsed = new URL(imageUrl);
    return `Источник: ${parsed.hostname.replace(/^www\./, '')}`;
  } catch {
    return 'Иллюстрация: Архив редакции «ЭССЕ»';
  }
}

export const DEFAULT_AUTHORS: Author[] = [
  {
    id: 'author-1',
    name: 'Анна Раевская',
    role: 'Культуролог & Эссеист',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=240',
    bio: 'Исследователь визуальной антропологии, автор циклов эссе о кинематографе памяти и культуре повседневности.',
    socials: { telegram: '@raevskaya_notes', website: 'https://essay.ru/authors/raevskaya' },
  },
  {
    id: 'author-2',
    name: 'Михаил Соколовский',
    role: 'Философ & Колумнист',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240',
    bio: 'Преподаватель философской антропологии. Пишет о границах человеческого, экзистенциальном одиночестве и тишине.',
    socials: { telegram: '@sokolovsky_phil', twitter: '@m_sokolovsky' },
  },
  {
    id: 'author-3',
    name: 'Дарья Левина',
    role: 'Урбанист & Архитектурный критик',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240',
    bio: 'Изучает феномен «медленного города» (Cittaslow), психогеографию спальных районов и память архитектурных форм.',
    socials: { telegram: '@slow_city_notes', linkedin: 'daria-levina-urban' },
  },
  {
    id: 'author-4',
    name: 'Илья Чернышев',
    role: 'Когнитивист & Автор лонгридов',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=240',
    bio: 'Исследует влияние цифровой среды на глубину человеческого мышления, структуру внимания и писательское ремесло.',
    socials: { telegram: '@chernyshev_cognition', website: 'https://essay.ru/authors/chernyshev' },
  },
];

export const INITIAL_RUBRICS: Rubric[] = [
  {
    id: 'culture',
    slug: 'culture',
    title: 'Культура & Арт',
    description: 'Кинематограф, театр, визуальные коды, ностальгия и современное искусство.',
    color: 'terracotta',
    iconName: 'Palette',
  },
  {
    id: 'philosophy',
    slug: 'philosophy',
    title: 'Человек & Смысл',
    description: 'Экзистенциальные вопросы, одиночество, память, время и искусство диалога.',
    color: 'amber',
    iconName: 'Lightbulb',
  },
  {
    id: 'society',
    slug: 'society',
    title: 'Город & Общество',
    description: 'Урбанистика, психогеография, медленная жизнь (slow living) и дух мест.',
    color: 'emerald',
    iconName: 'Landmark',
  },
  {
    id: 'technology',
    slug: 'technology',
    title: 'Разум & Технологии',
    description: 'Искусственный интеллект, фрагментация внимания и будущее человеческого слова.',
    color: 'sky',
    iconName: 'Cpu',
  },
  {
    id: 'books',
    slug: 'books',
    title: 'Книги & Тексты',
    description: 'Литературные опыты, перечитывание классики, искусство медленного чтения.',
    color: 'stone',
    iconName: 'BookOpen',
  },
  {
    id: 'science',
    slug: 'science',
    title: 'Познание & Космос',
    description: 'Тайны сознания, масштаб Вселенной и фундаментальные загадки природы.',
    color: 'indigo',
    iconName: 'Telescope',
  },
];

export const DEFAULT_RUBRICS = INITIAL_RUBRICS;

export const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'anatomiya-nostalgii',
    title: 'Анатомия ностальгии: почему мы тоскуем по эпохам, в которых никогда не жили',
    subtitle: 'Феномен «анемои» в современной культуре: как аналоговый треск винила, зернистая пленка и теплый свет настольной лампы стали убежищем от гиперскоростного века.',
    rubricId: 'culture',
    tags: ['Культура', 'Ностальгия', 'Кинематограф', 'Психология', 'Эстетика'],
    coverImage: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1200',
    coverCaption: 'Винтажный деревянный стол у окна с чашкой кофе и блокнотом — атмосфера уединения и неспешных записей',
    coverSource: 'Фото: Thomas Lefebvre / Unsplash (Unsplash License)',
    author: DEFAULT_AUTHORS[0],
    readTimeMinutes: 8,
    publishedAt: '2026-09-28',
    viewsCount: 3840,
    dailyViews: { [getTodayDateKey()]: 285 },
    rating: {
      average: 4.9,
      totalVotes: 64,
    },
    isFeatured: true,
    isEditorPick: true,
    isReviewedByEditor: true,
    status: 'reviewed',
    reviewedByEditorName: 'Редакция ЭССЕ',
    sections: [
      {
        type: 'callout',
        text: '«Ностальгия — это не просто слабость памяти, обращенная вспять. Это инстинктивная попытка души защититься от безжалостного ускорения настоящего момента».',
      },
      {
        type: 'paragraph',
        text: 'В последние годы все больше молодых людей, родившихся уже в эпоху широкополосного интернета, испытывают острую нежность к вещам, существовавшим задолго до их рождения. Пленочные камеры, тяжелые стеклянные пепельницы на деревянных столах, шипение кассетной магнитной ленты и мягкий полумрак кофеен середины XX века обрели статус высшей эмоциональной ценности.',
      },
      {
        type: 'heading2',
        text: 'Анемоя: тоска по чужому прошлому',
      },
      {
        type: 'paragraph',
        text: 'В словаре редких печалей есть термин anemoia — щемящая тоска по времени, свидетелем которого ты не был. Мы смотрим старые фильмы Вуди Аллена или Ричарда Линклейтера и ощущаем, что мир тех лет обладал осязаемой плотностью. В нем телефонный звонок требовал ожидания у аппарата, письмо шло две недели, а разговор за чашкой кофе не прерывался вибрацией умных часов в каждые тридцать секунд.',
      },
      {
        type: 'quote',
        authorQuote: 'Андрей Тарковский',
        quoteSource: '«Запечатленное время», 1986',
        text: 'Время необходимо человеку, чтобы, воплотившись, он мог состояться как личность. Потеря чувства времени ведет к распаду внутреннего пространства.',
      },
      {
        type: 'heading2',
        text: 'Тактильное сопротивление цифровому шуму',
      },
      {
        type: 'paragraph',
        text: 'Бумажная страница в блокноте сопротивляется перу. Чернила сохнут неравномерно, оставляя микроскопические следы настроения писавшего. Эта физическая шероховатость жизни — именно то, чего лишен гладкий холодный дисплей смартфона. Наше возвращение к эссеистике, к длинным связным текстам — это попытка вернуть себе право на неторопливую мысль, рожденную из тишины.',
      },
      {
        type: 'key-takeaways',
        items: [
          'Ностальгия сегодня служит инструментом ментальной саморегуляции против информационной перегрузки.',
          'Тяга к аналоговым артефактам возвращает человеку утраченный контакт с физической реальностью.',
          'Жанр эссе становится убежищем для медленного мышления, где важен не быстрый вывод, а сам путь рассуждения.',
        ],
      },
    ],
    comments: [
      {
        id: 'c1',
        postId: '1',
        authorName: 'Виктор Громов',
        authorEmail: 'gromov@inbox.ru',
        content: 'Потрясающее эссе! Будто заглянул в собственные мысли за чашкой утреннего кофе. Именно этой плотности и тишины сейчас не хватает.',
        createdAt: '2026-09-29T10:14:00Z',
        likes: 12,
      },
      {
        id: 'c2',
        postId: '1',
        authorName: 'Мария Вересова',
        authorEmail: 'm.veresova@mail.ru',
        content: 'Цитата Тарковского про время попала в самое сердце. Спасибо редакции «ЭССЕ» за такой вдумчивый тон материалов!',
        createdAt: '2026-09-29T14:30:00Z',
        likes: 8,
      },
    ],
  },
  {
    id: '2',
    slug: 'iskusstvo-odinochestva-v-megapolise',
    title: 'Искусство одиночества в многомиллионном городе: между изоляцией и свободой',
    subtitle: 'Почему способность оставаться наедине с собой в гудящем мегаполисе — высшая форма внутренней зрелости, а не социальное поражение.',
    rubricId: 'philosophy',
    tags: ['Философия', 'Человек', 'Одиночество', 'Психология', 'Мегаполис'],
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200',
    coverCaption: 'Утренний свет сквозь окно кофейни и безмолвный диалог с самим собой',
    coverSource: 'Фото: Nathan Dumlao / Unsplash (Unsplash License)',
    author: DEFAULT_AUTHORS[1],
    readTimeMinutes: 7,
    publishedAt: '2026-09-26',
    viewsCount: 2910,
    dailyViews: { [getTodayDateKey()]: 190 },
    rating: {
      average: 4.8,
      totalVotes: 49,
    },
    isFeatured: true,
    isEditorPick: true,
    isReviewedByEditor: true,
    status: 'reviewed',
    reviewedByEditorName: 'Редакция ЭССЕ',
    sections: [
      {
        type: 'paragraph',
        text: 'Город никогда не спит, но это не значит, что мы обязаны бодрствовать вместе с ним. В вагонах метро, переполненных сотнями людей, в бесконечных очередях за плоским белым кофе мы окружены телами, но предельно изолированы в собственных наушниках. И все же существует гигантская разница между мучительной покинутостью (loneliness) и плодотворным уединением (solitude).',
      },
      {
        type: 'heading2',
        text: 'Две стороны тишины',
      },
      {
        type: 'paragraph',
        text: 'Плодотворное уединение — это встреча с интересным собеседником: с самим собой, освобожденным от необходимости играть социальные роли, оправдывать чужие ожидания и немедленно отвечать на входящие уведомления.',
      },
      {
        type: 'quote',
        authorQuote: 'Мишель де Монтень',
        quoteSource: '«Опыты», 1580',
        text: 'Нужно иметь укромный уголок, принадлежащий только нам, совершенно свободный, где мы могли бы устроить наше истинное убежище и уединение.',
      },
    ],
    comments: [],
  },
  {
    id: '3',
    slug: 'prizrak-avtora-v-epohu-ai',
    title: 'Призрак автора в эпоху нейросетей: останется ли место человеческой боли в литературе?',
    subtitle: 'Алгоритмы научились безупречно имитировать стиль, рифму и фабулу. Но способны ли они передать опыт смертности, раскаяния и искренней любви?',
    rubricId: 'technology',
    tags: ['Технологии', 'Искусственный интеллект', 'Литература', 'Мышление', 'Будущее'],
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1200',
    coverCaption: 'Концептуальный визуальный образ мысли и пера, струящийся свет над рукописью и граница авторского слова',
    coverSource: 'Фото: Tingey Injury Law Firm / Unsplash (Unsplash License)',
    author: DEFAULT_AUTHORS[3],
    readTimeMinutes: 11,
    publishedAt: '2026-09-24',
    viewsCount: 4230,
    dailyViews: { [getTodayDateKey()]: 340 },
    rating: {
      average: 4.95,
      totalVotes: 73,
    },
    isFeatured: true,
    isEditorPick: true,
    isReviewedByEditor: true,
    status: 'reviewed',
    reviewedByEditorName: 'Редакция ЭССЕ',
    sections: [
      {
        type: 'paragraph',
        text: 'Когда языковая модель выдает безукоризненное четверостишие или стилизует текст под Достоевского, читатель испытывает легкий холодок. Машина перебрала миллионы томов и безошибочно вычислила статистически наиболее вероятное следующее слово. Но почему от этого совершенства так часто веет пустотой?',
      },
      {
        type: 'heading2',
        text: 'Текст как след пережитого страдания',
      },
      {
        type: 'paragraph',
        text: 'Настоящее эссе всегда уязвимо. Автор рискует оказаться смешным, наивным или неправым. Именно эта уязвимость рождает доверие читателя. Нейросеть не может рисковать, потому что у нее нет тела, нет страха смерти, нет памяти о потерянной первой любви. Она не чувствует запаха дождя на нагретом асфальте — она лишь знает частотность употребления этих слов.',
      },
    ],
    comments: [],
  },
  {
    id: '4',
    slug: 'geniy-mesta-urbanistika-chuvstv',
    title: 'Гений места: почему одни улицы исцеляют, а другие опустошают',
    subtitle: 'Психогеография города: как масштабы зданий, фактура кирпича, шелест листвы и ширина тротуаров незаметно лепят наше ежедневное настроение.',
    rubricId: 'society',
    tags: ['Город', 'Урбанистика', 'Психогеография', 'Архитектура', 'Среда'],
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200',
    coverCaption: 'Фактурные европейские переулки, каменная кладка и тёплая игра архитектурного света',
    coverSource: 'Фото: Sidekix Media / Unsplash (Unsplash License)',
    author: DEFAULT_AUTHORS[2],
    readTimeMinutes: 6,
    publishedAt: '2026-09-22',
    viewsCount: 1890,
    dailyViews: { [getTodayDateKey()]: 115 },
    rating: {
      average: 4.7,
      totalVotes: 32,
    },
    isFeatured: false,
    isEditorPick: false,
    isReviewedByEditor: true,
    status: 'reviewed',
    sections: [
      {
        type: 'paragraph',
        text: 'Римляне верили, что у каждого уголка земли есть свой genius loci — дух-покровитель. Сегодня урбанисты называют это средовым кодом. Пройдитесь по безликому спальному району с тридцатиэтажными гигантами, где ветер сбивает с ног на пустырях, а затем сверните в кривой переулок старого центра с невысокими домами и коваными фонарями. Ваш сердечный ритм замедлится сам собой.',
      },
    ],
    comments: [],
  },
  {
    id: '5',
    slug: 'zachem-perechityvat-klassiku-posle-tridtsati',
    title: 'Зачем перечитывать классику после тридцати: опыт взрослого прозрения',
    subtitle: 'Школьная программа прививает стойкую аллергию на великие тексты. Но что происходит, когда открываешь «Анну Каренину» или «Преступление и наказание» с грузом личных потерь?',
    rubricId: 'books',
    tags: ['Книги', 'Литература', 'Классика', 'Чтение', 'Смысл'],
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200',
    coverCaption: 'Потертый корешок книги и запах старой типографской бумаги',
    coverSource: 'Фото: Patrick Tomasso / Unsplash (Unsplash License)',
    author: DEFAULT_AUTHORS[0],
    readTimeMinutes: 9,
    publishedAt: '2026-09-18',
    viewsCount: 3120,
    dailyViews: { [getTodayDateKey()]: 210 },
    rating: {
      average: 4.88,
      totalVotes: 51,
    },
    isFeatured: false,
    isEditorPick: true,
    isReviewedByEditor: true,
    status: 'reviewed',
    sections: [
      {
        type: 'callout',
        text: '«Классика — это не то, что нужно читать из чувства школьного долга. Это книги, которые начинают говорить с нами только тогда, когда мы сами накопили достаточно собственных шрамов и вопросов».',
      },
      {
        type: 'paragraph',
        text: 'В шестнадцать лет мы искали в романах приключений и романтического пафоса. Раскольников казался героем идеи, Наташа Ростова — ветреной девчонкой. Но в тридцать пять лет, когда за плечами есть опыт собственных ошибок, потерь и тяжелых компромиссов с совестью, эти же книги начинают звучать оглушительно правдиво.',
      },
      {
        type: 'heading2',
        text: 'Книга как зеркало возраста',
      },
      {
        type: 'paragraph',
        text: 'Текст классического романа не меняется со временем, но меняется угол нашего зрения. В зрелом возрасте в «Анне Карениной» начинаешь замечать не драму страсти, а глубокую боль Каренина, хрупкость семейного уклада Левина и трагедию человека, не способного совладать с собственным эгоизмом.',
      },
      {
        type: 'quote',
        authorQuote: 'Итало Кальвино',
        quoteSource: '«Зачем читать классиков», 1991',
        text: 'Классика — это книга, которая никогда не заканчивает говорить то, что она должна сказать.',
      },
      {
        type: 'heading2',
        text: 'Освобождение от догмы',
      },
      {
        type: 'paragraph',
        text: 'Только сбросив груз школьных хрестоматий и методичек, читатель обретает подлинную свободу прямого диалога с автором. Ты читаешь Толстого или Достоевского не как памятники из бронзы, а как живых, мучительно сомневающихся собеседников.',
      },
      {
        type: 'key-takeaways',
        items: [
          'Зрелое чтение классики свободно от необходимости искать правильные ответы.',
          'Великие тексты раскрываются только в сопоставлении с реальным жизненным опытом.',
          'Перечитывание книги — это всегда диалог с самим собой в разные периоды жизни.',
        ],
      },
    ],
    comments: [
      {
        id: 'c5',
        postId: '5',
        authorName: 'Елизавета Морозова',
        authorEmail: 'lisa.morozova@bk.ru',
        content: 'Точно в цель! Перечитала «Войну и мир» в 34 года и была поражена: в школе мы совершенно не понимали этой книги.',
        createdAt: '2026-09-21T18:20:00Z',
        likes: 15,
      },
    ],
  },
  {
    id: '6',
    slug: 'okno-v-bezmolvie-kosmicheskiy-masshtab',
    title: 'Окно в безмолвие: что космические телескопы говорят о нашем масштабе',
    subtitle: 'Глубокие поля Джеймса Уэбба и экзистенциальный трепет: как понимание бесконечности Вселенной помогает исцелить мелочные земные тревоги.',
    rubricId: 'science',
    tags: ['Наука', 'Космос', 'Вселенная', 'Философия', 'Познание'],
    coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=1200',
    coverCaption: 'Глубокий космический горизонт, ночное небо и безмолвие бесконечных галактик',
    coverSource: 'Фото: NASA & Unsplash (Public Domain / Unsplash License)',
    author: DEFAULT_AUTHORS[1],
    readTimeMinutes: 10,
    publishedAt: '2026-09-15',
    viewsCount: 2450,
    dailyViews: { [getTodayDateKey()]: 160 },
    rating: {
      average: 4.92,
      totalVotes: 44,
    },
    isFeatured: false,
    isEditorPick: false,
    isReviewedByEditor: true,
    status: 'reviewed',
    sections: [
      {
        type: 'callout',
        text: '«Вглядываясь в глубокие космические снимки, человек испытывает не страх перед ничтожностью, а парадоксальное облегчение: все сиюминутные обиды растворяются в океане световых лет».',
      },
      {
        type: 'paragraph',
        text: 'Каждый снимок телескопа Уэбба содержит свет, шедший к нам более тринадцати миллиардов лет. Цивилизации рождались, превращались в прах и забывались, пока крошечный пучок фотонов преодолевал космическую бездну. Взгляд в эту пропасть не унижает человека — напротив, он напоминает, что мы являемся той частью Вселенной, которая научилась думать и удивляться.',
      },
      {
        type: 'heading2',
        text: 'Эффект обзора: взгляд со стороны',
      },
      {
        type: 'paragraph',
        text: 'Астронавты называют это "Overview Effect" — фундаментальный сдвиг в сознании при взгляде на Землю из безмолвной пустоты. Исчезают границы государств, споры о статусах и мелкие амбиции. Остается лишь тонкая синяя дымка атмосферы, защищающая все живое от абсолютного холода.',
      },
      {
        type: 'quote',
        authorQuote: 'Карл Саган',
        quoteSource: '«Голубая точка», 1994',
        text: 'Все наши радости и страдания, тысячи самоуверенных религий и идеологий существовали на этой пылинке, подвешенной в солнечном луче.',
      },
      {
        type: 'key-takeaways',
        items: [
          'Космический масштаб помогает восстановить здоровую пропорцию между важным и суетным.',
          'Способность осознавать собственную хрупкость — признак зрелости цивилизации.',
          'Тишина космоса учит бережному отношению к живому слову и друг к другу.',
        ],
      },
    ],
    comments: [],
  },
  {
    id: '7',
    slug: 'teatr-teney-i-iskusstvo-zamedleniya',
    title: 'Театр теней: почему современный человек разучился сидеть в темноте',
    subtitle: 'О природе кинематографического созерцания: как совместный просмотр фильма на большом экране спасает нас от распада внимания.',
    rubricId: 'culture',
    tags: ['Культура', 'Кинематограф', 'Искусство', 'Внимание', 'Созерцание'],
    coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200',
    coverCaption: 'Таинственный полумрак зрительного зала и мягкий свет кинопроектора',
    coverSource: 'Фото: Felix Mooneeram / Unsplash (Unsplash License)',
    author: DEFAULT_AUTHORS[0],
    readTimeMinutes: 9,
    publishedAt: '2026-09-12',
    viewsCount: 2180,
    dailyViews: { [getTodayDateKey()]: 140 },
    rating: {
      average: 4.85,
      totalVotes: 38,
    },
    isFeatured: false,
    isEditorPick: true,
    isReviewedByEditor: true,
    status: 'reviewed',
    sections: [
      {
        type: 'callout',
        text: '«Темный кинозал — последний секулярный храм, где люди соглашаются два часа молчать вместе, отдавшись во власть чужого видения мира».',
      },
      {
        type: 'paragraph',
        text: 'В эпоху коротких вертикальных видео мы почти разучились терпеть паузу. Если на экране ничего не взрывается в первые три секунды, палец рефлекторно смахивает кадр. Но подлинное кино начинается именно в паузе — в долгом взгляде актера, в колыхании шторы от сквозняка, в звуке шагов по мокрому гравию.',
      },
      {
        type: 'heading2',
        text: 'Возвращение к совместному переживанию',
      },
      {
        type: 'paragraph',
        text: 'Когда десятки незнакомых людей в едином порыве задерживают дыхание в кульминационной сцене, рождается уникальное чувство общности. Это опыт, который принципиально невозможно воспроизвести на экране смартфона в метро.',
      },
      {
        type: 'key-takeaways',
        items: [
          'Темнота кинозала освобождает взгляд от повседневного визуального мусора.',
          'Длинный план в кино тренирует способность к эмпатии и сосредоточению.',
        ],
      },
    ],
    comments: [],
  },
  {
    id: '8',
    slug: 'fenomen-medlennogo-goroda',
    title: 'Феномен медленного города: почему нам жизненно необходимы пешеходные переулки',
    subtitle: 'Урбанистика неторопливости: как масштаб человеческого шага определяет наше эмоциональное благополучие и способность любить пространство.',
    rubricId: 'urban',
    tags: ['Урбанистика', 'Медленный город', 'Архитектура', 'Человек', 'Пространство'],
    coverImage: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&q=80&w=1200',
    coverCaption: 'Утренний туман над старыми мостами и неспешные шаги горожан',
    coverSource: 'Фото: Pedro Lastra / Unsplash (Unsplash License)',
    author: DEFAULT_AUTHORS[2],
    readTimeMinutes: 8,
    publishedAt: '2026-09-08',
    viewsCount: 1950,
    dailyViews: { [getTodayDateKey()]: 125 },
    rating: {
      average: 4.8,
      totalVotes: 32,
    },
    isFeatured: false,
    isEditorPick: false,
    isReviewedByEditor: true,
    status: 'reviewed',
    sections: [
      {
        type: 'paragraph',
        text: 'Город, построенный исключительно для автомобилей, исключает человека из телесного диалога со средой. Скорость 60 км/ч сглаживает детали: витрины, фактуру кирпичной кладки, шелест листвы. И только скорость пешехода возвращает городу его поэтическое измерение.',
      },
      {
        type: 'heading2',
        text: 'Психогеография поворота за угол',
      },
      {
        type: 'paragraph',
        text: 'Случайный выбор незнакомого переулка превращает обычный маршрут до дома в маленькое экзистенциальное путешествие. Медленный город дает право заблудиться и найти то, чего не было ни на одной навигационной карте.',
      },
      {
        type: 'key-takeaways',
        items: [
          'Пешеходная доступность напрямую связана с уровнем доверия между горожанами.',
          'Улицы человеческого масштаба снижают уровень хронического стресса.',
        ],
      },
    ],
    comments: [],
  },
  {
    id: '9',
    slug: 'estetika-chernovika',
    title: 'Эстетика черновика: почему несовершенство трогает нас сильнее безупречного глянца',
    subtitle: 'В поисках японского ваби-саби в европейской словесности: зачеркнутые строки, помарки на полях и право мысли быть уязвимой.',
    rubricId: 'books',
    tags: ['Книги', 'Литература', 'Эстетика', 'Писательство', 'Память'],
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1200',
    coverCaption: 'Рукописные черновики, следы чернил на полях и живая мысль автора',
    coverSource: 'Фото: Aaron Burden / Unsplash (Unsplash License)',
    author: DEFAULT_AUTHORS[3],
    readTimeMinutes: 7,
    publishedAt: '2026-09-04',
    viewsCount: 1720,
    dailyViews: { [getTodayDateKey()]: 98 },
    rating: {
      average: 4.9,
      totalVotes: 29,
    },
    isFeatured: false,
    isEditorPick: true,
    isReviewedByEditor: true,
    status: 'reviewed',
    sections: [
      {
        type: 'paragraph',
        text: 'В рукописях Пушкина или Флобера зачеркивания говорят ничуть не меньше, чем итоговый канонический текст. Они обнажают борьбу слова с немотой, усилие преодоления банальности. Современные цифровые редакторы скрывают этот след: текст выглядит идеальным с первой же секунды, теряя тепло человеческой ошибки.',
      },
      {
        type: 'heading2',
        text: 'Очарование незавершенности',
      },
      {
        type: 'paragraph',
        text: 'Незаконченное эссе оставляет читателю пространство для сотворчества. Автор не навязывает жестких выводов, но приглашает пройти рядом часть пути.',
      },
    ],
    comments: [],
  },
  {
    id: '10',
    slug: 'muzyka-tishiny-i-pauzy',
    title: 'Музыка тишины: почему пауза между звуками важнее самой ноты',
    subtitle: 'Философия акустического пространства от Дебюсси до Кейджа: как расслышать мир, когда все вокруг непрерывно говорят.',
    rubricId: 'philosophy',
    tags: ['Философия', 'Музыка', 'Тишина', 'Внимание', 'Гармония'],
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200',
    coverCaption: 'Одинокий рояль у залитого закатным светом окна и мгновение перед первым аккордом',
    coverSource: 'Фото: Caught In Joy / Unsplash (Unsplash License)',
    author: DEFAULT_AUTHORS[1],
    readTimeMinutes: 9,
    publishedAt: '2026-09-01',
    viewsCount: 2600,
    dailyViews: { [getTodayDateKey()]: 175 },
    rating: {
      average: 4.95,
      totalVotes: 57,
    },
    isFeatured: false,
    isEditorPick: true,
    isReviewedByEditor: true,
    status: 'reviewed',
    sections: [
      {
        type: 'paragraph',
        text: 'Музыка существует не в нотах, а в интервалах между ними. Без паузы любая мелодия превращается в неразборчивый белый шум. Точно так же человеческая речь обретает вес и глубину лишь тогда, когда говорящий не боится молчать, давая собеседнику время пережить сказанное.',
      },
      {
        type: 'heading2',
        text: 'Экология внутреннего слуха',
      },
      {
        type: 'paragraph',
        text: 'Практика намеренной тишины хотя бы в течение часа в день восстанавливает чувствительность к тонким оттенкам жизни. Мы начинаем слышать ветер за окном, дыхание близкого человека и собственный подлинный внутренний голос.',
      },
      {
        type: 'key-takeaways',
        items: [
          'Пауза — смыслообразующий элемент любого глубокого диалога.',
          'Осознанное пребывание в тишине защищает психику от эмоционального выгорания.',
        ],
      },
    ],
    comments: [],
  },
];
