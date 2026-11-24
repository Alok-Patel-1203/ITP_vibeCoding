import { supabase, isSupabaseConfigured } from './supabaseClient.js';

/**
 * ══════════════════════════════════════════════════════════════════════════
 * SINGLE SOURCE OF TRUTH: Queue Business Rules & Realtime Synchronization
 * Implementing docs/03-flows-rules.md
 * ══════════════════════════════════════════════════════════════════════════
 */

// Initial Seed Constants
export const DEFAULT_SERVICES = [
  { id: 'haircut', nameEn: 'Haircut', nameGu: 'હેરકટ', duration: 30, price: 150, active: true },
  { id: 'beard_trim', nameEn: 'Beard trim', nameGu: 'દાઢી ટ્રીમ', duration: 15, price: 80, active: true },
  { id: 'hair_spa', nameEn: 'Hair spa', nameGu: 'હેર સ્પા', duration: 45, price: 400, active: true },
  { id: 'facial', nameEn: 'Facial', nameGu: 'ફેસિયલ', duration: 40, price: 350, active: true },
];

export const DEFAULT_BARBERS = [
  {
    id: 'ravi',
    name: 'Ravi',
    nameGu: 'રવિ',
    chair: 1,
    status: 'busy', // 'free' | 'busy' | 'on_break'
    onDuty: true,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    currentCustomer: 'S-10',
  },
  {
    id: 'amit',
    name: 'Amit',
    nameGu: 'અમિત',
    chair: 2,
    status: 'free',
    onDuty: true,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    currentCustomer: null,
  },
  {
    id: 'imran',
    name: 'Imran',
    nameGu: 'ઇમરાન',
    chair: 3,
    status: 'on_break',
    onDuty: true,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    currentCustomer: null,
  },
];

export const DEFAULT_SETTINGS = {
  id: 'default',
  onlineQueueOpen: true,
  closingTime: '23:00:00',
  cutoffMinutes: 30,
  manualOverride: true,
  enforceCutoff: false,
};

const SEED_QUEUE = [
  {
    id: 'q-10',
    token: 'S-10',
    name: 'Vikram Mehta',
    phone: '9825100001',
    services: ['haircut'],
    barberId: 'ravi',
    assignedBarberId: 'ravi',
    status: 'In chair',
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    id: 'q-11',
    token: 'S-11',
    name: 'Dhaval Shah',
    phone: '9825100002',
    services: ['beard_trim'],
    barberId: 'any',
    assignedBarberId: null,
    status: 'Waiting',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'q-12',
    token: 'S-12',
    name: 'Kunal Patel',
    phone: '9825100003',
    services: ['haircut', 'beard_trim'],
    barberId: 'ravi',
    assignedBarberId: null,
    status: 'Waiting',
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 'q-13',
    token: 'S-13',
    name: 'Rohan Sharma',
    phone: '9825100004',
    services: ['hair_spa'],
    barberId: 'any',
    assignedBarberId: null,
    status: 'Waiting',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'q-14',
    token: 'S-14',
    name: 'Jayesh Dave',
    phone: '9825100005',
    services: ['haircut'],
    barberId: 'amit',
    assignedBarberId: null,
    status: 'Waiting',
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 'q-15',
    token: 'S-15',
    name: 'Suresh Varma',
    phone: '9825100006',
    services: ['facial'],
    barberId: 'any',
    assignedBarberId: null,
    status: 'Waiting',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'q-16',
    token: 'S-16',
    name: 'Chirag Joshi',
    phone: '9825100007',
    services: ['haircut'],
    barberId: 'ravi',
    assignedBarberId: null,
    status: 'Waiting',
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
];

// Unidirectional State Machine Definition (docs/03-flows-rules.md Section 2)
export const VALID_TRANSITIONS = {
  'Waiting': ['Called', 'Cancelled'],
  'Called': ['In chair', 'No-show'],
  'In chair': ['Done'],
  'Done': [],
  'Cancelled': [],
  'No-show': [],
};

const STORAGE_KEYS = {
  QUEUE: 'salon_queue_items',
  BARBERS: 'salon_barbers',
  SERVICES: 'salon_services',
  SETTINGS: 'salon_settings',
  ACTIVE_TOKEN: 'salon_active_token_id',
};

// Memory fallback store
const memoryStore = {
  [STORAGE_KEYS.QUEUE]: JSON.stringify(SEED_QUEUE),
  [STORAGE_KEYS.BARBERS]: JSON.stringify(DEFAULT_BARBERS),
  [STORAGE_KEYS.SERVICES]: JSON.stringify(DEFAULT_SERVICES),
  [STORAGE_KEYS.SETTINGS]: JSON.stringify(DEFAULT_SETTINGS),
  [STORAGE_KEYS.ACTIVE_TOKEN]: null,
};

function safeGet(key, fallback = null) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch (e) {
      return memoryStore[key] || fallback;
    }
  }
  return memoryStore[key] || fallback;
}

function safeSet(key, val) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (val === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
      }
    } catch (e) {
      // ignore
    }
  }
  memoryStore[key] = typeof val === 'string' ? val : JSON.stringify(val);
}

// Global Event Dispatcher
export function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('salon_queue_update'));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase Data Transformer Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mapSupabaseQueueEntry(row) {
  return {
    id: row.id,
    token: row.token,
    name: row.name,
    phone: row.phone,
    services: Array.isArray(row.service_ids) ? row.service_ids : JSON.parse(row.service_ids || '[]'),
    barberId: row.preferred_barber_id,
    assignedBarberId: row.assigned_barber_id,
    status: row.status,
    createdAt: row.created_at,
    calledAt: row.called_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

function mapSupabaseBarber(row) {
  return {
    id: row.id,
    name: row.name_en,
    nameGu: row.name_gu,
    chair: row.chair,
    status: row.status,
    onDuty: row.on_duty,
    photo: row.photo,
    currentCustomer: row.current_customer_token,
  };
}

function mapSupabaseService(row) {
  return {
    id: row.id,
    nameEn: row.name_en,
    nameGu: row.name_gu,
    duration: Number(row.duration),
    price: Number(row.price),
    active: row.active,
  };
}

function mapSupabaseSettings(row) {
  return {
    id: row.id,
    onlineQueueOpen: Boolean(row.online_queue_open),
    closingTime: row.closing_time || '23:00:00',
    cutoffMinutes: row.cutoff_minutes || 30,
    manualOverride: Boolean(row.online_queue_open), // When open in Supabase, treat as manually allowed by owner
    enforceCutoff: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Realtime Subscription Setup (< 5s Sync Across Devices)
// ─────────────────────────────────────────────────────────────────────────────

let isRealtimeInitialized = false;

export function initRealtimeSubscription() {
  if (isRealtimeInitialized || !isSupabaseConfigured || !supabase || typeof window === 'undefined') {
    return;
  }
  isRealtimeInitialized = true;

  // Initial Sync from Supabase
  syncFromSupabase();

  // Listen to Postgres changes on all 4 tables
  const channel = supabase
    .channel('salon-realtime-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_entries' }, () => {
      syncQueueFromSupabase();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'barbers' }, () => {
      syncBarbersFromSupabase();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
      syncServicesFromSupabase();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'salon_settings' }, () => {
      syncSettingsFromSupabase();
    })
    .subscribe();

  return channel;
}

async function syncQueueFromSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from('queue_entries')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      const mapped = data.map(mapSupabaseQueueEntry);
      safeSet(STORAGE_KEYS.QUEUE, mapped);
      notifyChange();
    }
  } catch (e) {
    console.warn('Realtime queue sync error:', e);
  }
}

async function syncBarbersFromSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .order('chair', { ascending: true });

    if (!error && data) {
      const mapped = data.map(mapSupabaseBarber);
      safeSet(STORAGE_KEYS.BARBERS, mapped);
      notifyChange();
    }
  } catch (e) {
    console.warn('Realtime barbers sync error:', e);
  }
}

async function syncServicesFromSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('price', { ascending: true });

    if (!error && data) {
      const mapped = data.map(mapSupabaseService);
      safeSet(STORAGE_KEYS.SERVICES, mapped);
      notifyChange();
    }
  } catch (e) {
    console.warn('Realtime services sync error:', e);
  }
}

async function syncSettingsFromSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from('salon_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data) {
      const mapped = mapSupabaseSettings(data);
      safeSet(STORAGE_KEYS.SETTINGS, mapped);
      notifyChange();
    }
  } catch (e) {
    console.warn('Realtime settings sync error:', e);
  }
}

export async function syncFromSupabase() {
  await Promise.allSettled([
    syncServicesFromSupabase(),
    syncBarbersFromSupabase(),
    syncQueueFromSupabase(),
    syncSettingsFromSupabase(),
  ]);
}

// Auto-start realtime on module import in browser
if (typeof window !== 'undefined') {
  initRealtimeSubscription();
}

// ─────────────────────────────────────────────────────────────────────────────
// Synchronous Getters (Instant UI render with cached/realtime data)
// ─────────────────────────────────────────────────────────────────────────────

export function getServices() {
  try {
    const raw = safeGet(STORAGE_KEYS.SERVICES);
    return raw ? JSON.parse(raw) : DEFAULT_SERVICES;
  } catch (e) {
    return DEFAULT_SERVICES;
  }
}

export function getBarbers() {
  try {
    const raw = safeGet(STORAGE_KEYS.BARBERS);
    return raw ? JSON.parse(raw) : DEFAULT_BARBERS;
  } catch (e) {
    return DEFAULT_BARBERS;
  }
}

export function setBarbers(barbers) {
  safeSet(STORAGE_KEYS.BARBERS, JSON.stringify(barbers));
  notifyChange();
}

export function getQueue() {
  try {
    const raw = safeGet(STORAGE_KEYS.QUEUE);
    return raw ? JSON.parse(raw) : SEED_QUEUE;
  } catch (e) {
    return SEED_QUEUE;
  }
}

export function setQueue(queue) {
  safeSet(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  notifyChange();
}

export function getSalonSettings() {
  try {
    const raw = safeGet(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export async function setSalonSettings(updatedSettings) {
  const current = getSalonSettings();
  const merged = { ...current, ...updatedSettings };
  safeSet(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
  notifyChange();

  if (supabase) {
    try {
      const payload = {
        updated_at: new Date().toISOString(),
      };
      if (updatedSettings.onlineQueueOpen !== undefined) {
        payload.online_queue_open = Boolean(updatedSettings.onlineQueueOpen);
      }
      if (updatedSettings.closingTime !== undefined) {
        payload.closing_time = updatedSettings.closingTime;
      }
      if (updatedSettings.cutoffMinutes !== undefined) {
        payload.cutoff_minutes = Number(updatedSettings.cutoffMinutes);
      }

      await supabase
        .from('salon_settings')
        .update(payload)
        .eq('id', 'default');
    } catch (err) {
      console.warn('Supabase update salon_settings error:', err);
    }
  }

  return merged;
}

export async function toggleOnlineQueue(forceState = null) {
  const current = getSalonSettings();
  const nextOpenState = forceState !== null ? forceState : !current.onlineQueueOpen;
  
  return await setSalonSettings({
    onlineQueueOpen: nextOpenState,
    manualOverride: nextOpenState, // If opened manually by owner, allow it regardless of 9 PM cutoff
  });
}

export async function toggleBarberDuty(barberId) {
  const barbers = getBarbers();
  let updatedStatus = false;
  const updated = barbers.map((b) => {
    if (b.id === barberId) {
      updatedStatus = !b.onDuty;
      return { ...b, onDuty: updatedStatus };
    }
    return b;
  });
  setBarbers(updated);

  if (supabase) {
    try {
      await supabase
        .from('barbers')
        .update({ on_duty: updatedStatus })
        .eq('id', barberId);
    } catch (err) {
      console.warn('Supabase barber duty update error:', err);
    }
  }
  return updated;
}

export async function toggleServiceActive(serviceId) {
  const services = getServices();
  let updatedActive = false;
  const updated = services.map((s) => {
    if (s.id === serviceId) {
      updatedActive = !s.active;
      return { ...s, active: updatedActive };
    }
    return s;
  });
  safeSet(STORAGE_KEYS.SERVICES, JSON.stringify(updated));
  notifyChange();

  if (supabase) {
    try {
      await supabase
        .from('services')
        .update({ active: updatedActive })
        .eq('id', serviceId);
    } catch (err) {
      console.warn('Supabase service active update error:', err);
    }
  }
  return updated;
}

export function getActiveUserTokenId() {
  return safeGet(STORAGE_KEYS.ACTIVE_TOKEN);
}

export function setActiveUserTokenId(tokenId) {
  safeSet(STORAGE_KEYS.ACTIVE_TOKEN, tokenId || null);
  notifyChange();
}

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS RULES IMPLEMENTATION (docs/03-flows-rules.md)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1. State Machine Transition Guard
 * Verifies if status move is unidirectional and permitted.
 */
export function isValidTransition(fromStatus, toStatus) {
  if (!VALID_TRANSITIONS[fromStatus]) return false;
  return VALID_TRANSITIONS[fromStatus].includes(toStatus);
}

/**
 * 2. Phone Validation Rule
 * Strictly 10 numerical digits starting with 6, 7, 8, or 9.
 */
export function validatePhone(phone) {
  if (!phone) return false;
  const cleaned = phone.trim().replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * 3. Single Active Spot per Phone Rule
 * Checks if a customer with this phone number is currently active ('Waiting', 'Called', 'In chair').
 */
export function findActiveSpotByPhone(phone) {
  if (!phone) return null;
  const cleaned = phone.trim().replace(/\D/g, '');
  const queue = getQueue();
  return queue.find(
    (item) =>
      item.phone === cleaned &&
      ['Waiting', 'Called', 'In chair'].includes(item.status)
  ) || null;
}

/**
 * 4. Online Queue Cutoff Rule (30 Minutes Before Closing)
 * Checks if online queue is enabled and if current time is before the closing cutoff.
 * If owner manually opened the queue, manual control takes precedence.
 */
export function isOnlineJoiningAllowed() {
  const settings = getSalonSettings();
  if (!settings.onlineQueueOpen) {
    return { allowed: false, reason: 'closed_by_owner' };
  }

  // If the owner has manually opened or overridden the queue, it takes precedence
  if (settings.manualOverride) {
    return { allowed: true, reason: 'manual_override' };
  }

  // Check cutoff only if enforceCutoff is enabled
  if (settings.enforceCutoff) {
    const now = new Date();
    const [closingHour, closingMinute] = (settings.closingTime || '23:00:00').split(':').map(Number);
    
    const closingDate = new Date();
    closingDate.setHours(closingHour, closingMinute, 0, 0);

    const cutoffMinutes = settings.cutoffMinutes || 30;
    const cutoffDate = new Date(closingDate.getTime() - cutoffMinutes * 60000);

    if (now >= cutoffDate) {
      return { allowed: false, reason: 'cutoff_reached' };
    }
  }

  return { allowed: true };
}

// Backward-compatible alias
export function isOnlineQueueOpen() {
  return isOnlineJoiningAllowed().allowed;
}

/**
 * 5. Dynamic Waiting-Time Calculation Formula
 * Total duration of services ahead divided by active on-duty working barbers.
 */
export function calculateJoinSummary(selectedServiceIds, preferredBarberId) {
  const services = getServices();
  const barbers = getBarbers();
  const queue = getQueue();

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const waitingCustomers = queue.filter((c) => c.status === 'Waiting');
  // Barbers on duty and not on break
  const activeBarbers = barbers.filter((b) => b.onDuty && b.status !== 'on_break');

  let expectedWait = 0;

  if (preferredBarberId && preferredBarberId !== 'any') {
    // Specific barber chosen: wait includes pending customers specifically requesting this barber + 'any' customers
    const barberCustomersAhead = waitingCustomers.filter(
      (c) => c.barberId === preferredBarberId || c.barberId === 'any'
    );
    const pendingMinutes = barberCustomersAhead.reduce((sum, c) => {
      return (
        sum +
        c.services.reduce((sSum, sId) => {
          const s = services.find((srv) => srv.id === sId);
          return sSum + (s ? s.duration : 25);
        }, 0)
      );
    }, 0);

    const isBarberBusy = barbers.find((b) => b.id === preferredBarberId)?.status === 'busy';
    expectedWait = Math.round(pendingMinutes + (isBarberBusy ? 15 : 0));
  } else {
    // 'Any' barber: total waiting minutes divided by active barbers
    const totalMinutes = waitingCustomers.reduce((sum, c) => {
      return (
        sum +
        c.services.reduce((sSum, sId) => {
          const s = services.find((srv) => srv.id === sId);
          return sSum + (s ? s.duration : 25);
        }, 0)
      );
    }, 0);
    const divisor = Math.max(activeBarbers.length, 1);
    expectedWait = Math.round(totalMinutes / divisor);
  }

  return {
    totalDuration,
    totalPrice,
    expectedWait: Math.max(expectedWait, 5),
  };
}

/**
 * 6. Metrics for Home Screen
 */
export function getHomeQueueMetrics() {
  const queue = getQueue();
  const waitingCustomers = queue.filter((c) => c.status === 'Waiting');
  const barbers = getBarbers();
  const services = getServices();

  const activeBarbers = barbers.filter((b) => b.onDuty && b.status !== 'on_break');
  const barberDivisor = Math.max(activeBarbers.length, 1);

  const totalWaitingMinutes = waitingCustomers.reduce((total, customer) => {
    const customerServiceMins = customer.services.reduce((srvTotal, srvId) => {
      const srv = services.find((s) => s.id === srvId);
      return srvTotal + (srv ? srv.duration : 25);
    }, 0);
    return total + customerServiceMins;
  }, 0);

  const estimatedWait = Math.round(totalWaitingMinutes / barberDivisor);

  return {
    waitingCount: waitingCustomers.length,
    estimatedWaitMinutes: estimatedWait > 0 ? estimatedWait : 0,
  };
}

/**
 * 7. Customer Queue Details for `/status/:id`
 */
export function getCustomerQueueDetails(tokenIdOrId) {
  const queue = getQueue();
  const services = getServices();
  const barbers = getBarbers();

  const customer = queue.find(
    (item) => item.token === tokenIdOrId || item.id === tokenIdOrId
  );

  if (!customer) {
    return null;
  }

  const waitingCustomers = queue.filter((c) => c.status === 'Waiting');
  const indexInWaiting = waitingCustomers.findIndex((c) => c.id === customer.id);
  const position = indexInWaiting !== -1 ? indexInWaiting + 1 : 0;

  const activeBarbers = barbers.filter((b) => b.onDuty && b.status !== 'on_break');
  const barberDivisor = Math.max(activeBarbers.length, 1);

  let minutesAhead = 0;
  if (customer.status === 'Waiting') {
    const customersAhead = indexInWaiting > 0 ? waitingCustomers.slice(0, indexInWaiting) : [];
    minutesAhead = customersAhead.reduce((total, c) => {
      const cDuration = c.services.reduce((sum, sId) => {
        const s = services.find((srv) => srv.id === sId);
        return sum + (s ? s.duration : 25);
      }, 0);
      return total + cDuration;
    }, 0);
  }

  const estimatedWaitMins = customer.status === 'Waiting'
    ? Math.max(Math.round(minutesAhead / barberDivisor), 5)
    : 0;

  const customerServices = customer.services.map((sId) => {
    return services.find((s) => s.id === sId) || { id: sId, nameEn: sId, nameGu: sId, duration: 25, price: 100 };
  });

  const preferredBarber = barbers.find((b) => b.id === customer.barberId) || null;
  const assignedBarber = barbers.find((b) => b.id === customer.assignedBarberId) || preferredBarber;

  return {
    customer,
    position,
    estimatedWaitMins,
    customerServices,
    preferredBarber,
    assignedBarber,
    status: customer.status,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE MACHINE MUTATION ACTIONS (FCFS, Single Occupancy, Realtime Broadcast)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Join Queue Action (FCFS, Max 3 Services, Single Active Spot Guard)
 */
export async function joinQueue({ name, phone, serviceIds, barberId, isWalkIn = false }) {
  if (!name || !name.trim()) {
    throw new Error('Name is required');
  }
  if (!validatePhone(phone)) {
    throw new Error('Valid 10-digit phone number is required');
  }
  if (!serviceIds || serviceIds.length === 0) {
    throw new Error('At least 1 service must be selected');
  }
  if (serviceIds.length > 3) {
    throw new Error('Maximum of 3 services permitted');
  }

  // Check online cutoff if remote customer
  if (!isWalkIn) {
    const check = isOnlineJoiningAllowed();
    if (!check.allowed) {
      throw new Error(check.reason === 'cutoff_reached' 
        ? 'Online queue closed 30 mins before salon closing. Walk-ins still welcome at desk.' 
        : 'Online joining is currently closed by the salon.');
    }
  }

  const cleanedPhone = phone.trim().replace(/\D/g, '');
  const existingSpot = findActiveSpotByPhone(cleanedPhone);
  if (existingSpot) {
    throw new Error(`DUPLICATE_PHONE:${existingSpot.token}`);
  }

  const queue = getQueue();
  let maxTokenNum = 16;
  queue.forEach((item) => {
    const match = item.token?.match(/S-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxTokenNum) maxTokenNum = num;
    }
  });

  const nextTokenNum = maxTokenNum + 1;
  const newToken = `S-${nextTokenNum}`;
  const newId = `q-${Date.now()}`;
  const nowIso = new Date().toISOString();

  const newEntry = {
    id: newId,
    token: newToken,
    name: name.trim(),
    phone: cleanedPhone,
    services: serviceIds,
    barberId: barberId || 'any',
    assignedBarberId: null,
    status: 'Waiting',
    createdAt: nowIso,
  };

  // Immediate optimistic local update
  const updatedQueue = [...queue, newEntry];
  setQueue(updatedQueue);
  setActiveUserTokenId(newToken);

  // Sync to Supabase in background
  if (supabase) {
    try {
      await supabase.from('queue_entries').insert({
        token: newToken,
        name: name.trim(),
        phone: cleanedPhone,
        service_ids: serviceIds,
        preferred_barber_id: barberId || 'any',
        assigned_barber_id: null,
        status: 'Waiting',
        created_at: nowIso,
      });
    } catch (err) {
      console.warn('Supabase join insert error:', err);
    }
  }

  return newEntry;
}

/**
 * Cancel Spot Action:
 * Status transition: 'Waiting' -> 'Cancelled'
 */
export async function cancelSpot(tokenIdOrId) {
  if (!tokenIdOrId) return false;
  const queue = getQueue();
  const customer = queue.find(c => c.token === tokenIdOrId || c.id === tokenIdOrId);

  if (!customer || !isValidTransition(customer.status, 'Cancelled')) {
    return false;
  }

  const nowIso = new Date().toISOString();
  const nextQueue = queue.map((item) => {
    if (item.id === customer.id) {
      return {
        ...item,
        status: 'Cancelled',
        cancelledAt: nowIso,
      };
    }
    return item;
  });

  setQueue(nextQueue);

  // Clear active token if it belongs to current browser
  const activeToken = getActiveUserTokenId();
  if (activeToken === customer.token || activeToken === customer.id) {
    setActiveUserTokenId(null);
  }

  // Free barber chair if customer was called
  const barbers = getBarbers();
  const updatedBarbers = barbers.map((b) => {
    if (b.currentCustomer === customer.token) {
      return { ...b, status: 'free', currentCustomer: null };
    }
    return b;
  });
  setBarbers(updatedBarbers);

  // Sync to Supabase
  if (supabase) {
    try {
      await supabase
        .from('queue_entries')
        .update({ status: 'Cancelled', cancelled_at: nowIso })
        .eq('token', customer.token);

      await supabase
        .from('barbers')
        .update({ status: 'free', current_customer_token: null })
        .eq('current_customer_token', customer.token);
    } catch (err) {
      console.warn('Supabase cancel update error:', err);
    }
  }

  return true;
}

/**
 * Call Next Customer Action:
 * - Selects earliest waiting customer preferring this barber OR 'any' (FCFS)
 * - Transitions: 'Waiting' -> 'Called'
 * - Single occupancy enforced: Chair must be free
 */
export async function callNextCustomer(barberId) {
  const queue = getQueue();
  const barbers = getBarbers();

  const barber = barbers.find((b) => b.id === barberId);
  if (!barber || !barber.onDuty || barber.status === 'on_break') {
    return null;
  }

  // Invariant: One customer in chair/called at a time
  if (barber.currentCustomer) {
    const existing = queue.find(q => q.token === barber.currentCustomer && ['Called', 'In chair'].includes(q.status));
    if (existing) {
      throw new Error(`Chair is currently occupied by ${existing.token}`);
    }
  }

  // First-Come, First-Served Matching: Earliest created_at where preference matches
  const eligibleCustomer = queue.find(
    (item) => item.status === 'Waiting' && (item.barberId === barberId || item.barberId === 'any')
  );

  if (!eligibleCustomer) {
    return null;
  }

  const nowIso = new Date().toISOString();

  // Update customer status to 'Called'
  const updatedQueue = queue.map((item) => {
    if (item.id === eligibleCustomer.id) {
      return {
        ...item,
        status: 'Called',
        assignedBarberId: barberId,
        calledAt: nowIso,
      };
    }
    return item;
  });

  // Update barber to busy
  const updatedBarbers = barbers.map((b) => {
    if (b.id === barberId) {
      return {
        ...b,
        status: 'busy',
        currentCustomer: eligibleCustomer.token,
      };
    }
    return b;
  });

  setQueue(updatedQueue);
  setBarbers(updatedBarbers);

  // Sync to Supabase
  if (supabase) {
    try {
      await supabase
        .from('queue_entries')
        .update({ status: 'Called', assigned_barber_id: barberId, called_at: nowIso })
        .eq('token', eligibleCustomer.token);

      await supabase
        .from('barbers')
        .update({ status: 'busy', current_customer_token: eligibleCustomer.token })
        .eq('id', barberId);
    } catch (err) {
      console.warn('Supabase callNext sync error:', err);
    }
  }

  return eligibleCustomer;
}

/**
 * Start Service Action:
 * Transitions: 'Called' -> 'In chair'
 */
export async function startService(barberId) {
  const queue = getQueue();
  const barbers = getBarbers();
  const barber = barbers.find((b) => b.id === barberId);

  if (!barber || !barber.currentCustomer) return false;

  const currentToken = barber.currentCustomer;
  const customer = queue.find(item => item.token === currentToken);

  if (!customer || !isValidTransition(customer.status, 'In chair')) {
    return false;
  }

  const nowIso = new Date().toISOString();
  const updatedQueue = queue.map((item) => {
    if (item.token === currentToken && item.status === 'Called') {
      return {
        ...item,
        status: 'In chair',
        startedAt: nowIso,
      };
    }
    return item;
  });

  setQueue(updatedQueue);

  if (supabase) {
    try {
      await supabase
        .from('queue_entries')
        .update({ status: 'In chair', started_at: nowIso })
        .eq('token', currentToken);
    } catch (err) {
      console.warn('Supabase startService sync error:', err);
    }
  }

  return true;
}

/**
 * Complete Service Action:
 * 1. Transitions: 'In chair' | 'Called' -> 'Done'
 * 2. Frees the chair
 * 3. Auto-advances the next eligible customer (if autoCallNext is true)
 */
export async function completeService(barberId, autoCallNext = true) {
  const queue = getQueue();
  const barbers = getBarbers();
  const barber = barbers.find((b) => b.id === barberId);

  if (!barber) return false;

  const completedToken = barber.currentCustomer;
  const nowIso = new Date().toISOString();
  let updatedQueue = [...queue];

  // Mark current customer as 'Done'
  if (completedToken) {
    updatedQueue = updatedQueue.map((item) => {
      if (item.token === completedToken && ['Called', 'In chair'].includes(item.status)) {
        return {
          ...item,
          status: 'Done',
          completedAt: nowIso,
        };
      }
      return item;
    });

    if (supabase) {
      try {
        await supabase
          .from('queue_entries')
          .update({ status: 'Done', completed_at: nowIso })
          .eq('token', completedToken);
      } catch (err) {
        console.warn('Supabase completeService sync error:', err);
      }
    }
  }

  // Find next customer in line
  let nextCustomer = null;
  if (autoCallNext && barber.onDuty && barber.status !== 'on_break') {
    nextCustomer = updatedQueue.find(
      (item) => item.status === 'Waiting' && (item.barberId === barberId || item.barberId === 'any')
    );
  }

  if (nextCustomer) {
    updatedQueue = updatedQueue.map((item) => {
      if (item.id === nextCustomer.id) {
        return {
          ...item,
          status: 'Called',
          assignedBarberId: barberId,
          calledAt: nowIso,
        };
      }
      return item;
    });

    if (supabase) {
      try {
        await supabase
          .from('queue_entries')
          .update({ status: 'Called', assigned_barber_id: barberId, called_at: nowIso })
          .eq('token', nextCustomer.token);
      } catch (err) {
        console.warn('Supabase next customer call error:', err);
      }
    }
  }

  // Update barber chair status
  const updatedBarbers = barbers.map((b) => {
    if (b.id === barberId) {
      return {
        ...b,
        status: nextCustomer ? 'busy' : 'free',
        currentCustomer: nextCustomer ? nextCustomer.token : null,
      };
    }
    return b;
  });

  setQueue(updatedQueue);
  setBarbers(updatedBarbers);

  if (supabase) {
    try {
      await supabase
        .from('barbers')
        .update({
          status: nextCustomer ? 'busy' : 'free',
          current_customer_token: nextCustomer ? nextCustomer.token : null,
        })
        .eq('id', barberId);
    } catch (err) {
      console.warn('Supabase barber update error:', err);
    }
  }

  return {
    completedToken,
    nextCustomerToken: nextCustomer ? nextCustomer.token : null,
  };
}

/**
 * Mark No-Show Action:
 * Transitions: 'Called' -> 'No-show'
 */
export async function markNoShow(tokenId) {
  const queue = getQueue();
  const customer = queue.find(q => q.token === tokenId);

  if (!customer || !isValidTransition(customer.status, 'No-show')) {
    return false;
  }

  const nowIso = new Date().toISOString();
  const nextQueue = queue.map(item => {
    if (item.token === tokenId) {
      return { ...item, status: 'No-show', completedAt: nowIso };
    }
    return item;
  });

  // Free up barber chair
  const barbers = getBarbers();
  const nextBarbers = barbers.map(b => {
    if (b.currentCustomer === tokenId) {
      return { ...b, status: 'free', currentCustomer: null };
    }
    return b;
  });

  setQueue(nextQueue);
  setBarbers(nextBarbers);

  if (supabase) {
    try {
      await supabase
        .from('queue_entries')
        .update({ status: 'No-show' })
        .eq('token', tokenId);

      await supabase
        .from('barbers')
        .update({ status: 'free', current_customer_token: null })
        .eq('current_customer_token', tokenId);
    } catch (err) {
      console.warn('Supabase no-show sync error:', err);
    }
  }

  return true;
}

/**
 * Barber Break Action
 */
export async function toggleBarberBreak(barberId) {
  const barbers = getBarbers();
  const barber = barbers.find(b => b.id === barberId);
  if (!barber) return;

  const nextStatus = barber.status === 'on_break' ? 'free' : 'on_break';
  const updated = barbers.map(b => {
    if (b.id === barberId) {
      return {
        ...b,
        status: nextStatus,
        currentCustomer: nextStatus === 'on_break' ? null : b.currentCustomer,
      };
    }
    return b;
  });

  setBarbers(updated);

  if (supabase) {
    try {
      await supabase
        .from('barbers')
        .update({
          status: nextStatus,
          current_customer_token: nextStatus === 'on_break' ? null : barber.currentCustomer,
        })
        .eq('id', barberId);
    } catch (err) {
      console.warn('Supabase toggleBarberBreak error:', err);
    }
  }
}
