import React from 'react';

const Button = ({
  type = 'button',
  onClick,
  children,
  className = '',
  variant = 'primary', 
  padding = 'px-6 py-2',
  rounded = 'rounded-lg',
  shadow = 'shadow-md',
  textColor = '', 
  bgColor = '',
  hoverColor = '',
  focusColor = 'focus:ring-primary-theme-color',
  disabled = false,  // Add disabled prop
  ...props
}) => {
  
  const variantStyles = {
    primary: {
      bgColor: 'bg-sidebar-color',
      textColor: 'text-white', 
      hoverColor: 'hover:bg-sidebar-color',
    },
    secondary: {
      bgColor: 'bg-gray-300',
      textColor: 'text-gray-900', 
      hoverColor: 'hover:bg-gray-400',
    },
  };

  const { bgColor: defaultBgColor, textColor: defaultTextColor, hoverColor: defaultHoverColor } = variantStyles[variant];

  const finalBgColor = bgColor || defaultBgColor;
  const finalTextColor = textColor || defaultTextColor;
  const finalHoverColor = hoverColor || defaultHoverColor;

  const disabledStyles = disabled
    ? 'bg-gray-400 text-gray-600 cursor-not-allowed hover:bg-gray-400'
    : '';

  const baseStyles = `
    flex items-center justify-center
    ${padding}
    ${rounded}
    ${shadow}
    ${finalBgColor}
    ${finalTextColor}
    ${finalHoverColor}
    ${focusColor}
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    transition
    ease-in-out
    duration-150
    ${disabledStyles} 
  `;

  return (
    <button
      type={type}
      onClick={disabled ? null : onClick}  
      className={baseStyles + " " + className}
      disabled={disabled}  
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
