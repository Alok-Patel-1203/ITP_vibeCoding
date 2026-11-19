// Single Source of Truth for Queue Rules, Data & State Management

export const DEFAULT_SERVICES = [
  { id: 'haircut', nameEn: 'Haircut', nameGu: 'હેરકટ', duration: 30, price: 150 },
  { id: 'beard_trim', nameEn: 'Beard trim', nameGu: 'દાઢી ટ્રીમ', duration: 15, price: 80 },
  { id: 'hair_spa', nameEn: 'Hair spa', nameGu: 'હેર સ્પા', duration: 45, price: 400 },
  { id: 'facial', nameEn: 'Facial', nameGu: 'ફેસિયલ', duration: 40, price: 350 },
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

// Seed initial queue items to match brief ("6 people waiting · about 50 min")
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

const STORAGE_KEYS = {
  QUEUE: 'salon_queue_items',
  BARBERS: 'salon_barbers',
  SERVICES: 'salon_services',
  ACTIVE_TOKEN: 'salon_active_token_id',
  IS_QUEUE_OPEN: 'salon_online_queue_open',
};

const memoryStore = {
  [STORAGE_KEYS.QUEUE]: JSON.stringify(SEED_QUEUE),
  [STORAGE_KEYS.BARBERS]: JSON.stringify(DEFAULT_BARBERS),
  [STORAGE_KEYS.SERVICES]: JSON.stringify(DEFAULT_SERVICES),
  [STORAGE_KEYS.ACTIVE_TOKEN]: null,
  [STORAGE_KEYS.IS_QUEUE_OPEN]: 'true',
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
        localStorage.setItem(key, val);
      }
    } catch (e) {
      // ignore
    }
  }
  memoryStore[key] = val;
}

// Initialize Storage with Seed Data if Empty
function initializeStore() {
  if (typeof window === 'undefined') return;
  if (!safeGet(STORAGE_KEYS.QUEUE)) {
    safeSet(STORAGE_KEYS.QUEUE, JSON.stringify(SEED_QUEUE));
  }
  if (!safeGet(STORAGE_KEYS.BARBERS)) {
    safeSet(STORAGE_KEYS.BARBERS, JSON.stringify(DEFAULT_BARBERS));
  }
  if (!safeGet(STORAGE_KEYS.SERVICES)) {
    safeSet(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
  }
  if (safeGet(STORAGE_KEYS.IS_QUEUE_OPEN) === null) {
    safeSet(STORAGE_KEYS.IS_QUEUE_OPEN, 'true');
  }
}

initializeStore();

export function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('salon_queue_update'));
  }
}

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

export function isOnlineQueueOpen() {
  try {
    return safeGet(STORAGE_KEYS.IS_QUEUE_OPEN) !== 'false';
  } catch (e) {
    return true;
  }
}

export function getActiveUserTokenId() {
  return safeGet(STORAGE_KEYS.ACTIVE_TOKEN);
}

export function setActiveUserTokenId(tokenId) {
  safeSet(STORAGE_KEYS.ACTIVE_TOKEN, tokenId || null);
  notifyChange();
}

/**
 * Phone number validation rule:
 * Exactly 10 numerical digits. Standard Indian mobile prefix (starts with 6-9).
 */
export function validatePhone(phone) {
  if (!phone) return false;
  const cleaned = phone.trim().replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Find an active customer spot by phone number (waiting, called, or in chair).
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
 * Cancel a customer's queue spot:
 * - Transitions status to 'Cancelled'
 * - Clears user active token if it matches
 * - Updates queue in localStorage and notifies all screens
 */
export function cancelSpot(tokenIdOrId) {
  if (!tokenIdOrId) return false;
  const queue = getQueue();
  let updated = false;

  const nextQueue = queue.map((item) => {
    if ((item.token === tokenIdOrId || item.id === tokenIdOrId) && ['Waiting', 'Called'].includes(item.status)) {
      updated = true;
      return {
        ...item,
        status: 'Cancelled',
        cancelledAt: new Date().toISOString(),
      };
    }
    return item;
  });

  if (updated) {
    setQueue(nextQueue);
    // If the cancelled token belongs to the active user, clear their active spot
    const activeToken = getActiveUserTokenId();
    if (activeToken === tokenIdOrId || queue.find(q => q.id === tokenIdOrId)?.token === activeToken) {
      setActiveUserTokenId(null);
    }

    // Also check if any barber was calling this customer and free the chair
    const barbers = getBarbers();
    const updatedBarbers = barbers.map((b) => {
      if (b.currentCustomer === tokenIdOrId || queue.find(q => q.id === tokenIdOrId)?.token === b.currentCustomer) {
        return {
          ...b,
          status: 'free',
          currentCustomer: null,
        };
      }
      return b;
    });
    setBarbers(updatedBarbers);
    return true;
  }
  return false;
}

/**
 * Get detailed customer state for `/status/:id`
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

  // Calculate position among waiting customers
  const waitingCustomers = queue.filter((c) => c.status === 'Waiting');
  const indexInWaiting = waitingCustomers.findIndex((c) => c.id === customer.id);
  const position = indexInWaiting !== -1 ? indexInWaiting + 1 : 0;

  // Active barbers on duty
  const activeBarbers = barbers.filter((b) => b.onDuty && b.status !== 'on_break');
  const barberDivisor = Math.max(activeBarbers.length, 1);

  // Calculate wait time: duration of services ahead of this customer
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

  // Resolve service objects
  const customerServices = customer.services.map((sId) => {
    return services.find((s) => s.id === sId) || { id: sId, nameEn: sId, nameGu: sId, duration: 25, price: 100 };
  });

  // Resolve barber info
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

/**
 * Call Next Customer for a specific barber:
 * - Picks earliest customer where status == 'Waiting' and (barberId == barberId or barberId == 'any')
 * - Customer status transitions: 'Waiting' -> 'Called'
 * - Barber status transitions to 'busy' with currentCustomer = customer.token
 */
export function callNextCustomer(barberId) {
  const queue = getQueue();
  const barbers = getBarbers();

  const barber = barbers.find((b) => b.id === barberId);
  if (!barber || !barber.onDuty || barber.status === 'on_break') {
    return null;
  }

  // Find the earliest waiting customer who chose this barber or 'any' (First-Come, First-Served)
  const eligibleCustomer = queue.find(
    (item) => item.status === 'Waiting' && (item.barberId === barberId || item.barberId === 'any')
  );

  if (!eligibleCustomer) {
    return null;
  }

  // Update customer status to 'Called' and attach assignedBarberId
  const updatedQueue = queue.map((item) => {
    if (item.id === eligibleCustomer.id) {
      return {
        ...item,
        status: 'Called',
        assignedBarberId: barberId,
        calledAt: new Date().toISOString(),
      };
    }
    return item;
  });

  // Update barber state
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

  return eligibleCustomer;
}

/**
 * Start service: Transitions customer from 'Called' to 'In chair'
 */
export function startService(barberId) {
  const queue = getQueue();
  const barbers = getBarbers();
  const barber = barbers.find((b) => b.id === barberId);

  if (!barber || !barber.currentCustomer) return false;

  const currentToken = barber.currentCustomer;
  const updatedQueue = queue.map((item) => {
    if (item.token === currentToken && item.status === 'Called') {
      return {
        ...item,
        status: 'In chair',
        startedAt: new Date().toISOString(),
      };
    }
    return item;
  });

  setQueue(updatedQueue);
  return true;
}

/**
 * Complete Service (Done):
 * 1. Transitions active customer from 'In chair' or 'Called' to 'Done'.
 * 2. Frees up the barber chair.
 * 3. If autoCallNext is true (default), automatically calls the next customer in queue!
 */
export function completeService(barberId, autoCallNext = true) {
  const queue = getQueue();
  const barbers = getBarbers();
  const barber = barbers.find((b) => b.id === barberId);

  if (!barber) return false;

  let completedToken = barber.currentCustomer;
  let updatedQueue = [...queue];

  // If barber had a customer in chair or called, mark them as 'Done'
  if (completedToken) {
    updatedQueue = updatedQueue.map((item) => {
      if (item.token === completedToken && ['Called', 'In chair'].includes(item.status)) {
        return {
          ...item,
          status: 'Done',
          completedAt: new Date().toISOString(),
        };
      }
      return item;
    });
  }

  // Check if there is an eligible next customer in line
  let nextCustomer = null;
  if (autoCallNext && barber.onDuty && barber.status !== 'on_break') {
    nextCustomer = updatedQueue.find(
      (item) => item.status === 'Waiting' && (item.barberId === barberId || item.barberId === 'any')
    );
  }

  if (nextCustomer) {
    // Advance next customer directly to 'Called'
    updatedQueue = updatedQueue.map((item) => {
      if (item.id === nextCustomer.id) {
        return {
          ...item,
          status: 'Called',
          assignedBarberId: barberId,
          calledAt: new Date().toISOString(),
        };
      }
      return item;
    });
  }

  // Update barber state
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

  return {
    completedToken,
    nextCustomerToken: nextCustomer ? nextCustomer.token : null,
  };
}

/**
 * Toggle Barber Break
 */
export function toggleBarberBreak(barberId) {
  const barbers = getBarbers();
  const updated = barbers.map((b) => {
    if (b.id === barberId) {
      const nextStatus = b.status === 'on_break' ? 'free' : 'on_break';
      return {
        ...b,
        status: nextStatus,
        currentCustomer: nextStatus === 'on_break' ? null : b.currentCustomer,
      };
    }
    return b;
  });
  setBarbers(updated);
}

/**
 * Calculate queue metrics for the Home Screen:
 * - Active waiting people count (status === 'Waiting')
 * - Total estimated wait time for the next person joining
 */
export function getHomeQueueMetrics() {
  const queue = getQueue();
  const waitingCustomers = queue.filter((c) => c.status === 'Waiting');
  const barbers = getBarbers();
  const services = getServices();

  const activeBarbers = barbers.filter((b) => b.onDuty && b.status !== 'on_break');
  const barberDivisor = Math.max(activeBarbers.length, 1);

  // Sum duration of all services for waiting customers
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
 * Calculate dynamic wait time for Screen 2 (Join Queue)
 */
export function calculateJoinSummary(selectedServiceIds, preferredBarberId) {
  const services = getServices();
  const barbers = getBarbers();
  const queue = getQueue();

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const waitingCustomers = queue.filter((c) => c.status === 'Waiting');
  const activeBarbers = barbers.filter((b) => b.onDuty && b.status !== 'on_break');

  let expectedWait = 0;

  if (preferredBarberId && preferredBarberId !== 'any') {
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
 * Join Queue action (First-Come, First-Served)
 */
export function joinQueue({ name, phone, serviceIds, barberId }) {
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

  const newEntry = {
    id: newId,
    token: newToken,
    name: name.trim(),
    phone: cleanedPhone,
    services: serviceIds,
    barberId: barberId || 'any',
    assignedBarberId: null,
    status: 'Waiting',
    createdAt: new Date().toISOString(),
  };

  const updatedQueue = [...queue, newEntry];
  setQueue(updatedQueue);
  setActiveUserTokenId(newToken);

  return newEntry;
}
