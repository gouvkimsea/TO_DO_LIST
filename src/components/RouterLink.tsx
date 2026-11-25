import React from 'react';
import { PagePath } from '../utils/todoLogic';

interface RouterLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: PagePath;
  currentPath?: PagePath;
  onNavigate: (path: PagePath) => void;
  activeClassName?: string;
}

export const RouterLink: React.FC<RouterLinkProps> = ({
  to,
  currentPath,
  onNavigate,
  className = '',
  activeClassName = '',
  onClick,
  children,
  ...rest
}) => {
  const isActive = currentPath === to;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey
    ) {
      return;
    }
    e.preventDefault();
    onNavigate(to);
  };

  return (
    <a
      href={to}
      aria-current={isActive ? 'page' : undefined}
      onClick={handleClick}
      className={`${className} ${isActive ? activeClassName : ''}`.trim()}
      {...rest}
    >
      {children}
    </a>
  );
};
