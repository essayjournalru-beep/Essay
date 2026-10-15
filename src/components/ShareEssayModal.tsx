import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Share2,
  X,
  Send,
  MessageCircle,
  Twitter,
  Linkedin,
  Mail,
  Copy,
  Check,
  Link2,
} from 'lucide-react';
import { Article } from '../types';

interface ShareEssayModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareEssayModal({ article, isOpen, onClose }: ShareEssayModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !article || typeof document === 'undefined') return null;

  const directUrl = `${window.location.origin}${window.location.pathname}?essay=${encodeURIComponent(
    article.id
  )}`;
  const shareTitle = `«${article.title}» — ${article.author.name} | Литературный журнал «ЭССЕ»`;
  const shareText = `${article.title} — авторское эссе в журнале «ЭССЕ»`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(directUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = directUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  const openAppWindow = (url: string, isMailto?: boolean) => {
    if (isMailto) {
      window.location.href = url;
      onClose();
      return;
    }
    const width = 620;
    const height = 540;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = Math.max(0, Math.round((window.screen.height - height) / 2));
    window.open(
      url,
      'ShareEssayAppWindow',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes,noopener,noreferrer`
    );
    onClose();
  };

  const apps = [
    {
      name: 'Telegram',
      url: `https://t.me/share/url?url=${encodeURIComponent(directUrl)}&text=${encodeURIComponent(shareTitle)}`,
      badgeBg: 'bg-[#2AABEE]',
      icon: <Send className="w-5 h-5" />,
    },
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${directUrl}`)}`,
      badgeBg: 'bg-[#25D366]',
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      name: 'ВКонтакте',
      url: `https://vk.com/share.php?url=${encodeURIComponent(directUrl)}&title=${encodeURIComponent(shareTitle)}`,
      badgeBg: 'bg-[#0077FF]',
      icon: <span className="font-extrabold text-sm tracking-tight">VK</span>,
    },
    {
      name: 'Одноклассники',
      url: `https://connect.ok.ru/offer?url=${encodeURIComponent(directUrl)}&title=${encodeURIComponent(shareTitle)}`,
      badgeBg: 'bg-[#EE8208]',
      icon: <span className="font-extrabold text-sm tracking-tight">OK</span>,
    },
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(directUrl)}&text=${encodeURIComponent(shareTitle)}`,
      badgeBg: 'bg-[#1F1914] dark:bg-[#3A322B]',
      icon: <Twitter className="w-5 h-5" />,
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(directUrl)}`,
      badgeBg: 'bg-[#0A66C2]',
      icon: <Linkedin className="w-5 h-5" />,
    },
    {
      name: 'Gmail',
      url: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nПрямая ссылка на эссе:\n${directUrl}`)}`,
      badgeBg: 'bg-[#EA4335]',
      icon: <span className="font-bold text-sm">M</span>,
    },
    {
      name: 'Почта (Email)',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nЧитать эссе по прямой ссылке:\n${directUrl}`)}`,
      badgeBg: 'bg-[#C85D36]',
      icon: <Mail className="w-5 h-5" />,
      isMailto: true,
    },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 gap-3"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      {/* 1. Separate Window with Applications */}
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#FAF7F2] dark:bg-[#221D19] border border-[#E2D3BE] dark:border-[#3D352E] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#F4EFE6] dark:bg-[#1A1613] border-b border-[#E2D3BE] dark:border-[#3D352E] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#C85D36]/15 text-[#C85D36] flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-[#1F1914] dark:text-[#FAF7F2] leading-tight">
                Поделиться в приложении
              </h3>
              <p className="text-[11px] text-[#6B625B] dark:text-[#9E9388] truncate">
                «{article.title}»
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C827A] hover:text-[#1F1914] dark:hover:text-[#FAF7F2] hover:bg-[#E2D3BE]/40 dark:hover:bg-[#2F2722] transition-colors cursor-pointer shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid of Applications */}
        <div className="p-5 grid grid-cols-4 gap-3 sm:gap-4">
          {apps.map((app) => (
            <button
              key={app.name}
              type="button"
              onClick={() => openAppWindow(app.url, app.isMailto)}
              className="flex flex-col items-center justify-center gap-2 p-2.5 rounded-2xl hover:bg-[#F4EFE6] dark:hover:bg-[#2C2520] border border-transparent hover:border-[#E2D3BE] dark:hover:border-[#3D352E] transition-all group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${app.badgeBg} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
              >
                {app.icon}
              </div>
              <span className="text-[11px] font-semibold text-[#1F1914] dark:text-[#FAF7F2] text-center leading-tight line-clamp-1">
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Separate Window / Bar for Direct Link Copy */}
      <div
        className="w-full max-w-md rounded-2xl bg-[#FAF7F2] dark:bg-[#221D19] border border-[#E2D3BE] dark:border-[#3D352E] shadow-xl px-4 py-3 flex items-center justify-between gap-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 bg-[#F4EFE6] dark:bg-[#1A1613] px-3 py-2 rounded-xl border border-[#E2D3BE] dark:border-[#3D352E]">
          <Link2 className="w-4 h-4 text-[#C85D36] shrink-0" />
          <span className="text-xs font-mono text-[#4A4036] dark:text-[#D1C7BD] truncate">
            {directUrl}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#C85D36] hover:bg-[#B34E28] text-white transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Скопировано!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Копировать ссылку</span>
            </>
          )}
        </button>
      </div>
    </div>,
    document.body
  );
}
