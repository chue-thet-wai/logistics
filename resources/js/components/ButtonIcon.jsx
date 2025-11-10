import React from 'react';
import { Link } from '@inertiajs/inertia-react';

const ButtonIcon = ({
  href,
  onClick,
  icon,
  iconColor = 'text-gray-500',
  hoverColor = 'hover:text-gray-700',
  tooltip = '',
  size = 'md',
  shadow = false,
  variant = 'circle', // circle | icon
  ...props
}) => {

  const sizeClasses = {
    sm: variant === 'circle' ? 'w-6 h-6 p-1' : 'text-sm',
    md: variant === 'circle' ? 'w-8 h-8 p-2' : 'text-base',
    lg: variant === 'circle' ? 'w-10 h-10 p-3' : 'text-lg',
  };

  const baseStyles = `
    flex items-center justify-center
    ${variant === 'circle' ? 'rounded-full transition-all duration-200' : ''}
    ${sizeClasses[size]}
    ${iconColor}
    ${hoverColor}
    ${shadow && variant === 'circle' ? 'shadow-md hover:shadow-lg' : ''}
  `;

  const renderWithTooltip = (el) =>
    tooltip ? (
      <div className="relative group">
        {el}
        <span className="
          absolute bottom-7 left-1/2 -translate-x-1/2 text-xs text-white 
          bg-black px-1 py-1 rounded opacity-0 group-hover:opacity-100 
          transition-opacity duration-200
        ">
          {tooltip}
        </span>
      </div>
    ) : (
      el
    );

  if (href) {
    return renderWithTooltip(
      <Link href={href} className={baseStyles} {...props}>
        {icon}
      </Link>
    );
  }

  return renderWithTooltip(
    <button onClick={onClick} className={baseStyles} {...props}>
      {icon}
    </button>
  );
};

export default ButtonIcon;
