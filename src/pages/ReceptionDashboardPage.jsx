import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  getBarbers, 
  getQueue, 
  getServices, 
  callNextCustomer, 
  cancelSpot, 
  joinQueue, 
  isOnlineQueueOpen 
} from '../services/queueService';
import { Lock, Plus, Users, Clock, Scissors, AlertCircle, Phone, X, Check, User } from 'lucide-react';

export default function ReceptionDashboardPage() {
  const { t, lang } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInService, setWalkInService] = useState('haircut');
  const [walkInBarber, setWalkInBarber] = useState('any');
  const [walkInError, setWalkInError] = useState('');

  // Queue and Barbers real state
  const [barbers, setBarbers] = useState(() => getBarbers());
  const [queue, setQueue] = useState(() => getQueue());
  const [services, setServices] = useState(() => getServices());

  useEffect(() => {
    const handleSync = () => {
      setBarbers(getBarbers());
      setQueue(getQueue());
      setServices(getServices());
    };

    window.addEventListener('salon_queue_update', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('salon_queue_update', handleSync);
      window.removeEventListener('storage', handleSync);
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

  const handleCallNext = (barberId) => {
    callNextCustomer(barberId);
  };

  const handleCancel = (token) => {
    cancelSpot(token);
  };

  const handleWalkInSubmit = (e) => {
    e.preventDefault();
    setWalkInError('');
    try {
      joinQueue({
        name: walkInName,
        phone: walkInPhone,
        serviceIds: [walkInService],
        barberId: walkInBarber,
      });
      setWalkInName('');
      setWalkInPhone('');
      setShowWalkInModal(false);
    } catch (err) {
      setWalkInError(err.message || 'Error adding walk-in customer');
    }
  };

  const waitingCustomers = queue.filter(q => q.status === 'Waiting');
  const inChairCount = queue.filter(q => ['Called', 'In chair'].includes(q.status)).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <form onSubmit={handlePinSubmit} className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-gold-500/20 text-gold-400 mx-auto flex items-center justify-center border border-gold-500/40">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t('reception.title')}</h2>
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
            className="w-full min-h-[44px] py-3 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold rounded-xl text-sm transition-colors"
          >
            {t('common.submit')}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Reception Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal-800 border border-charcoal-700 rounded-2xl p-4 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <span>{t('reception.title')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Staff Mode
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {waitingCustomers.length} waiting • {inChairCount} in chair / called
          </p>
        </div>
        <button
          onClick={() => setShowWalkInModal(true)}
          className="min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-charcoal-900 font-bold rounded-xl text-sm shadow flex items-center justify-center space-x-2 self-start sm:self-auto transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('reception.addWalkInBtn')}</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stylist Chairs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
              {t('reception.barbersTitle')}
            </h2>
            <Scissors className="w-4 h-4 text-gold-500" />
          </div>

          <div className="space-y-3">
            {barbers.map((b) => {
              const currentCust = queue.find(q => q.token === b.currentCustomer && ['Called', 'In chair'].includes(q.status));
              const barberName = lang === 'gu' ? b.nameGu : b.name;

              return (
                <div
                  key={b.id}
                  className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-4 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={b.photo}
                        alt={b.name}
                        className="w-10 h-10 rounded-xl object-cover border border-charcoal-700"
                      />
                      <div>
                        <span className="text-sm font-bold text-white block">{barberName}</span>
                        <span className="text-[11px] text-gray-400 block">
                          Chair {b.chair} • {b.status === 'busy' ? t('reception.chairOccupied') : b.status === 'on_break' ? t('barbers.statusOnBreak') : t('reception.chairAvailable')}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      b.status === 'busy'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : b.status === 'on_break'
                        ? 'bg-gray-500/20 text-gray-400 border-gray-600/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}>
                      {b.status === 'busy' ? 'OCCUPIED' : b.status === 'on_break' ? 'BREAK' : 'FREE'}
                    </span>
                  </div>

                  {currentCust ? (
                    <div className="bg-charcoal-900/90 border border-charcoal-700 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gold-400 block">{currentCust.token} • {currentCust.name}</span>
                        <span className="text-[11px] text-gray-400">
                          {currentCust.services.map(sId => services.find(s => s.id === sId)?.nameEn || sId).join(', ')}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-charcoal-800 px-2.5 py-1 rounded-md border border-charcoal-700">
                        {currentCust.status.toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleCallNext(b.id)}
                      disabled={b.status === 'on_break'}
                      className="w-full min-h-[44px] py-2.5 bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-charcoal-900 font-bold rounded-xl text-xs transition-colors shadow"
                    >
                      {t('reception.callNextBtn')} ({b.name})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Waiting Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
              {t('reception.waitingQueueTitle')}
            </h2>
            <span className="text-xs text-gold-400 font-semibold">
              {waitingCustomers.length} Waiting
            </span>
          </div>

          <div className="space-y-2.5">
            {waitingCustomers.length === 0 ? (
              <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-8 text-center text-gray-400 text-xs">
                {t('reception.emptyWaitingList')}
              </div>
            ) : (
              waitingCustomers.map((item, index) => {
                const srvText = item.services.map(sId => services.find(s => s.id === sId)?.nameEn || sId).join(', ');
                const barberPref = barbers.find(b => b.id === item.barberId)?.name || 'Any';

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl p-4 border bg-charcoal-800 border-charcoal-700 shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-black text-gold-400">{item.token}</span>
                          <span className="text-sm font-bold text-white">{item.name}</span>
                          <span className="text-[10px] text-gray-400">({item.phone})</span>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center space-x-3">
                          <span>{srvText}</span>
                          <span>•</span>
                          <span>Pref: <strong className="text-gold-400">{barberPref}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleCancel(item.token)}
                          className="min-h-[36px] px-3 py-1.5 bg-charcoal-900 hover:bg-red-950/40 text-red-400 rounded-lg text-xs border border-charcoal-700 hover:border-red-500/40 transition-colors"
                        >
                          {t('reception.cancelBtn')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Walk-in Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleWalkInSubmit} className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {t('reception.addWalkInModalTitle')}
              </h3>
              <button type="button" onClick={() => setShowWalkInModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {walkInError && (
              <p className="text-xs text-red-400 bg-red-950/50 p-2 rounded-lg border border-red-800">
                {walkInError}
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder={t('join.fullNamePlaceholder')}
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Phone (10 Digits)</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('join.phonePlaceholder')}
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Service</label>
                  <select
                    value={walkInService}
                    onChange={(e) => setWalkInService(e.target.value)}
                    className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.nameEn} (₹{s.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Barber</label>
                  <select
                    value={walkInBarber}
                    onChange={(e) => setWalkInBarber(e.target.value)}
                    className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="any">Any (Fastest)</option>
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWalkInModal(false)}
                className="min-h-[44px] px-4 py-2 bg-charcoal-800 text-gray-300 rounded-xl text-xs font-semibold"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 bg-gold-500 hover:bg-gold-400 text-charcoal-900 rounded-xl text-xs font-bold"
              >
                {t('common.confirm')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
