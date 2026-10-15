import { X, BookOpen, Feather, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';
import { ThemeLogo } from './BrandAssets';

interface EditorialManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmitEssay?: () => void;
}

export function EditorialManifestModal({
  isOpen,
  onClose,
  onOpenSubmitEssay,
}: EditorialManifestModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] dark:bg-[#1E1915] rounded-3xl border border-[#E2D3BE] dark:border-[#3D352E] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-5 bg-[#F4EFE6] dark:bg-[#241E1A] border-b border-[#E2D3BE] dark:border-[#3D352E] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ThemeLogo className="w-9 h-9 rounded-xl shadow-2xs" />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2] leading-tight">
                Редакционный манифест
              </h3>
              <p className="text-[11px] text-[#4A4036] dark:text-[#D1C7BD]">
                Издание современной эссеистики «ЭССЕ»
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#E2D3BE]/60 dark:hover:bg-[#3D352E] text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#C85D36] dark:hover:text-[#FAF7F2] transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#2B241E] dark:text-[#EAE3D9]">
          <div className="overflow-hidden rounded-2xl border border-[#E2D3BE]/80 dark:border-[#3D352E] shadow-xs">
            <img
              src="/essaymeta.jpeg"
              alt="Журнал современной эссеистики ЭССЕ"
              className="w-full h-44 sm:h-52 object-cover select-none"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE]/80 dark:border-[#3D352E] text-center">
            <p className="font-serif text-base sm:text-lg italic text-[#1F1914] dark:text-[#FAF7F2] leading-relaxed">
              «Эссе — это не готовый ответ, а честный и смелый путь рассуждения. Мы создали пространство неспешной мысли в эпоху тотального шума».
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#C85D36]/10 text-[#C85D36] shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#1F1914] dark:text-[#FAF7F2] mb-1">
                  1. Примат глубины над скоростью (Slow Thinking)
                </h4>
                <p className="text-[#4A4036] dark:text-[#D1C7BD]">
                  Мы сознательно отказываемся от сиюминутной новостной суеты и алгоритмической гонки за кликами. Хорошее эссе сохраняет актуальность, силу и свежесть мысли спустя годы после публикации.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#C85D36]/10 text-[#C85D36] shrink-0 mt-0.5">
                <Feather className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#1F1914] dark:text-[#FAF7F2] mb-1">
                  2. Человеческий опыт и эстетика слова
                </h4>
                <p className="text-[#4A4036] dark:text-[#D1C7BD]">
                  Язык — не просто средство передачи данных, а самостоятельное искусство. Мы ценим авторский стиль, точность метафоры, плотность мысли и подлинную искренность личной интонации.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#C85D36]/10 text-[#C85D36] shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#1F1914] dark:text-[#FAF7F2] mb-1">
                  3. Редакционная этика и уважение к читателю
                </h4>
                <p className="text-[#4A4036] dark:text-[#D1C7BD]">
                  Каждый текст проходит бережную вычитку редакторской коллегии. Мы бережём время и внимание нашего читателя: никакой навязчивой рекламы, манипуляций или кликбейта.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#C85D36]/10 text-[#C85D36] shrink-0 mt-0.5">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#1F1914] dark:text-[#FAF7F2] mb-1">
                  4. Открытая трибуна для новых авторов
                </h4>
                <p className="text-[#4A4036] dark:text-[#D1C7BD]">
                  Журнал «ЭССЕ» — открытая площадка. Мы рады как признанным исследователям и писателям, так и начинающим авторам, у которых есть самобытная идея и смелость исследовать мир.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-[#F4EFE6] dark:bg-[#241E1A] border-t border-[#E2D3BE] dark:border-[#3D352E] flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-[#8C827A] dark:text-[#A89F95] font-medium">
            Редакция журнала «ЭССЕ»
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#E2D3BE]/60 dark:bg-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] hover:bg-[#E2D3BE] dark:hover:bg-[#4A4036] transition-colors cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
