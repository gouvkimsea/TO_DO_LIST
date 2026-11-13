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
    <div id={id} className="text-center mb-2.5 sm:mb-3.5 scroll-mt-20">
      <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-1">
        <span className="h-[1px] w-6 sm:w-10 md:w-14 bg-[#D8C3B0] shrink-0" aria-hidden="true" />
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#B07B54]">
          {eyebrow}
        </span>
        <span className="h-[1px] w-6 sm:w-10 md:w-14 bg-[#D8C3B0] shrink-0" aria-hidden="true" />
      </div>
      <p className="font-serif-italic italic text-lg sm:text-2xl md:text-[28px] leading-tight text-[#9E6B47] mb-0.5">
        {italicSubtitle}
      </p>
      <h1
        className="font-serif-display font-extrabold text-2xl sm:text-3xl md:text-[40px] lg:text-[42px] tracking-[0.02em] text-[#2F2C2A] uppercase leading-[1.08] break-words"
        style={{ textWrap: 'balance' }}
      >
        {title}
      </h1>
    </div>
  );
};
