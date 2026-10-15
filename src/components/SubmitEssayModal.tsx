import React, { useState, useEffect } from 'react';
import { X, Feather, Send, CheckCircle2, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { Rubric, UserProfile } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import { submitEssayProposal } from '../services/firebaseService';
import { ThemeLogo, ContentIcon } from './BrandAssets';

interface SubmitEssayModalProps {
  isOpen: boolean;
  onClose: () => void;
  rubrics: Rubric[];
  currentUser?: UserProfile | null;
  t: TranslationDictionary;
}

export function SubmitEssayModal({
  isOpen,
  onClose,
  rubrics,
  currentUser,
  t,
}: SubmitEssayModalProps) {
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorContact, setAuthorContact] = useState('');
  const [title, setTitle] = useState('');
  const [rubricId, setRubricId] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill with user data if logged in
  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        setAuthorName(currentUser.name || '');
        setAuthorEmail(currentUser.email || '');
      }
      if (rubrics.length > 0 && !rubricId) {
        setRubricId(rubrics[0].id);
      }
      setIsSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen, currentUser, rubrics]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!authorName.trim() || !authorEmail.trim() || !title.trim() || !content.trim()) {
      setErrorMessage('Пожалуйста, заполните все обязательные поля (*).');
      return;
    }

    try {
      setIsSubmitting(true);

      const parsedTags = tags
        .split(/[,#\s]+/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await submitEssayProposal(
        {
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          authorContact: authorContact.trim() || undefined,
          title: title.trim(),
          rubricId: rubricId || (rubrics[0]?.id ?? 'culture'),
          synopsis: synopsis.trim(),
          content: content.trim(),
          tags: parsedTags,
        },
        currentUser?.id
      );

      setIsSuccess(true);
      // Reset form
      setTitle('');
      setSynopsis('');
      setContent('');
      setTags('');
      setAuthorContact('');
    } catch (err: any) {
      console.error('Error submitting essay proposal:', err);
      setErrorMessage(
        err?.message || 'Не удалось отправить заявку. Попробуйте еще раз или напишите на editor@essay.ru'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] dark:bg-[#1E1915] rounded-3xl border border-[#E2D3BE] dark:border-[#3D352E] shadow-2xl overflow-hidden my-8 z-10">
        {/* Header Bar */}
        <div className="px-6 py-5 bg-[#F4EFE6] dark:bg-[#241E1A] border-b border-[#E2D3BE] dark:border-[#3D352E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ThemeLogo className="w-10 h-10" />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                Предложить своё эссе
              </h3>
              <p className="text-[11px] text-[#4A4036] dark:text-[#D1C7BD]">
                Журнал «ЭССЕ» • Редакторский совет
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#E2D3BE]/60 dark:hover:bg-[#3D352E] text-[#4A4036] dark:text-[#D1C7BD] hover:text-[#C85D36] dark:hover:text-[#FAF7F2] transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#1F1914] dark:text-[#FAF7F2]">
                Рукопись принята к рассмотрению!
              </h4>
              <p className="text-xs sm:text-sm text-[#4A4036] dark:text-[#D1C7BD] max-w-md mx-auto leading-relaxed">
                Спасибо за доверие к журналу «ЭССЕ». Редакционная коллегия внимательно ознакомится с вашим материалом. Мы свяжемся с вами по указанному адресу электронной почты в течение 3–5 рабочих дней.
              </p>
              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#C85D36] hover:bg-[#B34E28] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Вернуться к чтению
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Guidelines Note */}
              <div className="p-4 rounded-2xl bg-[#F4EFE6] dark:bg-[#241E1A] border border-[#E2D3BE] dark:border-[#3D352E] text-xs text-[#4A4036] dark:text-[#D1C7BD] leading-relaxed flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#C85D36] shrink-0 mt-0.5" />
                <p className="m-0">
                  Мы публикуем авторские эссе, культурологические очерки и философские рассуждения. Главное для нас — глубина мысли, язык и оригинальность взгляда.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Author & Contacts Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5 uppercase tracking-wider">
                    Автор или псевдоним <span className="text-[#C85D36]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Например, Лев Шестов"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5 uppercase tracking-wider">
                    Email для ответа <span className="text-[#C85D36]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="author@example.com"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>
              </div>

              {/* Secondary contact & Rubric */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5 uppercase tracking-wider">
                    Telegram / телефон <span className="text-[10px] font-normal text-[#4A4036] dark:text-[#D1C7BD] lowercase">(необязательно)</span>
                  </label>
                  <input
                    type="text"
                    value={authorContact}
                    onChange={(e) => setAuthorContact(e.target.value)}
                    placeholder="@username"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5 uppercase tracking-wider">
                    Рубрика <span className="text-[#C85D36]">*</span>
                  </label>
                  <select
                    value={rubricId}
                    onChange={(e) => setRubricId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36] cursor-pointer"
                  >
                    {rubrics.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5 uppercase tracking-wider">
                  Название эссе <span className="text-[#C85D36]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Заголовок будущего эссе"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                />
              </div>

              {/* Synopsis */}
              <div>
                <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5 uppercase tracking-wider">
                  Краткая идея / синопсис
                </label>
                <textarea
                  rows={2}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="В чём главный тезис или вопрос, который вы исследуете?"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                />
              </div>

              {/* Content / Full text or link */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] uppercase tracking-wider flex items-center gap-1.5">
                    <ContentIcon className="w-4 h-4" />
                    <span>Содержание эссе / текст рукописи</span>
                    <span className="text-[#C85D36]">*</span>
                  </label>
                  <span className="text-[10px] text-[#4A4036] dark:text-[#D1C7BD]">
                    Google Docs / Notion / Telegraph или полный текст
                  </span>
                </div>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Вставьте полный текст рукописи или ссылку с открытым доступом для чтения..."
                  className="w-full text-xs font-serif leading-relaxed px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-[#1F1914] dark:text-[#FAF7F2] mb-1.5 uppercase tracking-wider">
                  Ключевые темы и теги <span className="text-[10px] font-normal text-[#4A4036] dark:text-[#D1C7BD] lowercase">(через запятую)</span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="культура, память, философия, литература"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1613] border border-[#E2D3BE] dark:border-[#3D352E] text-[#1F1914] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C85D36]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2D3BE]/60 dark:border-[#3D352E]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#4A4036] dark:text-[#D1C7BD] hover:bg-[#E2D3BE]/40 dark:hover:bg-[#2C241E] transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#C85D36] hover:bg-[#B34E28] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Отправка рукописи...' : 'Отправить в редакцию'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
