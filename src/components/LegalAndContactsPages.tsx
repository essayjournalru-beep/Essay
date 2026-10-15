import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  Scale,
  Building2,
  Send,
  Edit3,
  Check,
  Save,
  Feather,
  FileText,
  Lock,
  Globe,
} from 'lucide-react';
import { SiteContactDetails, UserProfile, ViewMode } from '../types';

interface LegalAndContactsPageProps {
  page: 'contacts' | 'privacy' | 'terms';
  onBack: () => void;
  onNavigatePage: (page: ViewMode) => void;
  onOpenSubmitEssay: () => void;
  currentUser: UserProfile | null;
  contactDetails: SiteContactDetails;
  onSaveContactDetails: (details: SiteContactDetails) => Promise<void>;
}

export function LegalAndContactsPages({
  page,
  onBack,
  onNavigatePage,
  onOpenSubmitEssay,
  currentUser,
  contactDetails,
  onSaveContactDetails,
}: LegalAndContactsPageProps) {
  // Owner check: role === 'owner' or owner email
  const isOwner = Boolean(
    currentUser &&
      (currentUser.role === 'owner' ||
        currentUser.email?.toLowerCase() === 'elshan@ozat.kz')
  );

  // Owner editing state for Contacts & Requisites
  const [isEditingContacts, setIsEditingContacts] = useState(false);
  const [formState, setFormState] = useState<SiteContactDetails>(contactDetails);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Feedback form state on Contacts page
  const [senderName, setSenderName] = useState(currentUser?.name || '');
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || '');
  const [subject, setSubject] = useState('Вопрос в редакцию');
  const [message, setMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    setFormState(contactDetails);
  }, [contactDetails]);

  useEffect(() => {
    if (currentUser) {
      if (!senderName && currentUser.name) setSenderName(currentUser.name);
      if (!senderEmail && currentUser.email) setSenderEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleOwnerSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveContactDetails(formState);
      setSaveSuccess(true);
      setIsEditingContacts(false);
      setTimeout(() => setSaveSuccess(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const targetEmail = contactDetails.email || 'elshan@ozat.kz';
    const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(
      `[ЭССЕ • ${subject}] от ${senderName}`
    )}&body=${encodeURIComponent(
      `Имя: ${senderName}\nEmail: ${senderEmail}\n\nСообщение:\n${message}`
    )}`;

    try {
      const a = document.createElement('a');
      a.href = mailtoUrl;
      a.target = '_top';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      // fallback if mailto is blocked
    }

    setFeedbackSent(true);
    setMessage('');
    setTimeout(() => setFeedbackSent(false), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Navigation & Page Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-[#E2D3BE] dark:border-[#3D352E]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F4EFE6] dark:bg-[#241E1A] text-[#1F1914] dark:text-[#FAF7F2] border border-[#E2D3BE] dark:border-[#3D352E] hover:border-[#C85D36] hover:text-[#C85D36] transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#C85D36]" />
          <span>Назад к эссе</span>
        </button>

        {/* Sub-navigation between the 3 pages */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E]">
          <button
            onClick={() => onNavigatePage('contacts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              page === 'contacts'
                ? 'bg-[#C85D36] text-white shadow-2xs'
                : 'text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#1F1914] dark:hover:text-[#FAF7F2]'
            }`}
          >
            Контакты
          </button>
          <button
            onClick={() => onNavigatePage('privacy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              page === 'privacy'
                ? 'bg-[#C85D36] text-white shadow-2xs'
                : 'text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#1F1914] dark:hover:text-[#FAF7F2]'
            }`}
          >
            Политика конфиденциальности
          </button>
          <button
            onClick={() => onNavigatePage('terms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              page === 'terms'
                ? 'bg-[#C85D36] text-white shadow-2xs'
                : 'text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#1F1914] dark:hover:text-[#FAF7F2]'
            }`}
          >
            Условия использования
          </button>
        </div>
      </div>

      {/* PAGE 1: КОНТАКТЫ */}
      {page === 'contacts' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Banner without "Республика Казахстан" */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                Контакты и реквизиты редакции
              </h1>
              <p className="text-xs sm:text-sm text-[#4A4036] dark:text-[#D1C7BD] max-w-2xl leading-relaxed">
                Литературно-публицистическая платформа «ЭССЕ» открыта для диалога с авторами, читателями, исследователями и партнёрами.
              </p>
            </div>

            {isOwner && (
              <button
                type="button"
                onClick={() => setIsEditingContacts(!isEditingContacts)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C85D36] hover:bg-[#B34E28] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-center"
              >
                <Edit3 className="w-4 h-4" />
                <span>
                  {isEditingContacts ? 'Отменить редактирование' : 'Указать город и реквизиты'}
                </span>
              </button>
            )}
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Контактные данные, город и реквизиты сайта успешно обновлены.</span>
            </div>
          )}

          {/* OWNER EDITOR PANEL: Only visible when site owner clicks "Указать город и реквизиты" */}
          {isOwner && isEditingContacts && (
            <form
              onSubmit={handleOwnerSave}
              className="p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] dark:bg-[#1E1915] border-2 border-[#C85D36] shadow-xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E2D3BE] dark:border-[#3D352E]">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#C85D36]" />
                  <div>
                    <h2 className="font-serif text-base sm:text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                      Настройка города и реквизитов (Панель владельца сайта)
                    </h2>
                    <p className="text-[11px] text-[#6B625B] dark:text-[#9E9388]">
                      Указанные данные отображаются на странице «Контакты» и в юридических документах
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5">
                    Город / Регион
                  </label>
                  <input
                    type="text"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    placeholder="Укажите город или регион"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5">
                    Адрес редакции / Почтовый адрес
                  </label>
                  <input
                    type="text"
                    value={formState.address}
                    onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                    placeholder="Улица, дом, офис / индекс"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5">
                    Наименование организации / ИП / Правообладателя
                  </label>
                  <input
                    type="text"
                    value={formState.legalEntity}
                    onChange={(e) => setFormState({ ...formState, legalEntity: e.target.value })}
                    placeholder="Наименование организации или владельца"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5">
                    Регистрационный номер (БИН / ИИН / Reg. ID)
                  </label>
                  <input
                    type="text"
                    value={formState.binIin}
                    onChange={(e) => setFormState({ ...formState, binIin: e.target.value })}
                    placeholder="Регистрационный номер (по желанию)"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5">
                    Официальный Email для обращений
                  </label>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="elshan@ozat.kz"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5">
                    Контактный телефон
                  </label>
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    placeholder="+7 (XXX) XXX-XX-XX"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5">
                    Telegram / Мессенджер
                  </label>
                  <input
                    type="text"
                    value={formState.telegram}
                    onChange={(e) => setFormState({ ...formState, telegram: e.target.value })}
                    placeholder="@username или ссылка"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5">
                    График работы редакции
                  </label>
                  <input
                    type="text"
                    value={formState.workingHours}
                    onChange={(e) => setFormState({ ...formState, workingHours: e.target.value })}
                    placeholder="Пн–Пт: 09:00 – 18:00"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5">
                  Банковские и дополнительные реквизиты (IBAN / SWIFT / Банк / Свидетельство)
                </label>
                <textarea
                  rows={3}
                  value={formState.bankDetails}
                  onChange={(e) => setFormState({ ...formState, bankDetails: e.target.value })}
                  placeholder="Укажите банковские или регистрационные реквизиты..."
                  className="w-full p-3.5 rounded-xl text-xs bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingContacts(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E2D3BE]/50 dark:bg-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C85D36] hover:bg-[#B34E28] text-white shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Сохранение...' : 'Сохранить реквизиты'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Main Grid: Contact Cards + Feedback Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Requisites & Contacts */}
            <div className="lg:col-span-6 space-y-5">
              <div className="p-6 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2D3BE]/60 dark:border-[#3D352E]">
                  <Building2 className="w-5 h-5 text-[#C85D36]" />
                  <h2 className="font-serif text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                    Сведения об издании и реквизиты
                  </h2>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  {(contactDetails.city || contactDetails.address) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#C85D36] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] dark:text-[#A89F95]">
                          Город и местонахождение
                        </div>
                        {contactDetails.city && (
                          <div className="font-semibold text-[#1F1914] dark:text-[#FAF7F2] mt-0.5">
                            {contactDetails.city}
                          </div>
                        )}
                        {contactDetails.address && contactDetails.address !== contactDetails.city && (
                          <div className="text-xs text-[#4A4036] dark:text-[#D1C7BD] mt-0.5">
                            {contactDetails.address}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {contactDetails.legalEntity && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-[#C85D36] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] dark:text-[#A89F95]">
                          Правообладатель / Оператор
                        </div>
                        <div className="font-semibold text-[#1F1914] dark:text-[#FAF7F2] mt-0.5">
                          {contactDetails.legalEntity}
                        </div>
                        {contactDetails.binIin && (
                          <div className="text-xs font-mono text-[#4A4036] dark:text-[#D1C7BD] mt-0.5">
                            Рег. номер: {contactDetails.binIin}
                          </div>
                        )}
                        {contactDetails.bankDetails && (
                          <div className="text-xs text-[#4A4036] dark:text-[#D1C7BD] mt-1 whitespace-pre-line">
                            {contactDetails.bankDetails}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {contactDetails.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-[#C85D36] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] dark:text-[#A89F95]">
                          Электронная почта для обращений
                        </div>
                        <a
                          href={`mailto:${contactDetails.email}`}
                          target="_top"
                          className="font-semibold text-[#C85D36] hover:underline mt-0.5 inline-block"
                        >
                          {contactDetails.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {contactDetails.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-[#C85D36] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] dark:text-[#A89F95]">
                          Телефон
                        </div>
                        <a
                          href={`tel:${contactDetails.phone}`}
                          className="font-semibold text-[#1F1914] dark:text-[#FAF7F2] hover:text-[#C85D36] mt-0.5 inline-block"
                        >
                          {contactDetails.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {contactDetails.telegram && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-[#C85D36] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] dark:text-[#A89F95]">
                          Telegram / Мессенджеры
                        </div>
                        <div className="font-semibold text-[#1F1914] dark:text-[#FAF7F2] mt-0.5">
                          {contactDetails.telegram}
                        </div>
                      </div>
                    </div>
                  )}

                  {contactDetails.workingHours && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-[#C85D36] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] dark:text-[#A89F95]">
                          Режим работы редакции
                        </div>
                        <div className="font-medium text-[#1F1914] dark:text-[#FAF7F2] mt-0.5">
                          {contactDetails.workingHours}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* For Authors Card */}
              <div className="p-6 rounded-3xl bg-[#FAF7F2] dark:bg-[#1E1915] border border-[#E2D3BE] dark:border-[#3D352E] space-y-3">
                <div className="flex items-center gap-2">
                  <Feather className="w-4 h-4 text-[#C85D36]" />
                  <h3 className="font-serif text-base font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                    Авторам и исследователям
                  </h3>
                </div>
                <p className="text-xs text-[#4A4036] dark:text-[#D1C7BD] leading-relaxed">
                  Хотите предложить авторское эссе в номер? Воспользуйтесь формой отправки рукописи — редакционная коллегия рассматривает тексты в течение 5 рабочих дней.
                </p>
                <button
                  type="button"
                  onClick={onOpenSubmitEssay}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C85D36] hover:bg-[#B34E28] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Feather className="w-3.5 h-3.5" />
                  <span>Предложить эссе в редакцию</span>
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Feedback Form */}
            <div className="lg:col-span-6">
              <form
                onSubmit={handleFeedbackSubmit}
                className="p-6 sm:p-7 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] space-y-4"
              >
                <h2 className="font-serif text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                  Форма обратной связи
                </h2>
                <p className="text-xs text-[#4A4036] dark:text-[#D1C7BD]">
                  Напишите нам по вопросам сотрудничества, авторских прав, работы сайта или редакционной политики.
                </p>

                {feedbackSent && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
                    ✓ Ваше обращение сформировано и отправлено. Спасибо за связь с редакцией «ЭССЕ»!
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1">
                      Ваше имя *
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Имя и фамилия"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1">
                      Ваш Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1">
                    Тема обращения
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36] cursor-pointer"
                  >
                    <option value="Вопрос в редакцию">Вопрос в редакцию</option>
                    <option value="Предложение о партнёрстве">Предложение о партнёрстве</option>
                    <option value="Персональные данные и приватность">Персональные данные и приватность</option>
                    <option value="Авторские права и цитирование">Авторские права и цитирование</option>
                    <option value="Техническая поддержка">Техническая поддержка</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1">
                    Текст сообщения *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Опишите ваш вопрос или предложение..."
                    className="w-full p-3.5 rounded-xl text-xs bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>

                <p className="text-[11px] text-[#6B625B] dark:text-[#9E9388] leading-snug">
                  Отправляя форму, вы даёте согласие на обработку персональных данных в соответствии с{' '}
                  <button
                    type="button"
                    onClick={() => onNavigatePage('privacy')}
                    className="text-[#C85D36] underline cursor-pointer"
                  >
                    Политикой конфиденциальности
                  </button>{' '}
                  и международными стандартами защиты данных.
                </p>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#C85D36] hover:bg-[#B34E28] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Отправить обращение</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 2: ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ (ПО МЕЖДУНАРОДНОМУ ПРАВУ) */}
      {page === 'privacy' && (
        <article className="p-6 sm:p-10 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] space-y-6 text-[#1F1914] dark:text-[#FAF7F2] animate-in fade-in duration-200">
          <div className="border-b border-[#E2D3BE] dark:border-[#3D352E] pb-6 space-y-2">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold">
              Политика конфиденциальности и защиты персональных данных
            </h1>
            <p className="text-xs text-[#6B625B] dark:text-[#9E9388]">
              Действующая редакция от 6 октября 2026 года • В соответствии с нормами международного права
            </p>
          </div>

          <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-[#2B241E] dark:text-[#EAE3D9]">
            <section className="space-y-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                1. Общие положения и международно-правовые стандарты
              </h2>
              <p>
                1.1. Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок сбора, хранения, обработки и защиты персональных данных пользователей литературно-публицистической платформы «ЭССЕ» (далее — «Платформа») в соответствии с общепризнанными принципами и нормами международного права в сфере неприкосновенности частной жизни, включая{' '}
                <strong>Общий регламент по защите данных (GDPR, Regulation (EU) 2016/679)</strong>,{' '}
                <strong>Конвенцию о защите физических лиц при автоматизированной обработке персональных данных (Конвенция 108+)</strong> и международные стандарты информационной безопасности.
              </p>
              <p>
                1.2. Оператором (контролёром) данных выступает{' '}
                <strong>{contactDetails.legalEntity || 'Издание современной эссеистики «ЭССЕ»'}</strong>
                {contactDetails.binIin ? ` (Рег. номер: ${contactDetails.binIin})` : ''} (далее — «Оператор»).
              </p>
              <p>
                1.3. Обработка персональных данных на Платформе строится на международных принципах законности, справедливости и прозрачности (<em>Lawfulness, Fairness and Transparency</em>), ограничения цели (<em>Purpose Limitation</em>) и минимизации данных (<em>Data Minimisation</em>).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                2. Категории собираемых данных
              </h2>
              <p>
                2.1. Оператор обрабатывает исключительно минимально необходимый объём данных, добровольно предоставляемых Пользователем при использовании Платформы:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Учётные и идентификационные данные:</strong> имя, творческий псевдоним и адрес электронной почты (Email) при авторизации, подписке на рассылку или публикации комментариев;</li>
                <li><strong>Данные авторского профиля:</strong> краткая биография, профессиональная специализация и ссылки на публичные страницы (по усмотрению Автора);</li>
                <li><strong>Технические и функциональные данные:</strong> обезличенные данные сессии, файлы cookie и локальные настройки чтения (выбранная гарнитура шрифта, размер текста и цветовая тема интерфейса).</li>
              </ul>
              <p>
                2.2. Оператор не осуществляет сбор биометрических данных и специальных (чувствительных) категорий персональных данных.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                3. Цели и правовые основания обработки данных
              </h2>
              <p>
                3.1. Обработка данных осуществляется на основании добровольного согласия Пользователя и законного интереса Оператора для следующих целей:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Обеспечение полноценного доступа к чтению, сохранению в закладки и обсуждению эссе;</li>
                <li>Приём, редакционное рецензирование и публикация авторских материалов с соблюдением прав автора;</li>
                <li>Информирование подписчиков о выходе новых выпусков и избранных публикаций;</li>
                <li>Обеспечение информационной безопасности Платформы и защита от несанкционированного доступа.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                4. Международная передача и безопасность хранения данных
              </h2>
              <p>
                4.1. Для обеспечения глобальной доступности Платформы обработка и хранение данных осуществляются с использованием защищённой облачной инфраструктуры с шифрованием передаваемых данных по протоколам TLS/SSL.
              </p>
              <p>
                4.2. При трансграничной (международной) передаче данных Оператор обеспечивает применение стандартных договорных положений и технических мер защиты, гарантирующих уровень безопасности, соответствующий международным стандартам.
              </p>
              <p>
                4.3. Персональные данные хранятся не дольше, чем это необходимо для достижения целей обработки, либо до момента отзыва согласия Пользователем.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                5. Международные права субъекта данных
              </h2>
              <p>
                5.1. В соответствии с нормами международного права каждый Пользователь обладает следующими правами:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Право на доступ (Right of Access):</strong> получение подтверждения факта обработки данных и копии своих персональных данных;</li>
                <li><strong>Право на исправление (Right to Rectification):</strong> актуализация и корректировка неточных или неполных сведений;</li>
                <li><strong>Право на удаление / «Право на забвение» (Right to Erasure):</strong> требование полного удаления своих персональных данных из систем Платформы;</li>
                <li><strong>Право на ограничение обработки и переносимость данных (Right to Data Portability):</strong> получение своих данных в структурированном машиночитаемом формате;</li>
                <li><strong>Право на отзыв согласия:</strong> отзыв ранее данного согласия в любое время без ущерба для законности обработки, осуществлённой до такого отзыва.</li>
              </ul>
              <p>
                5.2. Для реализации любого из указанных прав Пользователь может направить запрос через раздел{' '}
                <button
                  type="button"
                  onClick={() => onNavigatePage('contacts')}
                  className="text-[#C85D36] font-semibold underline cursor-pointer"
                >
                  «Контакты»
                </button>
                {contactDetails.email ? ` или по адресу электронной почты ${contactDetails.email}` : ''}.
              </p>
            </section>
          </div>
        </article>
      )}

      {/* PAGE 3: УСЛОВИЯ ИСПОЛЬЗОВАНИЯ (ПО МЕЖДУНАРОДНОМУ ПРАВУ) */}
      {page === 'terms' && (
        <article className="p-6 sm:p-10 rounded-3xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] space-y-6 text-[#1F1914] dark:text-[#FAF7F2] animate-in fade-in duration-200">
          <div className="border-b border-[#E2D3BE] dark:border-[#3D352E] pb-6 space-y-2">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold">
              Условия использования платформы «ЭССЕ»
            </h1>
            <p className="text-xs text-[#6B625B] dark:text-[#9E9388]">
              Действующая редакция от 6 октября 2026 года • В соответствии с нормами международного права
            </p>
          </div>

          <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-[#2B241E] dark:text-[#EAE3D9]">
            <section className="space-y-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                1. Предмет Соглашения и международно-правовая основа
              </h2>
              <p>
                1.1. Настоящие Условия использования (далее — «Соглашение») регулируют порядок доступа и использования литературно-публицистической платформы «ЭССЕ» (далее — «Платформа») между{' '}
                <strong>{contactDetails.legalEntity || 'Администрацией издания «ЭССЕ»'}</strong> (далее — «Администрация») и любым лицом, посещающим или использующим Платформу (далее — «Пользователь»).
              </p>
              <p>
                1.2. Настоящее Соглашение составлено в соответствии с общепризнанными нормами международного права, включая{' '}
                <strong>Бернскую конвенцию по охране литературных и художественных произведений</strong>,{' '}
                <strong>Всемирную конвенцию об авторском праве</strong>,{' '}
                <strong>Договор ВОИС по авторскому праву (WCT)</strong> и международные стандарты электронной коммерции и цифровых медиа.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                2. Охрана интеллектуальной собственности и авторских прав
              </h2>
              <p>
                2.1. Все литературно-публицистические произведения (эссе), переводы, иллюстрации, дизайн и программный код, размещённые на Платформе, являются объектами интеллектуальной собственности и охраняются международными конвенциями об авторском праве.
              </p>
              <p>
                2.2. За каждым Автором эссе бессрочно и неотчуждаемо сохраняются его личные неимущественные права (право авторства и право на имя в соответствии со ст. 6bis Бернской конвенции). Направляя рукопись в редакцию Платформы, Автор подтверждает оригинальность текста и предоставляет Платформе неисключительную всемирную лицензию на цифровую публикацию и доведение произведения до всеобщего сведения.
              </p>
              <p>
                2.3. Свободное цитирование отрывков из опубликованных эссе допускается в соответствии с международной доктриной добросовестного использования (<em>Fair Use / Fair Dealing</em>) в научных, критических, образовательных или информационных целях при обязательном указании имени Автора и активной гиперссылки на страницу первоисточника на Платформе «ЭССЕ».
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                3. Правила публикации материалов и этические стандарты
              </h2>
              <p>
                3.1. Платформа уважает свободу мысли, творческого самовыражения и интеллектуальной дискуссии. Вместе с тем Пользователям и Авторам запрещается использовать Платформу для публикации материалов, нарушающих нормы международного права:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Материалов, нарушающих авторские, смежные или иные права интеллектуальной собственности третьих лиц (плагиат);</li>
                <li>Призывов к насилию, разжигания ненависти, дискриминации или вражды по какому-либо признаку;</li>
                <li>Клеветнических сведений, оскорблений человеческого достоинства и заведомо ложной информации;</li>
                <li>Спама, вредоносного кода и автоматизированного сбора данных (скрейпинга) без письменного разрешения Администрации.</li>
              </ul>
              <p>
                3.2. Редакция оставляет за собой право отклонять рукописи или удалять комментарии, нарушающие настоящие Условия или редакционную этику издания.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                4. Ограничение ответственности («As Is»)
              </h2>
              <p>
                4.1. Точки зрения и суждения, выраженные в авторских эссе и комментариях читателей, принадлежат исключительно их авторам и могут не совпадать с позицией Редакции.
              </p>
              <p>
                4.2. В соответствии с международной практикой цифровых сервисов Платформа предоставляется на условиях «как есть» (<em>«As Is»</em>). Администрация прилагает все разумные усилия для обеспечения высокой доступности и безопасности ресурса, но не несёт ответственности за косвенные убытки или временные перебои связи вне зоны её контроля.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                5. Применимое право и урегулирование споров
              </h2>
              <p>
                5.1. Настоящее Соглашение регулируется и толкуется в соответствии с общепризнанными принципами международного права и международных договоров в области интеллектуальной собственности и цифровых услуг.
              </p>
              <p>
                5.2. Все разногласия или претензии, связанные с работой Платформы или соблюдением авторских прав, разрешаются путём конструктивных переговоров в досудебном порядке. Обращения направляются через страницу{' '}
                <button
                  type="button"
                  onClick={() => onNavigatePage('contacts')}
                  className="text-[#C85D36] font-semibold underline cursor-pointer"
                >
                  «Контакты»
                </button>{' '}
                и рассматриваются Редакцией в течение 15 (пятнадцати) календарных дней.
              </p>
            </section>
          </div>
        </article>
      )}
    </div>
  );
}
