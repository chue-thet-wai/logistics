import React from 'react';

const Select = ({
  name,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select an option',
  className = '',
  borderColor = 'border-gray-300',
  focusColor = 'focus:ring-primary-theme-color',
  rounded = 'rounded-md',
  shadow = 'shadow-sm',
  disabled = false,
  error = '', 
}) => {
  const hasError = Boolean(error);

  const baseStyles = `
    w-full
    px-4 py-2
    border ${hasError ? 'border-red-500' : borderColor}
    ${rounded}
    ${shadow}
    focus:outline-none
    focus:ring-2
    ${hasError ? 'focus:ring-red-500' : focusColor}
    transition
    duration-150
    ease-in-out
  `;

  return (
    <div className="w-full">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={baseStyles + " " + className}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
