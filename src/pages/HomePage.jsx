import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  getHomeQueueMetrics, 
  getBarbers, 
  isOnlineQueueOpen, 
  getActiveUserTokenId 
} from '../services/queueService';
import { 
  Users, 
  Clock, 
  Scissors, 
  Sparkles, 
  ChevronRight, 
  Ticket, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const { t, lang } = useLanguage();
  const [metrics, setMetrics] = useState(getHomeQueueMetrics());
  const [barbers, setBarbers] = useState(getBarbers());
  const [isOpen, setIsOpen] = useState(isOnlineQueueOpen());
  const [activeTokenId, setActiveTokenId] = useState(getActiveUserTokenId());

  useEffect(() => {
    const handleUpdate = () => {
      setMetrics(getHomeQueueMetrics());
      setBarbers(getBarbers());
      setIsOpen(isOnlineQueueOpen());
      setActiveTokenId(getActiveUserTokenId());
    };

    window.addEventListener('salon_queue_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('salon_queue_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'free':
        return {
          label: t('barbers.statusFree'),
          cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        };
      case 'busy':
        return {
          label: t('barbers.statusBusy'),
          cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        };
      case 'on_break':
      default:
        return {
          label: t('barbers.statusOnBreak'),
          cls: 'bg-gray-500/15 text-gray-400 border-gray-600/30'
        };
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-10 space-y-5">
      {/* 1. Salon Operational Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t('home.statusBadge')}</span>
        </div>
      </div>

      {/* 2. Salon Branding Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-xl shadow-gold-500/20 text-charcoal-900 mb-1">
          <Scissors className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('common.salonName')}
        </h1>
        <p className="text-xs text-gray-400 max-w-xs mx-auto">
          {t('home.subtitle')}
        </p>
      </div>

      {/* Active Spot Reminder Banner (if user already joined) */}
      {activeTokenId && (
        <div className="bg-gradient-to-r from-gold-500/20 via-gold-500/10 to-charcoal-800 border border-gold-500/50 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500 text-charcoal-900 flex items-center justify-center font-black text-sm">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {t('home.activeSpotBannerTitle')}
              </span>
              <span className="text-[11px] text-gold-400 font-mono font-bold block">
                {activeTokenId}
              </span>
            </div>
          </div>
          <Link
            to={`/status/${activeTokenId}`}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-charcoal-900 text-xs font-bold flex items-center space-x-1 shadow transition-colors"
          >
            <span>{t('home.activeSpotBannerCta')}</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </Link>
        </div>
      )}

      {/* 3. Live Queue Summary Card */}
      <div className="bg-charcoal-800 border border-gold-500/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-charcoal-900 border border-charcoal-700 flex items-center justify-center text-gold-400 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-white block">
                {metrics.waitingCount} {metrics.waitingCount === 1 ? t('home.personWaitingSuffix') : t('home.waitingSuffix')}
              </span>
              <span className="text-xs text-gold-400 flex items-center space-x-1.5 font-medium mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {t('home.aboutWaitPrefix')} {metrics.estimatedWaitMinutes} {t('common.minutes')} {t('home.waitSuffix')}
                </span>
              </span>
            </div>
          </div>

          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-[10px] font-bold text-gold-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping"></span>
            <span>{t('common.live')}</span>
          </span>
        </div>

        {metrics.waitingCount === 0 && (
          <div className="mt-3 pt-3 border-t border-charcoal-700/80 text-xs text-emerald-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('home.emptyQueueNotice')}</span>
          </div>
        )}
      </div>

      {/* 4. Barber Chips / Status Cards (3 barbers: Ravi, Amit, Imran with photos) */}
      <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
            <span>{t('home.barberAvailability')}</span>
            <span className="text-[10px] text-gray-500 font-normal">({barbers.length})</span>
          </h2>
          <Scissors className="w-4 h-4 text-gold-500" />
        </div>

        <div className="space-y-2.5">
          {barbers.map((barber) => {
            const statusInfo = getStatusBadge(barber.status);
            const barberName = lang === 'gu' ? barber.nameGu : barber.name;
            return (
              <div
                key={barber.id}
                className="min-h-[52px] bg-charcoal-900/80 border border-charcoal-700/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-colors hover:border-charcoal-600"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={barber.photo}
                    alt={barber.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-charcoal-700 shadow-sm"
                  />
                  <div>
                    <span className="text-sm font-bold text-white block">
                      {barberName}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {barber.status === 'busy' && barber.currentCustomer 
                        ? `${t('common.status')}: S-${barber.currentCustomer.replace(/\D/g, '') || '12'}`
                        : t('common.salonName')}
                    </span>
                  </div>
                </div>

                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusInfo.cls}`}>
                  {statusInfo.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Big Gold [Join Queue] CTA Button */}
      <div className="pt-2">
        {isOpen ? (
          <Link
            to="/join"
            className="w-full min-h-[56px] h-14 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 text-charcoal-950 font-black rounded-2xl flex items-center justify-center space-x-2.5 shadow-xl shadow-gold-500/25 transition-all transform active:scale-[0.98] group text-base"
          >
            <Sparkles className="w-5 h-5 text-charcoal-950 group-hover:rotate-12 transition-transform" />
            <span>{t('home.joinQueueBtn')}</span>
            <ChevronRight className="w-5 h-5 text-charcoal-950 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
          </Link>
        ) : (
          <div className="p-4 rounded-2xl bg-charcoal-800 border border-charcoal-700 text-center space-y-1">
            <span className="text-xs font-bold text-red-400 flex items-center justify-center space-x-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{t('common.closed')}</span>
            </span>
            <p className="text-xs text-gray-400">
              {t('home.onlineQueueClosedNotice')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
