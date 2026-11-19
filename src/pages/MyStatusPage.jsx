import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  getCustomerQueueDetails, 
  cancelSpot, 
  getActiveUserTokenId 
} from '../services/queueService';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  Sparkles, 
  User, 
  Scissors,
  XCircle,
  Home
} from 'lucide-react';

export default function MyStatusPage() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  // If no param, try active token from localStorage, fallback to S-14
  const targetToken = id || getActiveUserTokenId() || 'S-14';

  const [details, setDetails] = useState(() => getCustomerQueueDetails(targetToken));
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasAcknowledgedTurn, setHasAcknowledgedTurn] = useState(false);

  useEffect(() => {
    const refreshData = () => {
      const fresh = getCustomerQueueDetails(targetToken);
      setDetails(fresh);
    };

    refreshData();
    window.addEventListener('salon_queue_update', refreshData);
    window.addEventListener('storage', refreshData);

    return () => {
      window.removeEventListener('salon_queue_update', refreshData);
      window.removeEventListener('storage', refreshData);
    };
  }, [targetToken]);

  const handleConfirmCancel = () => {
    cancelSpot(targetToken);
    setShowCancelModal(false);
    navigate('/');
  };

  if (!details || !details.customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-charcoal-800 text-gray-400 mx-auto flex items-center justify-center border border-charcoal-700">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Token Not Found</h2>
        <p className="text-xs text-gray-400">
          We could not find active spot <span className="text-gold-400 font-mono font-bold">{targetToken}</span>.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gold-500 text-charcoal-900 font-bold text-xs shadow hover:bg-gold-400 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>{t('common.backToHome')}</span>
        </Link>
      </div>
    );
  }

  const { customer, position, estimatedWaitMins, customerServices, preferredBarber, assignedBarber, status } = details;
  const isCalled = status === 'Called';
  const isInChair = status === 'In chair';
  const isDone = status === 'Done';
  const isCancelled = status === 'Cancelled';
  const isSecondInLine = status === 'Waiting' && position === 2;

  const barberName = assignedBarber 
    ? (lang === 'gu' ? assignedBarber.nameGu : assignedBarber.name)
    : preferredBarber 
    ? (lang === 'gu' ? preferredBarber.nameGu : preferredBarber.name)
    : t('barbers.any');

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-10 space-y-5">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="min-h-[44px] inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-gold-400 py-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('common.backToHome')}</span>
        </Link>
        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
          isDone 
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            : isCancelled
            ? 'bg-red-500/15 text-red-400 border-red-500/30'
            : isCalled
            ? 'bg-gold-500/20 text-gold-300 border-gold-500/40 animate-pulse'
            : 'bg-gold-500/10 text-gold-400 border-gold-500/30'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping"></span>
          <span>{status.toUpperCase()}</span>
        </span>
      </div>

      {/* Hero Token Card */}
      <div className="bg-charcoal-800 border border-gold-500/40 rounded-2xl p-6 text-center shadow-xl relative overflow-hidden">
        <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
          {t('status.yourToken')}
        </div>
        <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-300 via-gold-400 to-gold-600 tracking-tight my-2">
          {customer.token}
        </div>
        <div className="text-xs text-gray-300 font-medium">
          {customer.name}
        </div>
        {status === 'Waiting' && (
          <div className="inline-block mt-2 px-3.5 py-1 bg-charcoal-900 border border-charcoal-700 rounded-full text-xs text-gray-300">
            <span className="text-gold-400 font-bold">{position}{position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'}</span> {t('status.positionInLine')}
          </div>
        )}
      </div>

      {/* Completed / Cancelled Status State Cards */}
      {isDone && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-3 shadow-lg">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">{t('status.tokenDoneTitle')}</h3>
          <p className="text-xs text-gray-300">{t('status.tokenDoneDesc')}</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-gold-500 text-charcoal-900 font-bold text-xs"
          >
            {t('common.backToHome')}
          </Link>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-950/40 border border-red-500/50 rounded-2xl p-6 text-center space-y-3 shadow-lg">
          <XCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Spot Cancelled</h3>
          <p className="text-xs text-gray-300">Your spot in the queue has been successfully cancelled.</p>
          <Link
            to="/join"
            className="inline-block px-5 py-2.5 rounded-xl bg-gold-500 text-charcoal-900 font-bold text-xs"
          >
            {t('home.joinQueueBtn')}
          </Link>
        </div>
      )}

      {/* Waiting / In-Chair Progress & Timer */}
      {!isDone && !isCancelled && (
        <>
          <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-6 text-center shadow-lg space-y-4">
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-charcoal-900 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-gold-500 stroke-current"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={isCalled ? 0 : Math.min(251.2, 50 * (position || 1))}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                {isCalled ? (
                  <>
                    <Sparkles className="w-6 h-6 text-gold-400 animate-spin mb-0.5" />
                    <span className="text-base font-black text-gold-400 uppercase">CALLED</span>
                  </>
                ) : isInChair ? (
                  <>
                    <Scissors className="w-6 h-6 text-emerald-400 mb-0.5" />
                    <span className="text-xs font-black text-emerald-400 uppercase">IN CHAIR</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-gold-400 mb-0.5" />
                    <span className="text-2xl font-black text-white">~{estimatedWaitMins}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">{t('common.minutes')}</span>
                  </>
                )}
              </div>
            </div>

            {/* Service & Barber Summary */}
            <div className="text-xs text-gray-400 border-t border-charcoal-700 pt-3 flex justify-around">
              <div>
                <span className="block text-[11px] text-gray-500">{t('status.servicesSelected')}</span>
                <span className="font-semibold text-gray-200">
                  {customerServices.map(s => lang === 'gu' ? s.nameGu : s.nameEn).join(' + ')}
                </span>
              </div>
              <div className="w-px bg-charcoal-700"></div>
              <div>
                <span className="block text-[11px] text-gray-500">{t('status.preferredBarber')}</span>
                <span className="font-semibold text-gold-400">{barberName}</span>
              </div>
            </div>
          </div>

          {/* Proactive 2nd in line Alert Banner */}
          {isSecondInLine && (
            <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-4 flex items-start space-x-3 text-left shadow-lg animate-pulse">
              <Bell className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-amber-300">
                  {t('status.headToSalonAlertTitle')}
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {t('status.headToSalonAlertDesc')}
                </p>
              </div>
            </div>
          )}

          {/* Cancel Spot Button (with min 44px tap target) */}
          <div className="text-center pt-2">
            <button
              onClick={() => setShowCancelModal(true)}
              className="min-h-[44px] px-4 py-2 text-xs text-red-400 hover:text-red-300 underline font-medium transition-colors"
            >
              {t('status.cancelSpotBtn')}
            </button>
          </div>
        </>
      )}

      {/* Full-Screen Turn Modal Overlay (Pops up automatically when Called) */}
      {isCalled && !hasAcknowledgedTurn && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-charcoal-900 border-2 border-gold-500 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-gold-500/20 border-2 border-gold-500 mx-auto flex items-center justify-center text-gold-400 animate-pulse">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-white">
              {t('status.turnModalTitle')}
            </h2>
            <div className="space-y-1">
              <p className="text-xs text-gray-400">{t('status.turnModalDesc')}</p>
              <div className="text-xl font-bold text-gold-400">
                {assignedBarber?.name || 'Ravi'} {assignedBarber?.chair ? `(Chair ${assignedBarber.chair})` : ''}
              </div>
              <div className="text-3xl font-extrabold text-white mt-1">{customer.token}</div>
            </div>
            <p className="text-[11px] text-amber-400 bg-amber-950/50 p-2.5 rounded-xl border border-amber-800">
              {t('status.turnModalWarning')}
            </p>
            <button
              onClick={() => setHasAcknowledgedTurn(true)}
              className="w-full min-h-[48px] py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 font-bold rounded-xl text-sm shadow-lg shadow-gold-500/30 active:scale-95 transition-transform"
            >
              {t('status.turnModalAcknowledge')}
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
            <h3 className="text-base font-bold text-white">
              {t('status.cancelConfirmTitle')}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t('status.cancelConfirmDesc')}
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={handleConfirmCancel}
                className="w-full min-h-[44px] py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                {t('status.cancelConfirmYes')}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full min-h-[44px] py-2 bg-charcoal-800 text-gray-300 rounded-xl text-xs font-semibold hover:bg-charcoal-700 transition-colors"
              >
                {t('status.cancelConfirmNo')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
