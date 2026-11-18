import React from 'react';

interface SectionHeaderProps {
  eyebrow: string;
  italicSubtitle: string;
  title: string;
  id?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  italicSubtitle,
  title,
  id,
}) => {
  return (
    <div id={id} className="text-center mb-2.5 sm:mb-3.5 scroll-mt-20 px-1">
      <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-1">
        <span
          className="h-[1px] w-4 sm:w-10 md:w-14 bg-[#D8C3B0] shrink-0"
          aria-hidden="true"
        />
        <span className="text-[9.5px] sm:text-[11px] font-bold tracking-[0.16em] sm:tracking-[0.25em] uppercase text-[#B07B54]">
          {eyebrow}
        </span>
        <span
          className="h-[1px] w-4 sm:w-10 md:w-14 bg-[#D8C3B0] shrink-0"
          aria-hidden="true"
        />
      </div>
      <p
        className="font-serif-italic italic leading-tight text-[#9E6B47] mb-0.5"
        style={{ fontSize: 'clamp(1.05rem, 2.8vw, 1.75rem)' }}
      >
        {italicSubtitle}
      </p>
      <h1
        className="font-serif-display font-extrabold tracking-[0.02em] text-[#2F2C2A] uppercase leading-[1.1] break-words"
        style={{
          fontSize: 'clamp(1.3rem, 4.2vw, 2.625rem)',
          textWrap: 'balance',
        }}
      >
        {title}
      </h1>
    </div>
  );
};
