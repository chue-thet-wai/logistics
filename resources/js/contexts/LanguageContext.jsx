import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {

    const [language, setLanguage] = useState('en');

    // ✅ load from localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem('language') || 'en';
        setLanguage(savedLang);
    }, []);

    // ✅ change language (flexible)
    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    // ✅ optional toggle (only EN ↔ TH)
    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'th' : 'en';
        changeLanguage(newLang);
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);