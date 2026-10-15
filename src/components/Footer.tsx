import { useState } from 'react';
import { BookOpen, Feather, MapPin, Shield, Scale } from 'lucide-react';
import { Rubric, ViewMode } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import { BrandWordmark } from './BrandAssets';
import { EditorialManifestModal } from './EditorialManifestModal';

interface FooterProps {
  rubrics: Rubric[];
  onSelectRubric: (id: string | null) => void;
  onSelectPage?: (page: ViewMode) => void;
  onOpenAuth?: () => void;
  onOpenAdmin?: () => void;
  onOpenSubmitEssay?: () => void;
  t: TranslationDictionary;
}

export function Footer({
  rubrics,
  onSelectRubric,
  onSelectPage,
  onOpenAuth,
  onOpenSubmitEssay,
  t,
}: FooterProps) {
  const [isManifestOpen, setIsManifestOpen] = useState(false);

  const handleOpenPage = (page: ViewMode) => {
    onSelectPage?.(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCompactRubricHint = (r: Rubric): string => {
    switch (r.id) {
      case 'culture':
        return 'Кино, театр и искусство';
      case 'philosophy':
        return 'Экзистенция, память и время';
      case 'society':
      case 'urban':
        return 'Урбанистика и дух мест';
      case 'technology':
        return 'ИИ и будущее слова';
      case 'books':
        return 'Литература и медленное чтение';
      case 'science':
        return 'Сознание и масштаб Вселенной';
      default:
        return r.description ? r.description.slice(0, 36) : 'Авторские эссе рубрики';
    }
  };

  return (
    <>
      <footer
        id="main-footer"
        className="bg-[#F4EFE6] dark:bg-[#1A1613] text-[#1F1914] dark:text-[#FAF7F2] border-t border-[#E2D3BE] dark:border-[#3D352E] pt-12 pb-10 transition-colors overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-[#E2D3BE]/70 dark:border-[#3D352E]">
            {/* Brand & Manifesto Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex flex-col items-start gap-1">
                <BrandWordmark className="h-8 sm:h-9 text-[#1F1914] dark:text-[#FAF7F2]" />
                <span className="text-xs text-[#4A4036] dark:text-[#D1C7BD] font-medium">
                  Платформа публикации статей в жанре ЭССЕ
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#4A4036] dark:text-[#D1C7BD] leading-relaxed max-w-md">
                {t.footerDesc}
              </p>
            </div>

            {/* Rubrics Links */}
            <div className="lg:col-span-4 space-y-3 min-w-0">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1914] dark:text-[#FAF7F2]">
                {t.rubricsTitle}
              </h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                {rubrics.map((r) => (
                  <div key={r.id} className="relative group min-w-0">
                    <button
                      onClick={() => {
                        onSelectRubric(r.id);
                        window.scrollTo({ top: 500, behavior: 'smooth' });
                      }}
                      className="w-full text-left text-[#4A4036] dark:text-[#D1C7BD] group-hover:text-[#C85D36] dark:group-hover:text-[#E8A87C] font-medium transition-colors cursor-pointer py-1 truncate block"
                    >
                      {r.title}
                    </button>
                    <div className="hidden group-hover:block absolute left-0 bottom-full mb-1.5 z-30 w-max max-w-[180px] sm:max-w-[200px] bg-white text-[#1F1914] border border-[#E2D3BE] rounded-lg px-2.5 py-1.5 shadow-md text-[11px] font-normal leading-snug whitespace-normal break-words pointer-events-none">
                      {getCompactRubricHint(r)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editorial & Legal Pages */}
            <div className="lg:col-span-3 space-y-3 min-w-0">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1914] dark:text-[#FAF7F2]">
                {t.editorialTitle}
              </h4>
              <ul className="space-y-2 text-xs text-[#4A4036] dark:text-[#D1C7BD]">
                <li className="relative group min-w-0">
                  <button
                    onClick={onOpenSubmitEssay || onOpenAuth}
                    className="hover:text-[#C85D36] dark:hover:text-[#E8A87C] font-medium transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                  >
                    <Feather className="w-3.5 h-3.5 text-[#C85D36] shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{t.suggestLongread}</span>
                  </button>
                  <div className="hidden group-hover:block absolute left-0 bottom-full mb-1.5 z-30 w-max max-w-[190px] sm:max-w-[210px] bg-white text-[#1F1914] border border-[#E2D3BE] rounded-lg px-2.5 py-1.5 shadow-md text-[11px] font-normal leading-snug whitespace-normal break-words pointer-events-none">
                    Прислать текст в редакцию
                  </div>
                </li>
                <li className="relative group min-w-0">
                  <button
                    onClick={() => setIsManifestOpen(true)}
                    className="hover:text-[#C85D36] dark:hover:text-[#E8A87C] font-medium transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#C85D36] shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Редакционный манифест</span>
                  </button>
                  <div className="hidden group-hover:block absolute left-0 bottom-full mb-1.5 z-30 w-max max-w-[190px] sm:max-w-[210px] bg-white text-[#1F1914] border border-[#E2D3BE] rounded-lg px-2.5 py-1.5 shadow-md text-[11px] font-normal leading-snug whitespace-normal break-words pointer-events-none">
                    Читать редакционный манифест
                  </div>
                </li>
                <li className="relative group min-w-0">
                  <button
                    onClick={() => handleOpenPage('contacts')}
                    className="hover:text-[#C85D36] dark:hover:text-[#E8A87C] font-medium transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#C85D36] shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Контакты</span>
                  </button>
                  <div className="hidden group-hover:block absolute left-0 bottom-full mb-1.5 z-30 w-max max-w-[190px] sm:max-w-[210px] bg-white text-[#1F1914] border border-[#E2D3BE] rounded-lg px-2.5 py-1.5 shadow-md text-[11px] font-normal leading-snug whitespace-normal break-words pointer-events-none">
                    Связь и реквизиты редакции
                  </div>
                </li>
                <li className="relative group min-w-0">
                  <button
                    onClick={() => handleOpenPage('privacy')}
                    className="hover:text-[#C85D36] dark:hover:text-[#E8A87C] font-medium transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#C85D36] shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Политика конфиденциальности</span>
                  </button>
                  <div className="hidden group-hover:block absolute left-0 bottom-full mb-1.5 z-30 w-max max-w-[190px] sm:max-w-[210px] bg-white text-[#1F1914] border border-[#E2D3BE] rounded-lg px-2.5 py-1.5 shadow-md text-[11px] font-normal leading-snug whitespace-normal break-words pointer-events-none">
                    Защита персональных данных
                  </div>
                </li>
                <li className="relative group min-w-0">
                  <button
                    onClick={() => handleOpenPage('terms')}
                    className="hover:text-[#C85D36] dark:hover:text-[#E8A87C] font-medium transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                  >
                    <Scale className="w-3.5 h-3.5 text-[#C85D36] shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Условия использования</span>
                  </button>
                  <div className="hidden group-hover:block absolute left-0 bottom-full mb-1.5 z-30 w-max max-w-[190px] sm:max-w-[210px] bg-white text-[#1F1914] border border-[#E2D3BE] rounded-lg px-2.5 py-1.5 shadow-md text-[11px] font-normal leading-snug whitespace-normal break-words pointer-events-none">
                    Правила использования сайта
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4A4036] dark:text-[#D1C7BD]">
            <div className="flex items-center gap-2 text-center sm:text-left font-medium">
              <span>{t.copyrightText}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Editorial Manifesto Modal */}
      <EditorialManifestModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
        onOpenSubmitEssay={onOpenSubmitEssay}
      />
    </>
  );
}
