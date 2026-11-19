import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getBarbers, getQueue, getServices } from '../services/queueService';
import { Clock, Volume2, VolumeX, Sparkles, Scissors } from 'lucide-react';

export default function WaitingAreaDisplayPage() {
  const { t, lang } = useLanguage();
  const [time, setTime] = useState(new Date());
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [flashingToken, setFlashingToken] = useState(null);

  const [barbers, setBarbers] = useState(() => getBarbers());
  const [queue, setQueue] = useState(() => getQueue());
  const [services, setServices] = useState(() => getServices());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const playSyntheticChime = () => {
    setIsAudioEnabled(true);
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio Context unlock required:', e);
    }
  };

  useEffect(() => {
    const handleSync = () => {
      const freshBarbers = getBarbers();
      const freshQueue = getQueue();
      setBarbers(freshBarbers);
      setQueue(freshQueue);
      setServices(getServices());

      // Detect recently called token to trigger flash & chime
      const latestCalled = freshQueue.find(q => q.status === 'Called');
      if (latestCalled) {
        setFlashingToken(latestCalled.token);
        if (isAudioEnabled) {
          playSyntheticChime();
        }
      }
    };

    window.addEventListener('salon_queue_update', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('salon_queue_update', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [isAudioEnabled]);

  // Next 5 waiting tokens
  const waitingCustomers = queue.filter(q => q.status === 'Waiting');
  const upNextTokens = waitingCustomers.slice(0, 5).map((item, index) => {
    const barberPref = barbers.find(b => b.id === item.barberId)?.name || 'Any';
    return {
      rank: index + 1,
      token: item.token,
      barber: barberPref,
      waitMins: Math.max((index + 1) * 10, 5),
    };
  });

  return (
    <div 
      onClick={playSyntheticChime}
      className="min-h-screen bg-charcoal-950 text-white p-6 lg:p-10 flex flex-col justify-between selection:bg-transparent cursor-pointer"
    >
      {/* TV Header Banner */}
      <div className="flex items-center justify-between border-b border-charcoal-700/80 pb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-charcoal-950 shadow-xl shadow-gold-500/20">
            <Scissors className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {t('common.salonName')}
            </h1>
            <span className="text-xs lg:text-sm font-semibold text-gold-400 uppercase tracking-widest block">
              {t('display.title')}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-xs text-gray-400 bg-charcoal-900 border border-charcoal-800 px-3.5 py-2 rounded-xl">
            {isAudioEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-amber-400" />
            )}
            <span>{isAudioEnabled ? 'Chime Active' : t('display.muteNotice')}</span>
          </div>

          <div className="text-right">
            <span className="text-2xl lg:text-3xl font-mono font-bold text-white block">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[11px] text-gray-400 uppercase font-semibold">
              {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Body: Now Serving Stations vs Next 5 Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 flex-1">
        {/* Left Side: Now Serving Barber Stations (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-extrabold text-gold-400 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-gold-400" />
              <span>{t('display.nowServingTitle')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 flex-1">
            {barbers.map((b) => {
              const currentCust = queue.find(q => q.token === b.currentCustomer && ['Called', 'In chair'].includes(q.status));
              const isFlashing = currentCust && currentCust.token === flashingToken;
              const barberName = lang === 'gu' ? b.nameGu : b.name;

              return (
                <div
                  key={b.id}
                  className={`rounded-3xl p-6 lg:p-8 flex items-center justify-between transition-all duration-500 border-2 ${
                    isFlashing
                      ? 'bg-gold-500/20 border-gold-400 shadow-2xl shadow-gold-500/40 animate-pulse'
                      : 'bg-charcoal-800/90 border-charcoal-700 shadow-xl'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs lg:text-sm font-bold text-gray-400 uppercase tracking-widest block">
                      {t('display.chairPrefix')} {b.chair} • {barberName}
                    </span>
                    <span className="text-xl lg:text-2xl font-bold text-white block">
                      {currentCust ? currentCust.name : 'Chair Available'}
                    </span>
                    <span className={`inline-block text-[11px] font-black px-2.5 py-0.5 rounded-full mt-1 border ${
                      currentCust?.status === 'Called'
                        ? 'bg-gold-500/20 text-gold-300 border-gold-500/40'
                        : currentCust?.status === 'In chair'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-gray-700/50 text-gray-400 border-gray-600'
                    }`}>
                      {currentCust ? currentCust.status.toUpperCase() : 'FREE'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-300 via-gold-400 to-gold-600 block tracking-tight">
                      {currentCust ? currentCust.token : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Up Next (Next 5 in line) (5 cols) */}
        <div className="lg:col-span-5 bg-charcoal-900 border border-charcoal-700/80 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-2xl">
          <div>
            <h2 className="text-lg lg:text-xl font-extrabold text-gray-200 uppercase tracking-wider mb-4 border-b border-charcoal-800 pb-3 flex items-center justify-between">
              <span>{t('display.upNextTitle')}</span>
              <span className="text-xs text-gold-400 font-bold">{waitingCustomers.length} Pending</span>
            </h2>

            <div className="space-y-3">
              {upNextTokens.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">
                  {t('display.emptyQueueTv')}
                </p>
              ) : (
                upNextTokens.map((item) => (
                  <div
                    key={item.token}
                    className="bg-charcoal-800/80 border border-charcoal-700 rounded-2xl p-4 flex items-center justify-between shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="w-8 h-8 rounded-xl bg-charcoal-900 text-gray-400 font-bold text-sm flex items-center justify-center border border-charcoal-700">
                        #{item.rank}
                      </span>
                      <div>
                        <span className="text-2xl font-black text-white tracking-wide block">
                          {item.token}
                        </span>
                        <span className="text-xs text-gray-400">
                          Stylist: <strong className="text-gold-400">{item.barber}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-300 block">
                        ~{item.waitMins} {t('common.mins')}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase">{t('display.estWaitHeader')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-charcoal-800 text-center">
            <p className="text-xs text-gray-500">
              {t('common.salonName')} • Live Queue Monitor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
