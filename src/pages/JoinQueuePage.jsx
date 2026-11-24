import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  getServices, 
  getBarbers, 
  validatePhone, 
  findActiveSpotByPhone, 
  calculateJoinSummary, 
  joinQueue, 
  isOnlineQueueOpen 
} from '../services/queueService';
import { 
  ChevronLeft, 
  User, 
  Phone, 
  Check, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  Zap, 
  X, 
  Ticket 
} from 'lucide-react';

export default function JoinQueuePage() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const services = useMemo(() => getServices(), []);
  const barbers = useMemo(() => getBarbers(), []);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState(['haircut']); // Default Haircut selected
  const [selectedBarber, setSelectedBarber] = useState('any');

  // Validation & Error States
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [serviceLimitAlert, setServiceLimitAlert] = useState(false);
  const [duplicateSpot, setDuplicateSpot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPhoneValid = validatePhone(phone);
  const isNameValid = name.trim().length > 0;

  // Dynamic Live Summary calculation
  const summary = useMemo(() => {
    return calculateJoinSummary(selectedServices, selectedBarber);
  }, [selectedServices, selectedBarber]);

  const toggleService = (serviceId) => {
    setServiceLimitAlert(false);
    if (selectedServices.includes(serviceId)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((id) => id !== serviceId));
      }
    } else {
      if (selectedServices.length >= 3) {
        setServiceLimitAlert(true);
      } else {
        setSelectedServices([...selectedServices, serviceId]);
      }
    }
  };

  const handlePhoneChange = (e) => {
    // Only accept numbers and restrict to 10 characters
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(numeric);
    if (duplicateSpot) setDuplicateSpot(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneTouched(true);
    setNameTouched(true);

    if (!isNameValid || !isPhoneValid || selectedServices.length === 0) {
      return;
    }

    // Check duplicate active spot
    const existing = findActiveSpotByPhone(phone);
    if (existing) {
      setDuplicateSpot(existing);
      return;
    }

    setIsSubmitting(true);
    try {
      const entry = await joinQueue({
        name,
        phone,
        serviceIds: selectedServices,
        barberId: selectedBarber,
      });

      // Route to My Status Screen with valid token
      if (entry && entry.token) {
        navigate(`/status/${entry.token}`);
      } else {
        throw new Error('Could not generate queue token. Please try again.');
      }
    } catch (err) {
      if (err.message && err.message.startsWith('DUPLICATE_PHONE:')) {
        const token = err.message.split(':')[1];
        setDuplicateSpot({ token, phone });
      } else {
        alert(err.message || 'Error joining queue');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-10 space-y-6 pb-28">
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <Link
          to="/"
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-gray-300 hover:text-white hover:bg-charcoal-700 flex items-center justify-center transition-colors"
          aria-label={t('common.backToHome')}
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t('join.title')}
          </h1>
          <p className="text-xs text-gray-400">
            {t('join.subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* 1. Customer Details Card (Name & Validated 10-digit Phone) */}
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-5 space-y-4 shadow-lg">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
              {t('join.fullNameLabel')} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onBlur={() => setNameTouched(true)}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('join.fullNamePlaceholder')}
                className={`w-full min-h-[44px] bg-charcoal-900 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                  nameTouched && !isNameValid
                    ? 'border-red-500/80 focus:border-red-500'
                    : 'border-charcoal-700 focus:border-gold-500'
                }`}
              />
            </div>
            {nameTouched && !isNameValid && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{t('join.nameRequiredError')}</span>
              </p>
            )}
          </div>

          {/* 10-digit Phone Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                {t('join.phoneLabel')} *
              </label>
              <span className={`text-[11px] font-mono font-semibold ${
                phone.length === 10 ? 'text-emerald-400' : 'text-gray-400'
              }`}>
                {phone.length}/10
              </span>
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onBlur={() => setPhoneTouched(true)}
                onChange={handlePhoneChange}
                placeholder={t('join.phonePlaceholder')}
                className={`w-full min-h-[44px] bg-charcoal-900 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 font-mono tracking-wider focus:outline-none transition-colors ${
                  phoneTouched && !isPhoneValid
                    ? 'border-red-500/80 focus:border-red-500'
                    : phone.length === 10 && isPhoneValid
                    ? 'border-emerald-500/60 focus:border-emerald-500'
                    : 'border-charcoal-700 focus:border-gold-500'
                }`}
              />
              {phone.length === 10 && isPhoneValid && (
                <Check className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3.5 stroke-[3]" />
              )}
            </div>
            {phoneTouched && !isPhoneValid ? (
              <p className="text-[11px] text-red-400 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{t('join.invalidPhoneError')}</span>
              </p>
            ) : (
              <p className="text-[11px] text-gray-400 mt-1">
                {t('join.phoneHelper')}
              </p>
            )}
          </div>
        </div>

        {/* 2. Service Selection Cards (Multi-select, Max 3) */}
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-5 space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                {t('join.serviceSelectTitle')}
              </h2>
              <p className="text-[11px] text-gray-400">{t('join.serviceSelectHelper')}</p>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              selectedServices.length === 3 
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40' 
                : 'bg-charcoal-900 text-gold-400 border-charcoal-700'
            }`}>
              {selectedServices.length}/3
            </span>
          </div>

          {serviceLimitAlert && (
            <div className="bg-amber-950/50 border border-amber-500/50 rounded-xl p-3 flex items-center justify-between text-amber-300 text-xs animate-in fade-in">
              <span className="flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>{t('join.maxServicesError')}</span>
              </span>
              <button 
                type="button" 
                onClick={() => setServiceLimitAlert(false)}
                className="text-amber-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5">
            {services.map((srv) => {
              const isSelected = selectedServices.includes(srv.id);
              const displayName = lang === 'gu' ? srv.nameGu : srv.nameEn;
              const isMaxReached = selectedServices.length >= 3 && !isSelected;

              return (
                <button
                  type="button"
                  key={srv.id}
                  onClick={() => toggleService(srv.id)}
                  className={`min-h-[52px] w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.99] ${
                    isSelected
                      ? 'bg-charcoal-900 border-gold-500 shadow-md ring-1 ring-gold-500/50'
                      : isMaxReached
                      ? 'bg-charcoal-900/30 border-charcoal-800 text-gray-500 opacity-60 cursor-not-allowed'
                      : 'bg-charcoal-900/70 border-charcoal-700 hover:border-charcoal-600 text-gray-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className={`text-sm font-bold block ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {displayName}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center space-x-2">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gold-500" />
                        <span>{srv.duration} {t('common.minutes')}</span>
                      </span>
                      <span>•</span>
                      <span className="text-gold-400 font-bold">{t('common.currency')}{srv.price}</span>
                    </span>
                  </div>

                  <div className={`min-w-[24px] min-h-[24px] w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                    isSelected 
                      ? 'bg-gold-500 border-gold-500 text-charcoal-950' 
                      : 'border-charcoal-600 bg-charcoal-800'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Barber Preference Selector */}
        <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-5 space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              {t('join.barberSelectTitle')}
            </h2>
            <span className="text-[10px] text-gray-400">
              {selectedBarber === 'any' ? t('barbers.any') : barbers.find(b => b.id === selectedBarber)?.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Any Barber (Fastest) Card */}
            <button
              type="button"
              onClick={() => setSelectedBarber('any')}
              className={`min-h-[68px] p-3 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] ${
                selectedBarber === 'any'
                  ? 'bg-charcoal-900 border-gold-500 shadow-md ring-1 ring-gold-500/50'
                  : 'bg-charcoal-900/70 border-charcoal-700 hover:border-charcoal-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white block">
                  {t('barbers.any')}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold flex items-center space-x-0.5">
                  <Zap className="w-2.5 h-2.5" />
                  <span>{t('join.fastestTag')}</span>
                </span>
              </div>
              <span className="text-[10px] text-gray-400 block mt-1">
                {t('barbers.anySubtitle')}
              </span>
            </button>

            {/* Individual Barbers: Ravi, Amit, Imran with Photos */}
            {barbers.map((b) => {
              const isSelected = selectedBarber === b.id;
              const barberName = lang === 'gu' ? b.nameGu : b.name;
              return (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setSelectedBarber(b.id)}
                  className={`min-h-[68px] p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-charcoal-900 border-gold-500 shadow-md ring-1 ring-gold-500/50'
                      : 'bg-charcoal-900/70 border-charcoal-700 hover:border-charcoal-600'
                  }`}
                >
                  <img
                    src={b.photo}
                    alt={b.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-charcoal-700 flex-shrink-0"
                  />
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-white block truncate">
                      {barberName}
                    </span>
                    <span className={`text-[10px] font-medium block truncate ${
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

        {/* 4. Sticky Bottom Dynamic Live Summary Bar + Confirm CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-charcoal-950/95 backdrop-blur-md border-t border-charcoal-700/80 p-4 shadow-2xl">
          <div className="max-w-md mx-auto space-y-3">
            {/* Live calculation summary */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-gray-300 font-medium">
                {t('join.summaryPrefix')}: <strong className="text-white font-bold">{summary.totalDuration} {t('common.minutes')}</strong> • <strong className="text-gold-400 font-bold">{t('common.currency')}{summary.totalPrice}</strong>
              </span>
              <span className="text-gold-400 font-bold flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{t('join.expectedWaitPrefix')} ~{summary.expectedWait} {t('common.minutes')}</span>
              </span>
            </div>

            {/* Confirm & Join Queue Button (44px+ tap target) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[50px] h-13 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 disabled:opacity-50 text-charcoal-950 font-black rounded-xl text-base shadow-lg shadow-gold-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-charcoal-950" />
              <span>{isSubmitting ? t('join.submitting') : t('join.confirmBtn')}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Duplicate Phone Number Spot Modal */}
      {duplicateSpot && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-charcoal-900 border-2 border-gold-500/80 rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 mx-auto flex items-center justify-center border border-gold-500/40">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {t('join.duplicatePhoneTitle')}
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {t('join.duplicatePhoneAlert')}
              </p>
              <div className="text-2xl font-black text-gold-400 font-mono mt-2">
                {duplicateSpot.token}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Link
                to={`/status/${duplicateSpot.token}`}
                className="w-full min-h-[44px] py-2.5 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold rounded-xl text-xs flex items-center justify-center transition-colors shadow"
              >
                {t('join.viewExistingSpotBtn')}
              </Link>
              <button
                onClick={() => setDuplicateSpot(null)}
                className="w-full min-h-[44px] py-2 bg-charcoal-800 text-gray-300 rounded-xl text-xs font-semibold hover:bg-charcoal-700 transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
