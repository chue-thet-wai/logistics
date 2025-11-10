import React, { useEffect } from 'react';
import { FiSettings } from "react-icons/fi";
import { Tooltip } from 'react-tooltip'; 
import { Navbar, Footer, Sidebar, ThemeSettings } from "../../components";
import remembered, { themeParams } from '../../contexts/remembered';
import { useStateContext } from '../../contexts/ContextProvider';
import useIsMobile from '@/utils/useIsMobile';

const AdminMain = ({ children }) => {
    const {
        activeMenu,
        setactiveMenu,
        themeSettings,
        setThemeSettings,
        currentColor,
        currentMode,
    } = useStateContext();
    const { themep, setThemep, setColor, setMode } = themeParams();
    const isMobile = useIsMobile(); 

    return (
        <div className={currentMode === 'Dark' ? 'dark' : ''}>
            <div className="flex relative dark:bg-main-dark-bg w-screen">

                {activeMenu ? (
                    <div className="w-64 fixed z-[1500] sidebar dark:bg-secondary-dark-bg bg-white">
                        <Sidebar />
                    </div>
                ) : (
                    <div className="w-0 dark:bg-secondary-dark-bg">
                        <Sidebar />
                    </div>
                )}

                <div
                className={`relative min-h-screen w-full 
                    ${isMobile ? 'bg-white' : 'dark:bg-main-dark-bg bg-main-bg'} 
                    ${activeMenu ? 'md:ml-64' : 'flex-2'}`}
                >
                    <div className="sticky top-0 bg-main-bg dark:bg-main-dark-bg navbar">
                        <Navbar />
                    </div>

                    <div className='mt-16'>
                        {themeSettings && <ThemeSettings />}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMain; 