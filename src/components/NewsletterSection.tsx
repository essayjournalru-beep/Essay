import { useState } from 'react';
import { Mail, CheckCircle2, Shield, Loader2 } from 'lucide-react';
import { Rubric } from '../types';
import { TranslationDictionary } from '../i18n/translations';

interface NewsletterSectionProps {
  rubrics: Rubric[];
  onSubscribe: (email: string, topics: string[]) => Promise<void> | void;
  isAlreadySubscribed?: boolean;
  t: TranslationDictionary;
}

export function NewsletterSection({
  rubrics,
  onSubscribe,
  t,
}: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['culture', 'philosophy', 'books']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubscribe(cleanEmail, selectedTopics);

      const rubricTitles = rubrics
        .filter((r) => selectedTopics.includes(r.id))
        .map((r) => r.title);

      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          topics: selectedTopics,
          rubricTitles,
        }),
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="newsletter-subscription-section"
      className="my-12 sm:my-16 rounded-3xl overflow-hidden relative bg-[#1E1915] text-[#F7F3EE] p-6 sm:p-10 lg:p-12 shadow-md border border-[#382F27]"
    >
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F5]/15 text-[#E5DACB] border border-[#E5DACB]/30 mb-4">
          <span>{t.newsletterBadge}</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 text-[#F7F3EE]">
          {t.subscribeTitle}
        </h2>

        <p className="text-sm sm:text-base text-[#DCD1C4] max-w-xl mx-auto font-normal leading-relaxed mb-8">
          {t.subscribeDesc}
        </p>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-[#FAF8F5]/10 border border-[#E5DACB]/30 text-center animate-fade-in space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#DE5A29] mx-auto mb-1" />
            <h4 className="text-lg font-bold text-white">Вы в списке читателей!</h4>
            <p className="text-xs text-[#DCD1C4]">
              {t.subscribedSuccess} Приветственное письмо отправлено на <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic Chips */}
            <div>
              <span className="block text-xs font-bold text-[#DCD1C4] mb-3">
                {t.interestedTopics}
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {rubrics.map((r) => {
                  const isChecked = selectedTopics.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleTopic(r.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#B84318] text-white shadow-xs'
                          : 'bg-[#FAF8F5]/15 text-[#DCD1C4] hover:bg-[#FAF8F5]/25 border border-white/10'
                      }`}
                    >
                      {r.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            )}

            {/* Email input & button */}
            <div className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
              <div className="relative w-full">
                <Mail className="w-4 h-4 text-[#B84318] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs bg-[#FAF8F5] text-[#16120F] placeholder:text-[#5C4F44] font-medium focus:outline-none focus:ring-2 focus:ring-[#B84318]"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#B84318] hover:bg-[#9E3510] disabled:opacity-60 text-white text-xs font-bold shrink-0 shadow-md transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSubmitting ? 'Отправка...' : t.subscribe}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#A89D92]">
              <Shield className="w-3.5 h-3.5 text-[#B84318]" />
              <span>{t.noSpam} Никаких спам-писем. Отписка в один клик.</span>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
