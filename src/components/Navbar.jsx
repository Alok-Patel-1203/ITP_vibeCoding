import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Scissors, Globe, Menu, X, Monitor, ShieldCheck, UserCheck, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { lang, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide standard navbar on the dedicated full-screen TV display route
  const isDisplayRoute = location.pathname.startsWith('/display');

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/join', label: t('nav.join') },
    { to: '/status/S-14', label: t('nav.status') },
    { to: '/reception', label: t('nav.reception') },
    { to: '/barber/ravi', label: t('nav.barber') },
    { to: '/display', label: t('nav.display') },
    { to: '/admin', label: t('nav.admin') },
  ];

  if (isDisplayRoute) {
    return (
      <header className="fixed top-2 right-2 z-50 flex items-center space-x-2 bg-charcoal-800/80 backdrop-blur border border-charcoal-700/80 rounded-full px-3 py-1 shadow-lg">
        <Link 
          to="/" 
          className="text-xs text-gray-400 hover:text-gold-400 transition-colors"
        >
          {t('common.backToHome')}
        </Link>
        <span className="text-charcoal-600">|</span>
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-1 text-xs font-semibold text-gold-500 hover:text-gold-400"
        >
          <Globe className="w-3 h-3" />
          <span>{lang === 'en' ? 'ગુજરાતી' : 'English'}</span>
        </button>
      </header>
    );
  }

  return (
    <nav className="sticky top-0 z-40 bg-charcoal-800/95 backdrop-blur-md border-b border-charcoal-700/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 text-charcoal-900" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-gray-100 tracking-tight block">
                {t('common.salonName')}
              </span>
              <span className="text-[10px] text-gold-400 uppercase tracking-widest block font-medium">
                {t('common.tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-charcoal-700/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Controls: Language Switcher & Mobile Menu Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-charcoal-900/80 hover:bg-charcoal-700 border border-gold-500/40 text-gold-400 hover:text-gold-300 text-xs font-semibold shadow transition-all active:scale-95"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-gold-500" />
              <span>{lang === 'en' ? 'ગુજરાતી' : 'English'}</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-charcoal-900/60 text-gray-300 hover:text-white border border-charcoal-700 focus:outline-none"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-charcoal-800 border-b border-charcoal-700 px-4 pt-2 pb-4 space-y-1 shadow-2xl animate-in slide-in-from-top-2">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">
            {t('nav.switchView')}
          </div>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
                    : 'text-gray-300 hover:bg-charcoal-700/70'
                }`}
              >
                <span>{link.label}</span>
                <span className="text-xs text-charcoal-500">{link.to}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
