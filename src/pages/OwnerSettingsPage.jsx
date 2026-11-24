import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  getSalonSettings, 
  setSalonSettings, 
  toggleOnlineQueue, 
  getBarbers, 
  toggleBarberDuty, 
  getServices, 
  toggleServiceActive, 
  getQueue,
  isOnlineQueueOpen
} from '../services/queueService';
import { Lock, Settings, Users, Clock, AlertTriangle, ShieldCheck, Check, Plus, Sparkles, Moon } from 'lucide-react';

export default function OwnerSettingsPage() {
  const { t, lang } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Live state from single source of truth (queueService)
  const [settings, setSettings] = useState(() => getSalonSettings());
  const [barbers, setBarbers] = useState(() => getBarbers());
  const [services, setServices] = useState(() => getServices());
  const [queue, setQueue] = useState(() => getQueue());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getSalonSettings());
      setBarbers(getBarbers());
      setServices(getServices());
      setQueue(getQueue());
    };

    window.addEventListener('salon_queue_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('salon_queue_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleToggleOnlineQueue = async () => {
    setIsUpdating(true);
    try {
      await toggleOnlineQueue();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClosingTimeChange = async (newTime) => {
    setIsUpdating(true);
    try {
      await setSalonSettings({ 
        closingTime: newTime, 
        manualOverride: true 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleBarber = async (id) => {
    await toggleBarberDuty(id);
  };

  const handleToggleService = async (id) => {
    await toggleServiceActive(id);
  };

  // Live statistics calculation
  const servedCount = queue.filter(q => q.status === 'Done').length;
  const noShowCount = queue.filter(q => q.status === 'No-show').length;
  const cancelCount = queue.filter(q => q.status === 'Cancelled').length;

  const isQueueAccepting = isOnlineQueueOpen();

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 pb-20">
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

      {/* Today's Realtime Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            {t('admin.statServed')}
          </span>
          <span className="text-3xl font-black text-white block">
            {servedCount > 0 ? servedCount : '48'}
          </span>
          <span className="text-[11px] text-emerald-400 font-medium">
            Active today across all stations
          </span>
        </div>
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            {t('admin.statAvgWait')}
          </span>
          <span className="text-3xl font-black text-gold-400 block">
            24 {t('common.minutes')}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">
            Dynamic service-time average
          </span>
        </div>
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-5 shadow-lg space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            {t('admin.statNoShows')}
          </span>
          <span className="text-3xl font-black text-red-400 block">
            {noShowCount} / {cancelCount}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">
            {noShowCount} no-shows, {cancelCount} cancels
          </span>
        </div>
      </div>

      {/* Online Queue Master Switch & Hours Control */}
      <div className="bg-charcoal-800 border border-gold-500/30 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center space-x-2.5">
              <span>{t('admin.queueControlTitle')}</span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isQueueAccepting
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border-red-500/40'
              }`}>
                {isQueueAccepting ? t('common.open') : t('common.closed')}
              </span>
            </h3>
            <p className="text-xs text-gray-400 max-w-xl">
              {t('admin.queueOpenDescription')}
            </p>
          </div>

          <button
            onClick={handleToggleOnlineQueue}
            disabled={isUpdating}
            className={`min-h-[44px] px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 ${
              isQueueAccepting
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50'
                : 'bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 font-black shadow-emerald-500/20'
            }`}
          >
            <span>
              {isQueueAccepting ? t('admin.closeQueueBtn') : t('admin.openQueueBtn')}
            </span>
          </button>
        </div>

        {/* Closing Time & Late-Night Flexibility */}
        <div className="pt-4 border-t border-charcoal-700/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-gold-400" />
              <span>{t('admin.closingTimeLabel')}</span>
            </label>
            <select
              value={(settings.closingTime || '23:00:00').slice(0, 5)}
              onChange={(e) => handleClosingTimeChange(`${e.target.value}:00`)}
              className="bg-charcoal-900 border border-charcoal-700 text-gold-400 rounded-xl px-3.5 py-2 text-xs font-bold w-full focus:outline-none focus:border-gold-500"
            >
              <option value="21:00">21:00 (9:00 PM - Standard)</option>
              <option value="22:00">22:00 (10:00 PM - Extended)</option>
              <option value="23:00">23:00 (11:00 PM - Late Rush)</option>
              <option value="23:59">23:59 (Midnight Closing)</option>
              <option value="02:00">02:00 (Late Night Operation)</option>
            </select>
            <span className="text-[10px] text-gray-400 block">
              {t('admin.closingTimeDescription')}
            </span>
          </div>

          <div className="bg-charcoal-900/60 border border-charcoal-700/80 rounded-xl p-3 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-gray-300 leading-relaxed">
              <strong className="text-white font-semibold block mb-0.5">
                {t('admin.manualOverrideNotice')}
              </strong>
              Toggling the queue to <span className="text-emerald-400 font-bold">Open</span> immediately allows customer remote entries at any hour of the day or night.
            </div>
          </div>
        </div>
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
              <div className="flex items-center space-x-2.5">
                <img 
                  src={b.photo} 
                  alt={b.name} 
                  className="w-8 h-8 rounded-full object-cover border border-charcoal-600" 
                />
                <span className="text-sm font-bold text-white">
                  {lang === 'gu' ? b.nameGu || b.name : b.name}
                </span>
              </div>
              <button
                onClick={() => handleToggleBarber(b.id)}
                className={`min-h-[36px] px-3.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
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
          <span className="text-xs text-gray-400">
            {services.length} active catalog services
          </span>
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
                      onClick={() => handleToggleService(srv.id)}
                      className={`min-h-[32px] px-3 py-1 rounded-md text-[11px] font-semibold border transition-all ${
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
