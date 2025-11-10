import React from 'react';
import { Link as InertiaLink } from '@inertiajs/inertia-react';

const Link = ({
  href,
  children,
  className = '',
  variant = 'primary',
  padding = 'px-2 py-2',
  rounded = 'rounded-lg',
  textColor = 'text-white',
  bgColor = 'bg-sidebar-color',
  hoverColor = 'hover:bg-sidebar-color',
  focusColor = 'focus:ring-sidebar-color',
  target = '_self', 
}) => {
  
  const baseStyles = `
    ${padding} 
    ${rounded} 
    ${bgColor} 
    ${textColor} 
    ${hoverColor} 
    ${focusColor} 
    focus:outline-none 
    focus:ring-2 
    focus:ring-offset-2 
    transition 
    ease-in-out 
    duration-150
    px-4
  `;

  return (
    <InertiaLink
      href={href}
      className={baseStyles +" "+ className}
      target={target}
    >
      {children}
    </InertiaLink>
  );
};

export default Link;
