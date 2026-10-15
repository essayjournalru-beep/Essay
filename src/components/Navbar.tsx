import { useState, useEffect, useRef } from 'react';
import { Search, Moon, Sun, Bookmark, ShieldCheck, LogIn, LogOut, SlidersHorizontal, Check } from 'lucide-react';
import { ThemeMode, ViewMode, UserProfile, ReaderFont, ReaderFontSize } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import { BrandWordmark, ContentIcon, ThemeLogo } from './BrandAssets';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onOpenSearch: () => void;
  savedCount: number;
  onOpenSaved: () => void;
  onGoHome: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  fontSize: ReaderFontSize;
  onFontSizeChange: (size: ReaderFontSize) => void;
  fontFamily: ReaderFont;
  onFontFamilyChange: (family: ReaderFont) => void;
  t: TranslationDictionary;
}

export function Navbar({
  theme,
  onToggleTheme,
  viewMode,
  onSelectViewMode,
  onOpenSearch,
  savedCount,
  onOpenSaved,
  onGoHome,
  currentUser,
  onOpenAuth,
  onLogout,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  t,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsDropdownOpen(false);
      }
    };
    if (settingsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsDropdownOpen]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Владелец издания';
      case 'admin':
        return 'Главный редактор';
      case 'editor':
        return 'Редактор';
      case 'author':
        return 'Автор-эссеист';
      default:
        return 'Читатель';
    }
  };

  // Кнопка панели управления / кабинета доступна для ролей: владелец, администратор, редактор, автор
  const canAccessAuthorCabinet = Boolean(
    currentUser &&
      (currentUser.role === 'owner' ||
        currentUser.role === 'admin' ||
        currentUser.role === 'editor' ||
        currentUser.role === 'author')
  );

  const getCabinetButtonLabel = (role?: string) => {
    switch (role) {
      case 'owner':
      case 'admin':
        return 'Админ-панель';
      case 'editor':
        return 'Кабинет редактора';
      case 'author':
      default:
        return 'Кабинет автора';
    }
  };

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF7F2]/95 dark:bg-[#1A1613]/95 backdrop-blur-md shadow-xs border-b border-[#E2D3BE] dark:border-[#3D352E]'
          : 'bg-[#FAF7F2] dark:bg-[#1A1613] border-b border-[#E2D3BE]/70 dark:border-[#3D352E]/70'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 min-h-16 sm:h-20 py-1.5 sm:py-0">
          {/* Requirement 2: Чистый, благородный фирменный леттеринг «эссе» и аккуратная подпись под ним.
              Без квадратной плашки слева и без оранжевой надписи «essay.ru». */}
          <div
            className="flex flex-col cursor-pointer select-none group py-0.5 min-w-0 shrink"
            onClick={onGoHome}
            title="ЭССЕ — на главную"
          >
            <BrandWordmark
              className="h-6 sm:h-9 self-start text-[#1F1914] dark:text-[#FAF7F2] transition-opacity group-hover:opacity-85"
              variant={theme === 'dark' ? 'white' : 'charcoal'}
            />
            <span className="text-[10px] sm:text-xs text-[#4A4036] dark:text-[#D1C7BD] font-medium tracking-tight sm:tracking-normal mt-0.5 leading-tight">
              Платформа публикации статей в жанре ЭССЕ
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Search Button */}
            <button
              id="search-open-btn"
              onClick={onOpenSearch}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#1F1914] dark:hover:text-[#FAF7F2] hover:bg-[#E2D3BE]/40 dark:hover:bg-[#2A231D] transition-colors flex items-center gap-2 cursor-pointer text-xs font-semibold"
              title="Поиск по эссе, авторам и темам"
            >
              <Search className="w-4 h-4 text-[#C85D36]" />
              <span className="hidden md:inline">{t.search}</span>
            </button>

            {/* Requirement 4: Единое окно «Настройки» в шапке (3 шрифта: Literata, Merriweather, Plus Jakarta Sans, размер текста и переключатель темы) */}
            <div className="relative" ref={settingsRef}>
              <button
                id="reading-settings-btn"
                onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  settingsDropdownOpen
                    ? 'bg-[#C85D36] text-white shadow-2xs'
                    : 'text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#1F1914] dark:hover:text-[#FAF7F2] hover:bg-[#E2D3BE]/40 dark:hover:bg-[#2A231D]'
                }`}
                title="Настройки шрифта, размера и темы"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden lg:inline">Настройки</span>
              </button>

              {settingsDropdownOpen && (
                <div className="fixed right-2.5 top-14 w-52 sm:absolute sm:right-0 sm:top-auto sm:mt-2.5 sm:w-76 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAF7F2] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1.5 mb-2 sm:pb-2.5 sm:mb-3 border-b border-[#E2D3BE]/60 dark:border-[#3D352E]">
                    <span className="text-[10px] sm:text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] uppercase tracking-wider">
                      Настройки
                    </span>
                    <ThemeLogo className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                  </div>
                  
                  {/* 1. Выбор шрифта (Literata, Merriweather, Plus Jakarta Sans) */}
                  <div className="mb-2 sm:mb-4">
                    <div className="text-[10px] sm:text-xs font-semibold text-[#1F1914] dark:text-[#FAF7F2] mb-1 sm:mb-1.5">
                      Шрифт публикации:
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-1.5">
                      <button
                        onClick={() => onFontFamilyChange('literata')}
                        className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                          fontFamily === 'literata'
                            ? 'bg-[#C85D36] text-white font-bold shadow-2xs'
                            : 'bg-[#F4EFE6] dark:bg-[#1A1613] text-[#1F1914] dark:text-[#FAF7F2] hover:bg-[#E2D3BE]/50'
                        }`}
                        style={{ fontFamily: "'Literata', serif" }}
                      >
                        <span className="truncate">Literata (книжный)</span>
                        {fontFamily === 'literata' && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ml-1" />}
                      </button>

                      <button
                        onClick={() => onFontFamilyChange('merriweather')}
                        className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                          fontFamily === 'merriweather'
                            ? 'bg-[#C85D36] text-white font-bold shadow-2xs'
                            : 'bg-[#F4EFE6] dark:bg-[#1A1613] text-[#1F1914] dark:text-[#FAF7F2] hover:bg-[#E2D3BE]/50'
                        }`}
                        style={{ fontFamily: "'Merriweather', serif" }}
                      >
                        <span className="truncate">Merriweather (антиква)</span>
                        {fontFamily === 'merriweather' && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ml-1" />}
                      </button>

                      <button
                        onClick={() => onFontFamilyChange('sans')}
                        className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                          fontFamily === 'sans'
                            ? 'bg-[#C85D36] text-white font-bold shadow-2xs'
                            : 'bg-[#F4EFE6] dark:bg-[#1A1613] text-[#1F1914] dark:text-[#FAF7F2] hover:bg-[#E2D3BE]/50'
                        }`}
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        <span className="truncate">Plus Jakarta Sans</span>
                        {fontFamily === 'sans' && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ml-1" />}
                      </button>
                    </div>
                  </div>

                  {/* 2. Размер текста (Стандартный, Крупный, Очень крупный) */}
                  <div className="mb-2 sm:mb-4">
                    <div className="text-[10px] sm:text-xs font-semibold text-[#1F1914] dark:text-[#FAF7F2] mb-1 sm:mb-1.5">
                      Размер текста
                    </div>
                    <div className="grid grid-cols-3 gap-1 sm:gap-1.5 p-0.5 sm:p-1 rounded-lg sm:rounded-xl bg-[#F4EFE6] dark:bg-[#1A1613] border border-[#E2D3BE]/60 dark:border-[#3D352E]">
                      <button
                        onClick={() => onFontSizeChange('normal')}
                        className={`py-1 px-1 sm:py-1.5 sm:px-2 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-semibold transition-all cursor-pointer truncate ${
                          fontSize === 'normal'
                            ? 'bg-[#C85D36] text-white shadow-2xs'
                            : 'text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#1F1914]'
                        }`}
                      >
                        Станд.
                      </button>
                      <button
                        onClick={() => onFontSizeChange('large')}
                        className={`py-1 px-1 sm:py-1.5 sm:px-2 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-semibold transition-all cursor-pointer truncate ${
                          fontSize === 'large'
                            ? 'bg-[#C85D36] text-white shadow-2xs'
                            : 'text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#1F1914]'
                        }`}
                      >
                        Крупный
                      </button>
                      <button
                        onClick={() => onFontSizeChange('xlarge')}
                        className={`py-1 px-1 sm:py-1.5 sm:px-2 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-semibold transition-all cursor-pointer truncate ${
                          fontSize === 'xlarge'
                            ? 'bg-[#C85D36] text-white shadow-2xs'
                            : 'text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#1F1914]'
                        }`}
                      >
                        Макс.
                      </button>
                    </div>
                  </div>

                  {/* 3. Тема оформления (Светлая / Тёмная прямо внутри настроек) */}
                  <div className="pt-1.5 sm:pt-2 border-t border-[#E2D3BE]/60 dark:border-[#3D352E]">
                    <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs">
                      <span className="font-semibold text-[#4A4036] dark:text-[#D1C7BD] truncate">
                        Тема:
                      </span>
                      <div className="flex gap-0.5 sm:gap-1 p-0.5 rounded-lg sm:rounded-xl bg-[#F4EFE6] dark:bg-[#1A1613] border border-[#E2D3BE]/60 dark:border-[#3D352E]">
                        <button
                          onClick={() => theme !== 'light' && onToggleTheme()}
                          className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[9.5px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                            theme === 'light'
                              ? 'bg-[#C85D36] text-white shadow-2xs'
                              : 'text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#1F1914]'
                          }`}
                        >
                          <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>Светлая</span>
                        </button>
                        <button
                          onClick={() => theme !== 'dark' && onToggleTheme()}
                          className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[9.5px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                            theme === 'dark'
                              ? 'bg-[#C85D36] text-white shadow-2xs'
                              : 'text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#1F1914]'
                          }`}
                        >
                          <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>Тёмная</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Articles Bookmark */}
            <button
              id="saved-articles-nav-btn"
              onClick={onOpenSaved}
              className="relative p-2 rounded-xl text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#1F1914] dark:hover:text-[#FAF7F2] hover:bg-[#E2D3BE]/40 dark:hover:bg-[#2A231D] transition-colors cursor-pointer"
              title={t.savedArticles}
            >
              <Bookmark className="w-4 h-4 text-[#C85D36]" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#C85D36] text-white shadow-xs">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Кнопка панели управления / кабинета.
                Только для ролей: автор, редактор, админ, владелец.
                Для читателей и незалогиненных пользователей — полностью отсутствует в шапке. */}
            {canAccessAuthorCabinet && (
              <button
                id="author-cabinet-btn"
                onClick={() => onSelectViewMode(viewMode === 'admin' ? 'feed' : 'admin')}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#C85D36] hover:bg-[#B34E28] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                title="Перейти в административную панель / кабинет"
              >
                <ContentIcon className="w-4 h-4 brightness-125" />
                <span>{viewMode === 'admin' ? 'К ленте эссе' : getCabinetButtonLabel(currentUser?.role)}</span>
              </button>
            )}

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2.5 rounded-xl border border-[#E2D3BE] dark:border-[#3D352E] bg-[#F4EFE6] dark:bg-[#241E1A] hover:bg-[#E2D3BE]/50 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold max-w-[110px] truncate text-[#1F1914] dark:text-[#FAF7F2]">
                    {currentUser.name}
                  </span>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-[#DFCEB4]"
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 p-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#E2D3BE]/60 dark:border-[#3D352E]">
                      <div className="text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-[#C85D36] font-semibold mt-0.5">
                        {getRoleBadge(currentUser.role)}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectViewMode('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-[#E2D3BE]/50 dark:hover:bg-[#2A231D] flex items-center gap-2 transition-colors cursor-pointer mt-1 font-medium text-[#1F1914] dark:text-[#FAF7F2]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C85D36]" />
                      <span>
                        {canAccessAuthorCabinet
                          ? getCabinetButtonLabel(currentUser.role)
                          : 'Настройки профиля'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl flex items-center gap-2 transition-colors cursor-pointer font-medium mt-0.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="login-btn"
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-xl bg-[#C85D36] hover:bg-[#B34E28] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.login}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
