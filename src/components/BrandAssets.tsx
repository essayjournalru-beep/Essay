import React from 'react';

interface BrandProps {
  className?: string;
  variant?: 'charcoal' | 'terracotta' | 'white';
}

/**
 * BrandWordmark: Renders the original unedited "site name.jpeg" brand lettering.
 * Matches user requirement: "1 пункт заменить логотип на изображение во вложении, изображение не редактируй, оставь полностью оригинальным."
 */
export const BrandWordmark: React.FC<BrandProps> = ({ className = 'h-8 sm:h-9' }) => {
  return (
    <img
      src="/site%20name2.png"
      alt="эссе"
      className={`${className} w-auto object-contain rounded-md select-none mix-blend-multiply dark:invert dark:mix-blend-screen transition-opacity`}
    />
  );
};

/**
 * BrandDropCap: Renders Logo.jpeg (light) and Logo2.jpeg (dark).
 */
export const BrandDropCap: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return <ThemeLogo className={className} />;
};

/**
 * ThemeLogo: Renders Logo.jpeg in light mode, and Logo2.jpeg in dark mode.
 */
export const ThemeLogo: React.FC<{ className?: string; alt?: string; title?: string }> = ({
  className = 'w-8 h-8',
  alt = 'Знак журнала ЭССЕ',
  title,
}) => {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`} title={title}>
      {/* Light theme: Logo.jpeg */}
      <img
        src="/Logo.jpeg"
        alt={alt}
        className="w-full h-full object-contain rounded-xl block dark:hidden select-none shadow-2xs"
      />
      {/* Dark theme: Logo2.jpeg */}
      <img
        src="/Logo2.jpeg"
        alt={alt}
        className="w-full h-full object-contain rounded-xl hidden dark:block select-none shadow-2xs"
      />
    </span>
  );
};

/**
 * ContentIcon: Renders content.svg for "Содержание" blocks.
 */
export const ContentIcon: React.FC<{ className?: string; alt?: string }> = ({
  className = 'w-5 h-5',
  alt = 'Содержание эссе',
}) => {
  return (
    <img
      src="/content.svg"
      alt={alt}
      className={`object-contain rounded-md shrink-0 select-none ${className}`}
    />
  );
};

