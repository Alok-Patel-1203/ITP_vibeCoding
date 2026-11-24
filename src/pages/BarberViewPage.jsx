import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  getBarbers, 
  getQueue, 
  getServices, 
  startService, 
  completeService, 
  callNextCustomer, 
  toggleBarberBreak 
} from '../services/queueService';
import { Lock, Play, CheckCircle2, Clock, Coffee, Scissors, Users, AlertCircle, ChevronRight, User } from 'lucide-react';

export default function BarberViewPage() {
  const { name = 'ravi' } = useParams();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const barberId = name.toLowerCase();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Real data state
  const [allBarbers, setAllBarbers] = useState(() => getBarbers());
  const [barber, setBarber] = useState(() => getBarbers().find(b => b.id.toLowerCase() === barberId) || getBarbers()[0]);
  const [queue, setQueue] = useState(() => getQueue());
  const [services, setServices] = useState(() => getServices());
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    const handleSync = () => {
      const freshBarbers = getBarbers();
      const freshQueue = getQueue();
      setAllBarbers(freshBarbers);
      setBarber(freshBarbers.find(b => b.id.toLowerCase() === barberId) || freshBarbers[0]);
      setQueue(freshQueue);
      setServices(getServices());
    };

    handleSync();
    window.addEventListener('salon_queue_update', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('salon_queue_update', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [barberId]);

  // Timer effect when in chair
  useEffect(() => {
    const currentCustomer = queue.find(q => q.token === barber?.currentCustomer);
    if (currentCustomer && currentCustomer.status === 'In chair') {
      const interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimerSeconds(0);
    }
  }, [barber?.currentCustomer, queue]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentCustomer = queue.find(q => q.token === barber?.currentCustomer && ['Called', 'In chair'].includes(q.status));
  const nextCustomerInLine = queue.find(
    q => q.status === 'Waiting' && (q.barberId === barberId || q.barberId === 'any')
  );

  const barberDisplayName = barber 
    ? (lang === 'gu' ? barber.nameGu : barber.name)
    : name.charAt(0).toUpperCase() + name.slice(1);

  const isOnBreak = barber?.status === 'on_break';

  const handleStart = () => {
    startService(barberId);
  };

  const handleDone = () => {
    // Complete active customer and automatically call the next eligible customer!
    completeService(barberId, true);
  };

  const handleCallNext = () => {
    callNextCustomer(barberId);
  };

  const handleToggleBreak = () => {
    toggleBarberBreak(barberId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <form onSubmit={handlePinSubmit} className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-gold-500/20 text-gold-400 mx-auto flex items-center justify-center border border-gold-500/40">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t('barber.title')}</h2>
            <p className="text-xs text-gold-400 font-semibold uppercase mt-0.5">{barberDisplayName}</p>
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
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      {/* 1. Quick Barber Station Switcher (Ravi, Amit, Imran) */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-3 shadow-md space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            {t('barber.switchStation')}
          </span>
          <span className="text-[10px] text-gold-400 font-semibold">
            {allBarbers.length} Stations Available
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {allBarbers.map((b) => {
            const isCurrent = b.id.toLowerCase() === barberId;
            const bName = lang === 'gu' ? b.nameGu || b.name : b.name;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => navigate(`/barber/${b.id}`)}
                className={`min-h-[48px] p-2 rounded-xl flex items-center space-x-2 border transition-all text-left ${
                  isCurrent
                    ? 'bg-charcoal-900 border-gold-500 ring-1 ring-gold-500/50 shadow-md'
                    : 'bg-charcoal-900/60 border-charcoal-700/80 hover:border-charcoal-600'
                }`}
              >
                <img
                  src={b.photo}
                  alt={b.name}
                  className="w-7 h-7 rounded-full object-cover border border-charcoal-600 flex-shrink-0"
                />
                <div className="overflow-hidden min-w-0 flex-1">
                  <span className={`text-xs font-bold block truncate ${isCurrent ? 'text-gold-400' : 'text-gray-200'}`}>
                    {bName}
                  </span>
                  <span className={`text-[9px] font-semibold block truncate ${
                    b.status === 'free' ? 'text-emerald-400' : b.status === 'busy' ? 'text-amber-400' : 'text-gray-400'
                  }`}>
                    {b.status === 'free' ? t('barbers.statusFree') : b.status === 'busy' ? t('barbers.statusBusy') : t('barbers.statusOnBreak')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Header: Stylist Profile & Break Toggle */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <img
            src={barber?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={barberDisplayName}
            className="w-11 h-11 rounded-full object-cover border-2 border-charcoal-700 shadow"
          />
          <div>
            <span className="text-base font-bold text-white block">{barberDisplayName}</span>
            <span className="text-xs text-gray-400 block">{t('barber.workstationFor')}</span>
          </div>
        </div>
        <button
          onClick={handleToggleBreak}
          className={`min-h-[44px] flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isOnBreak
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-charcoal-900 text-gray-300 border-charcoal-700 hover:border-gold-500/40'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>{isOnBreak ? t('barber.toggleAvailableBtn') : t('barber.toggleBreakBtn')}</span>
        </button>
      </div>

      {/* Main Chair Status Card */}
      <div className="bg-charcoal-800 border border-gold-500/40 rounded-2xl p-6 shadow-xl space-y-5 text-center relative overflow-hidden">
        <div className="text-xs font-bold uppercase tracking-wider text-gold-400">
          {t('barber.currentCustomerTitle')}
        </div>

        {currentCustomer ? (
          <>
            <div>
              <span className="text-4xl font-black text-white block">{currentCustomer.token}</span>
              <span className="text-lg font-bold text-gold-400 block mt-1">{currentCustomer.name}</span>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {currentCustomer.services.map((srvId) => {
                  const s = services.find(x => x.id === srvId);
                  const sName = s ? (lang === 'gu' ? s.nameGu : s.nameEn) : srvId;
                  const sDur = s ? s.duration : 30;
                  return (
                    <span key={srvId} className="text-[11px] px-2.5 py-0.5 rounded-full bg-charcoal-900 border border-charcoal-700 text-gray-300">
                      {sName} ({sDur}m)
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Status & Timer */}
            <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl py-3 px-4 inline-flex items-center space-x-2 text-gold-400">
              <Clock className="w-5 h-5 animate-pulse" />
              <span className="text-2xl font-mono font-bold tracking-widest">
                {currentCustomer.status === 'In chair' ? formatTimer(timerSeconds) : 'CALLED'}
              </span>
            </div>

            {/* Primary Action Button */}
            <div>
              {currentCustomer.status === 'Called' ? (
                <button
                  onClick={handleStart}
                  className="w-full min-h-[56px] h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-charcoal-950 font-black rounded-2xl text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{t('barber.startServiceBtn')}</span>
                </button>
              ) : (
                <button
                  onClick={handleDone}
                  className="w-full min-h-[56px] h-14 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-charcoal-950 font-black rounded-2xl text-base shadow-lg shadow-gold-500/20 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t('barber.completeServiceBtn')}</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="py-6 space-y-4">
            <span className="text-sm text-gray-400 block">{t('barber.noCustomerInChair')}</span>
            <button
              onClick={handleCallNext}
              disabled={!nextCustomerInLine || isOnBreak}
              className="w-full min-h-[50px] py-3.5 bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-charcoal-950 font-bold rounded-xl text-sm shadow transition-colors"
            >
              {nextCustomerInLine 
                ? `${t('barber.callNextCustomerBtn')} (${nextCustomerInLine.token})`
                : t('barber.noUpcomingCustomers')}
            </button>
          </div>
        )}
      </div>

      {/* Up Next for You Card */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-4 shadow-md space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {t('barber.upNextTitle')}
        </h3>
        {nextCustomerInLine ? (
          <div className="bg-charcoal-900/90 border border-charcoal-700 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-black text-gold-400">{nextCustomerInLine.token}</span>
              <div>
                <span className="text-xs font-bold text-white block">{nextCustomerInLine.name}</span>
                <span className="text-[11px] text-gray-400 block">
                  {nextCustomerInLine.services.map(sId => {
                    const s = services.find(x => x.id === sId);
                    return s ? (lang === 'gu' ? s.nameGu : s.nameEn) : sId;
                  }).join(', ')}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-gold-400 font-semibold bg-charcoal-800 px-2 py-1 rounded-md border border-charcoal-700">
              Next in line
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-2">
            {t('barber.noUpcomingCustomers')}
          </p>
        )}
      </div>
    </div>
  );
}
