import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/inertia-react';
import { InertiaProgress } from '@inertiajs/progress';
import AppLayout from './Pages/Layouts/AppLayout';
import { ContextProvider } from './contexts/ContextProvider';
import { LanguageProvider } from './contexts/LanguageContext'; 

InertiaProgress.init();

createInertiaApp({
    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx');
        const page = pages[`./Pages/${name}.jsx`];

        if (!page) throw new Error(`Page not found: ./Pages/${name}.jsx`);

        const module = await page();
        const Component = module.default;

        Component.layout = Component.layout || ((page) => <AppLayout>{page}</AppLayout>);

        return Component;
    },

    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ContextProvider>
                <LanguageProvider>  
                    <App {...props} />
                </LanguageProvider>
            </ContextProvider>
        );
    }
});
