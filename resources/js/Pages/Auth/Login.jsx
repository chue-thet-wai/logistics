import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import useIsMobile from '@/utils/useIsMobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/lang';

const Login = () => {
    const isMobile = useIsMobile();

    const { language } = useLanguage();
    const t = translations[language];

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        Inertia.post('/login', formData, {
            onError: (backendErrors) => {
                setErrors(backendErrors);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
            },
        });
    };

    const renderForm = () => (
        <form onSubmit={handleSubmit} className="w-full">

            {/* EMAIL */}
            <div className="relative mb-4">
                <FiUser className="absolute left-3 top-3 text-gray-400 text-lg" />
                <input
                    type="email"
                    name="email"
                    placeholder={t.enter_username || "Enter username"}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-700"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div className="relative mb-4">
                <FiLock className="absolute left-3 top-3 text-gray-400 text-lg" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder={t.enter_password || "Enter password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-700"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* REMEMBER */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="remember"
                        checked={formData.remember}
                        onChange={handleChange}
                        className="accent-blue-600"
                    />
                    <span>{t.remember || "Remember Me"}</span>
                </label>
            </div>

            {/* BUTTON */}
            <button
                type="submit"
                disabled={processing}
                className={`w-full py-2 text-white bg-blue-600 rounded-lg font-semibold tracking-wide hover:bg-blue-700 transition ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                {processing ? (t.logging_in || "Logging in...") : (t.login || "Login")}
            </button>

            {/* FORGOT 
            <div className="flex items-center justify-between text-sm text-gray-600 mt-4 mb-6">
                <a href="/forgot-password" className="text-blue-600 hover:underline">
                    {t.forgot_password || "Forgot Password?"}
                </a>
            </div>*/}
        </form>
    );

    const renderMobileView = () => (
        <div className="flex flex-col justify-center items-center bg-white min-h-screen px-4">
            <div className="w-full max-w-sm mx-auto">

                <div className="flex justify-center mb-10">
                    <img src="/superlight.png" alt="Logo" className="w-20 h-20 object-contain" />
                </div>

                {renderForm()}
            </div>

            <div className="absolute bottom-4 w-full text-center text-gray-400 text-xs">
                <span className="font-semibold text-gray-500">
                    © Super Light Logistics 2025
                </span>
            </div>
        </div>
    );

    const renderDesktopView = () => (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">

            <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl">

                <div className="flex justify-center mb-12">
                    <img src="/superlight.png" alt="Logo" className="w-24 h-24 object-contain" />
                </div>

                {renderForm()}
            </div>

            <div className="absolute bottom-4 w-full text-center text-gray-400 text-xs">
                <span className="font-semibold text-gray-500">
                    © Super Light Logistics 2025
                </span>
            </div>
        </div>
    );

    return isMobile ? renderMobileView() : renderDesktopView();
};

export default Login;