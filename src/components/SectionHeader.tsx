import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  italicSubtitle?: string;
  title: string;
  id?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  italicSubtitle,
  title,
  id,
}) => {
  return (
    <div id={id} className="mb-3 sm:mb-4 scroll-mt-20 px-1 sm:px-0">
      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2F2B28] leading-snug">
        {title}
      </h1>
      {italicSubtitle && (
        <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5">
          {italicSubtitle}
        </p>
      )}
    </div>
  );
};
