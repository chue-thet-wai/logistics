import React from 'react';

const FormWrapper = ({
    children,
    onSubmit,
    className = '',
    padding = 'p-6',          
    bgColor = 'bg-white',    
    rounded = 'rounded-lg',   
    shadow = 'shadow-[0_2px_10px_rgba(0,0,0,0.1)]',    
    spacing = 'space-y-4',    
}) => {
    return (
        <form
            onSubmit={onSubmit}
            className={`${bgColor} ${padding} ${rounded} ${shadow} ${spacing} ${className} `}
        >
            {children}
        </form>
    );
};

export default FormWrapper;
