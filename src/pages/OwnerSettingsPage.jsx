import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Lock, Settings, Users, Clock, AlertTriangle, ShieldCheck, Check, Plus } from 'lucide-react';

export default function OwnerSettingsPage() {
  const { t, lang } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [onlineQueueOpen, setOnlineQueueOpen] = useState(true);

  const [barbers, setBarbers] = useState([
    { id: 'ravi', name: 'Ravi', onDuty: true },
    { id: 'amit', name: 'Amit', onDuty: true },
    { id: 'kunal', name: 'Kunal', onDuty: false },
  ]);

  const [services, setServices] = useState([
    { id: 1, nameEn: 'Haircut', nameGu: 'હેરકટ', duration: 30, price: 150, active: true },
    { id: 2, nameEn: 'Beard Trim', nameGu: 'દાઢી ટ્રીમ', duration: 15, price: 80, active: true },
    { id: 3, nameEn: 'Hair Spa', nameGu: 'હેર સ્પા', duration: 45, price: 400, active: true },
    { id: 4, nameEn: 'Royal Shave', nameGu: 'રોયલ શેવ', duration: 20, price: 100, active: true },
  ]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const toggleBarber = (id) => {
    setBarbers(barbers.map(b => b.id === id ? { ...b, onDuty: !b.onDuty } : b));
  };

  const toggleService = (id) => {
    setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <form onSubmit={handlePinSubmit} className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-gold-500/20 text-gold-400 mx-auto flex items-center justify-center border border-gold-500/40">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t('admin.title')}</h2>
            <p className="text-xs text-gray-400 mt-1">{t('common.pinProtected')}</p>
          </div>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN (1234)"
            className="w-full text-center tracking-widest text-xl font-bold bg-charcoal-900 border border-charcoal-700 rounded-xl py-3 text-gold-400 focus:outline-none focus:border-gold-500"
          />
          {pinError && (
            <p className="text-xs text-red-400">{t('common.incorrectPin')}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold rounded-xl text-sm transition-colors"
          >
            {t('common.submit')}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-gold-500" />
            <span>{t('admin.title')}</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {t('common.salonName')} • Master Management Panel
          </p>
        </div>
      </div>

      {/* Today's Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            {t('admin.statServed')}
          </span>
          <span className="text-3xl font-black text-white block">48</span>
          <span className="text-[11px] text-emerald-400 font-medium">↑ +12% from last weekend</span>
        </div>
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            {t('admin.statAvgWait')}
          </span>
          <span className="text-3xl font-black text-gold-400 block">24 {t('common.mins')}</span>
          <span className="text-[11px] text-gray-400 font-medium">Target: under 30 mins</span>
        </div>
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            {t('admin.statNoShows')}
          </span>
          <span className="text-3xl font-black text-red-400 block">3 / 2</span>
          <span className="text-[11px] text-gray-400 font-medium">3 no-shows, 2 user cancels</span>
        </div>
      </div>

      {/* Online Queue Master Switch */}
      <div className="bg-charcoal-800 border border-gold-500/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>{t('admin.queueControlTitle')}</span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              onlineQueueOpen
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-red-500/20 text-red-400 border-red-500/40'
            }`}>
              {onlineQueueOpen ? t('common.open') : t('common.closed')}
            </span>
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            {t('admin.queueOpenDescription')}
          </p>
        </div>
        <button
          onClick={() => setOnlineQueueOpen(!onlineQueueOpen)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow transition-all ${
            onlineQueueOpen
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50'
              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50'
          }`}
        >
          {onlineQueueOpen ? 'Close Online Queue' : 'Open Online Queue'}
        </button>
      </div>

      {/* Barbers On Duty */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          {t('admin.barbersOnDutyTitle')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {barbers.map((b) => (
            <div
              key={b.id}
              className="bg-charcoal-900 border border-charcoal-700 rounded-xl p-3.5 flex items-center justify-between"
            >
              <span className="text-sm font-bold text-white">{b.name}</span>
              <button
                onClick={() => toggleBarber(b.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                  b.onDuty
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}
              >
                {b.onDuty ? t('admin.onDutySwitch') : t('admin.offDutySwitch')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Services Catalog */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
            {t('admin.servicesTitle')}
          </h3>
          <button className="text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center space-x-1">
            <Plus className="w-4 h-4" />
            <span>{t('admin.addServiceBtn')}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-900/80 text-gray-400 uppercase tracking-wider border-b border-charcoal-700">
              <tr>
                <th className="py-3 px-4">{t('admin.serviceNameEnCol')}</th>
                <th className="py-3 px-4">{t('admin.serviceNameGuCol')}</th>
                <th className="py-3 px-4">{t('admin.durationCol')}</th>
                <th className="py-3 px-4">{t('admin.priceCol')}</th>
                <th className="py-3 px-4 text-right">{t('admin.activeCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-700/60 text-gray-200">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-charcoal-900/40">
                  <td className="py-3 px-4 font-semibold text-white">{srv.nameEn}</td>
                  <td className="py-3 px-4 text-gray-300">{srv.nameGu}</td>
                  <td className="py-3 px-4">{srv.duration} {t('common.minutes')}</td>
                  <td className="py-3 px-4 text-gold-400 font-bold">{t('common.currency')}{srv.price}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleService(srv.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                        srv.active
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-charcoal-900 text-gray-500 border-charcoal-700'
                      }`}
                    >
                      {srv.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
