import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CLEAN_DATA, DEMO_DATA } from '../data/initialData';
import confetti from 'canvas-confetti';
import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  subscribeToCloudSociety, 
  syncToCloudSociety,
  registerSocietyUser,
  loginSocietyUser,
  sendResetPasswordEmail,
  verifyAccountForReset,
  resetSocietyPasswordDirectly,
  logoutSocietyUser,
  getActiveAuthSession
} from '../services/firebase';

const MandalContext = createContext();

const getSocietyStorageKey = (socId) => {
  if (!socId || socId === 'shakti-yuvak-mandal') return 'shakti_yuvak_mandal_v4';
  return `shakti_society_data_${socId}`;
};

const loadInitialSocietyData = (socId, defaultName) => {
  try {
    const key = getSocietyStorageKey(socId);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed.members)) parsed.members = [];
      if (!Array.isArray(parsed.events)) parsed.events = [];
      if (!parsed.society) parsed.society = { ...CLEAN_DATA.society, id: socId, name: defaultName || 'My Society' };
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load from storage', e);
  }
  return {
    ...CLEAN_DATA,
    society: {
      ...CLEAN_DATA.society,
      id: socId || 'society-1',
      name: defaultName || (socId === 'shakti-yuvak-mandal' ? 'Shakti Yuvak Mandal' : 'My Society')
    }
  };
};

export function MandalProvider({ children }) {
  // Active Authenticated Society User Session
  const [authSession, setAuthSession] = useState(() => getActiveAuthSession());
  const currentSocietyId = authSession?.societyId || null;
  const isAuthenticated = Boolean(authSession);

  const [data, setData] = useState(() => {
    const initialSession = getActiveAuthSession();
    if (!initialSession) return CLEAN_DATA;
    return loadInitialSocietyData(initialSession.societyId, initialSession.societyName);
  });

  const [selectedEventId, setSelectedEventId] = useState(() => {
    return data.events && data.events.length > 0 ? data.events[0].id : '';
  });

  // Top level views: 'dashboard' | 'event' | 'members'
  const [currentView, setCurrentView] = useState('dashboard');

  // Sub-tabs inside event view: 'overview' | 'contributors' | 'defaulters' | 'expenses'
  const [eventTab, setEventTab] = useState('overview');

  // Normal members start in Public read-only view; Admin must enter PIN to make changes
  const [isAdmin, setIsAdmin] = useState(false);

  // Cloud Database state
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'

  const isInitialCloudLoaded = useRef(!getSavedFirebaseConfig());
  const isRemoteSync = useRef(false);

  // 1. Cloud Firestore Real-time Multi-tenant Listener
  useEffect(() => {
    if (!currentSocietyId) {
      setIsCloudConnected(false);
      isInitialCloudLoaded.current = true;
      return;
    }

    const config = getSavedFirebaseConfig();
    if (!config) {
      setIsCloudConnected(false);
      isInitialCloudLoaded.current = true;
      return;
    }

    isInitialCloudLoaded.current = false;

    const unsubscribe = subscribeToCloudSociety(
      currentSocietyId,
      (cloudData) => {
        if (cloudData && typeof cloudData === 'object' && cloudData.society) {
          isRemoteSync.current = true;
          setData(cloudData);
          setIsCloudConnected(true);
          isInitialCloudLoaded.current = true;
        } else {
          // Cloud doc empty for this new society, seed with current local data
          isInitialCloudLoaded.current = true;
          syncToCloudSociety(currentSocietyId, data)
            .then(() => setIsCloudConnected(true))
            .catch((e) => console.warn('Cloud seed error:', e));
        }
      },
      (err) => {
        console.warn(`Firestore subscription notice for ${currentSocietyId}:`, err);
        setIsCloudConnected(false);
        isInitialCloudLoaded.current = true;
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentSocietyId]);

  // 2. Save changes to local storage AND Cloud Firestore for the active society
  useEffect(() => {
    if (!currentSocietyId) return;

    const storageKey = getSocietyStorageKey(currentSocietyId);
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    // Do not echo remote updates back to Firestore
    if (isRemoteSync.current) {
      isRemoteSync.current = false;
      return;
    }

    if (!isInitialCloudLoaded.current) {
      return;
    }

    const config = getSavedFirebaseConfig();
    if (config) {
      setCloudSyncStatus('syncing');
      syncToCloudSociety(currentSocietyId, data)
        .then(() => setCloudSyncStatus('synced'))
        .catch(() => setCloudSyncStatus('error'));
    }
  }, [data, currentSocietyId]);

  // Authentication Handlers
  const login = async (identifier, password) => {
    const res = await loginSocietyUser({ identifier, password });
    setAuthSession(res.user);
    const loaded = loadInitialSocietyData(res.societyId, res.societyName);
    setData(loaded);
    // CRITICAL: Normal members & users log in with public read-only view.
    // Admin must explicitly enter the 4-digit PIN to perform modifications.
    setIsAdmin(false);
    return res;
  };

  const signup = async (signupData) => {
    const res = await registerSocietyUser(signupData);
    setAuthSession(res.user);
    const loaded = loadInitialSocietyData(res.societyId, res.societyName);
    setData(loaded);
    // User lands in public view; Admin PIN required for editing
    setIsAdmin(false);
    return res;
  };

  const forgotPassword = async (emailOrMobile) => {
    return await sendResetPasswordEmail(emailOrMobile);
  };

  const verifyAccount = async (identifier) => {
    return await verifyAccountForReset(identifier);
  };

  const resetPasswordWithPin = async (params) => {
    return await resetSocietyPasswordDirectly(params);
  };

  const logout = async () => {
    await logoutSocietyUser();
    setAuthSession(null);
    setIsAdmin(false);
    setCurrentView('dashboard');
    setData(CLEAN_DATA);
  };

  const connectCloudDatabase = (config) => {
    saveFirebaseConfig(config);
    if (currentSocietyId) {
      setCloudSyncStatus('syncing');
      syncToCloudSociety(currentSocietyId, data)
        .then(() => {
          setIsCloudConnected(true);
          setCloudSyncStatus('synced');
        })
        .catch((err) => {
          console.error('Cloud connect error:', err);
          setCloudSyncStatus('error');
        });
    }
  };

  const disconnectCloudDatabase = () => {
    clearFirebaseConfig();
    setIsCloudConnected(false);
    setCloudSyncStatus('idle');
  };

  // Keep selectedEventId valid if events list changes
  useEffect(() => {
    if (data.events.length > 0) {
      if (!data.events.some((e) => e.id === selectedEventId)) {
        setSelectedEventId(data.events[0].id);
      }
    } else {
      setSelectedEventId('');
    }
  }, [data.events, selectedEventId]);

  const selectedEvent = data.events.find((e) => e.id === selectedEventId) || data.events[0] || null;
  const members = data.members || [];
  const events = data.events || [];
  const society = data.society || CLEAN_DATA.society;

  // Admin PIN verification
  const unlockAdmin = (pin) => {
    if (pin === (society.adminPin || '1234')) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdmin(false);
  };

  // Reset to clean blank state (Zero events, zero members, zero balance)
  const resetToCleanData = () => {
    setData(CLEAN_DATA);
    setSelectedEventId('');
    setCurrentView('dashboard');
    try {
      const storageKey = getSocietyStorageKey(currentSocietyId);
      localStorage.setItem(storageKey, JSON.stringify(CLEAN_DATA));
    } catch (_) {}
  };

  // Load sample demo data
  const loadSampleDemoData = () => {
    setData(DEMO_DATA);
    if (DEMO_DATA.events.length > 0) {
      setSelectedEventId(DEMO_DATA.events[0].id);
    }
    try {
      const storageKey = getSocietyStorageKey(currentSocietyId);
      localStorage.setItem(storageKey, JSON.stringify(DEMO_DATA));
    } catch (_) {}
  };

  // SOCIETY UPDATE (Name, Subtitle, Admin Contact, UPI, PIN, Treasury, Wizard Flag)
  const updateSociety = (updatedFields) => {
    setData((prev) => {
      const bank = updatedFields.bankBalance !== undefined ? Number(updatedFields.bankBalance) : prev.society.treasury.bankBalance;
      const cash = updatedFields.cashBalance !== undefined ? Number(updatedFields.cashBalance) : prev.society.treasury.cashBalance;

      return {
        ...prev,
        society: {
          ...prev.society,
          name: updatedFields.name !== undefined ? updatedFields.name : prev.society.name,
          subtitle: updatedFields.subtitle !== undefined ? updatedFields.subtitle : prev.society.subtitle,
          adminName: updatedFields.adminName !== undefined ? updatedFields.adminName : prev.society.adminName,
          adminMobile: updatedFields.adminMobile !== undefined ? updatedFields.adminMobile : prev.society.adminMobile,
          adminEmail: updatedFields.adminEmail !== undefined ? updatedFields.adminEmail : prev.society.adminEmail,
          upiId: updatedFields.upiId !== undefined ? updatedFields.upiId : prev.society.upiId,
          adminPin: updatedFields.adminPin !== undefined ? updatedFields.adminPin : prev.society.adminPin,
          wizardCompleted: updatedFields.wizardCompleted !== undefined ? updatedFields.wizardCompleted : (prev.society.wizardCompleted || false),
          treasury: {
            bankBalance: bank,
            cashBalance: cash,
            totalReserve: bank + cash
          }
        }
      };
    });
  };

  // OVERALL SOCIETY METRICS FOR DASHBOARD
  const getOverallSocietyStats = () => {
    const totalEvents = events.length;
    const totalMembers = members.length;
    let totalCollectedAll = 0;
    let totalSpentAll = 0;
    let totalSettledSurplus = 0;
    let completedEventsCount = 0;
    let activeFestivalBalance = 0;

    events.forEach((evt) => {
      let evtCollected = 0;
      let evtSpent = 0;

      (evt.contributions || []).forEach((c) => {
        evtCollected += Number(c.amount || 0);
      });
      (evt.expenses || []).forEach((e) => {
        evtSpent += Number(e.amount || 0);
      });

      totalCollectedAll += evtCollected;
      totalSpentAll += evtSpent;

      if (evt.status === 'completed' || evt.isSettled) {
        completedEventsCount += 1;
        totalSettledSurplus += Number(evt.settledSurplus || 0);
      } else {
        activeFestivalBalance += (evtCollected - evtSpent);
      }
    });

    const netFestivalBalance = totalCollectedAll - totalSpentAll;
    const generalCorpus = society.treasury?.totalReserve || 0;
    const grandSocietyFunds = generalCorpus + activeFestivalBalance;

    return {
      totalEvents,
      totalMembers,
      totalCollectedAll,
      totalSpentAll,
      netFestivalBalance,
      totalSettledSurplus,
      completedEventsCount,
      activeFestivalBalance,
      generalCorpus,
      grandSocietyFunds
    };
  };

  // EVENT CALCULATIONS
  const getEventStats = (event) => {
    if (!event) {
      return {
        totalCollected: 0,
        totalSpent: 0,
        balance: 0,
        count: 0,
        pending: members.length,
        budgetPercent: 0,
        turnoutPercent: 0,
        totalMembers: members.length,
        surplus: 0
      };
    }

    const contributions = event.contributions || [];
    const expenses = event.expenses || [];

    const totalCollected = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const balance = totalCollected - totalSpent;
    const count = contributions.length;
    const pending = Math.max(0, members.length - count);
    const budgetPercent = event.estimatedBudget > 0 ? Math.round((totalCollected / event.estimatedBudget) * 100) : 0;
    const turnoutPercent = members.length > 0 ? Math.round((count / members.length) * 100) : 0;

    // Effective surplus logic:
    // If contributions exist, surplus = collected - spent
    // If no resident collections, surplus = estimatedBudget - spent
    const incomeBasis = totalCollected > 0 ? totalCollected : Number(event.estimatedBudget || 0);
    const calculatedSurplus = Math.max(0, incomeBasis - totalSpent);

    return {
      totalCollected,
      totalSpent,
      balance,
      count,
      pending,
      budgetPercent,
      turnoutPercent,
      totalMembers: members.length,
      surplus: calculatedSurplus
    };
  };

  // EVENT CRUD
  const createNewEvent = (eventData) => {
    const newEvt = {
      id: `event-${Date.now()}`,
      title: eventData.title.trim(),
      badge: eventData.badge || 'Active Festival',
      dates: (eventData.dates || 'Upcoming').trim(),
      status: eventData.status || 'active',
      icon: eventData.icon || '🚩',
      estimatedBudget: Number(eventData.estimatedBudget || 20000),
      targetPerMember: Number(eventData.targetPerMember || 500),
      notes: (eventData.notes || '').trim(),
      contributions: [],
      expenses: [],
      isSettled: false,
      settledSurplus: 0,
      settledDate: null
    };

    setData((prev) => ({
      ...prev,
      events: [newEvt, ...prev.events]
    }));
    setSelectedEventId(newEvt.id);
    setCurrentView('event');
    setEventTab('overview');
  };

  const updateEvent = (eventId, updatedFields) => {
    setData((prev) => {
      const existing = prev.events.find((e) => e.id === eventId);
      if (!existing) return prev;

      let updatedSociety = prev.society;

      // Check if status changed to 'completed' and not yet settled
      let settledInfo = {};
      if (updatedFields.status === 'completed' && existing.status !== 'completed' && !existing.isSettled) {
        const stats = getEventStats(existing);
        const surplus = stats.surplus;
        const currentCash = prev.society?.treasury?.cashBalance || 0;
        const newCash = currentCash + surplus;
        const newBank = prev.society?.treasury?.bankBalance || 0;

        updatedSociety = {
          ...prev.society,
          treasury: {
            bankBalance: newBank,
            cashBalance: newCash,
            totalReserve: newBank + newCash
          }
        };

        settledInfo = {
          isSettled: true,
          settledSurplus: surplus,
          settledDate: new Date().toISOString(),
          settledDestination: 'cash'
        };
      } else if (updatedFields.status && updatedFields.status !== 'completed' && existing.status === 'completed' && existing.isSettled) {
        // Reopened: revert settled surplus
        const surplus = Number(existing.settledSurplus || 0);
        const dest = existing.settledDestination || 'cash';
        const currentBank = prev.society?.treasury?.bankBalance || 0;
        const currentCash = prev.society?.treasury?.cashBalance || 0;
        const newBank = dest === 'bank' ? Math.max(0, currentBank - surplus) : currentBank;
        const newCash = dest === 'cash' ? Math.max(0, currentCash - surplus) : currentCash;

        updatedSociety = {
          ...prev.society,
          treasury: {
            bankBalance: newBank,
            cashBalance: newCash,
            totalReserve: newBank + newCash
          }
        };

        settledInfo = {
          isSettled: false,
          settledSurplus: 0,
          settledDate: null,
          settledDestination: null
        };
      }

      return {
        ...prev,
        society: updatedSociety,
        events: prev.events.map((evt) => {
          if (evt.id === eventId) {
            return {
              ...evt,
              ...updatedFields,
              ...settledInfo,
              estimatedBudget: updatedFields.estimatedBudget !== undefined ? Number(updatedFields.estimatedBudget) : evt.estimatedBudget,
              targetPerMember: updatedFields.targetPerMember !== undefined ? Number(updatedFields.targetPerMember) : evt.targetPerMember
            };
          }
          return evt;
        })
      };
    });
  };

  // COMPLETE & SETTLE EVENT (Transfers leftover surplus to Main Money Amount)
  const completeAndSettleEvent = (eventId, options = {}) => {
    const destination = options.destination || 'cash';
    let settledAmount = 0;

    setData((prev) => {
      const evt = prev.events.find((e) => e.id === eventId);
      if (!evt) return prev;

      const totalCollected = (evt.contributions || []).reduce((s, c) => s + Number(c.amount || 0), 0);
      const totalSpent = (evt.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
      const effectiveBudget = Number(evt.estimatedBudget || 0);

      // If collected funds exist, surplus is totalCollected - totalSpent
      // If no resident collections, surplus is unspent budget (estimatedBudget - totalSpent)
      const incomeBasis = totalCollected > 0 ? totalCollected : effectiveBudget;
      const surplus = Math.max(0, incomeBasis - totalSpent);
      settledAmount = surplus;

      const currentBank = prev.society?.treasury?.bankBalance || 0;
      const currentCash = prev.society?.treasury?.cashBalance || 0;

      const newBank = destination === 'bank' ? currentBank + surplus : currentBank;
      const newCash = destination === 'cash' ? currentCash + surplus : currentCash;
      const newTotal = newBank + newCash;

      const updatedEvents = prev.events.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            status: 'completed',
            isSettled: true,
            settledSurplus: surplus,
            settledDate: new Date().toISOString(),
            settledDestination: destination
          };
        }
        return e;
      });

      return {
        ...prev,
        society: {
          ...prev.society,
          treasury: {
            bankBalance: newBank,
            cashBalance: newCash,
            totalReserve: newTotal
          }
        },
        events: updatedEvents
      };
    });

    try {
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.65 },
        colors: ['#16A34A', '#E65100', '#FFA000', '#2563EB']
      });
    } catch (_) {}

    return settledAmount;
  };

  // RE-OPEN EVENT (Safely rolls back surplus from Main Money Amount)
  const reopenEvent = (eventId) => {
    setData((prev) => {
      const evt = prev.events.find((e) => e.id === eventId);
      if (!evt) return prev;

      const currentBank = prev.society?.treasury?.bankBalance || 0;
      const currentCash = prev.society?.treasury?.cashBalance || 0;
      const surplus = Number(evt.settledSurplus || 0);
      const dest = evt.settledDestination || 'cash';

      const newBank = dest === 'bank' ? Math.max(0, currentBank - surplus) : currentBank;
      const newCash = dest === 'cash' ? Math.max(0, currentCash - surplus) : currentCash;

      const updatedEvents = prev.events.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            status: 'active',
            isSettled: false,
            settledSurplus: 0,
            settledDate: null,
            settledDestination: null
          };
        }
        return e;
      });

      return {
        ...prev,
        society: {
          ...prev.society,
          treasury: {
            bankBalance: newBank,
            cashBalance: newCash,
            totalReserve: newBank + newCash
          }
        },
        events: updatedEvents
      };
    });
  };

  const deleteEvent = (eventId) => {
    setData((prev) => {
      const evt = prev.events.find((e) => e.id === eventId);
      let updatedSociety = prev.society;

      // Rollback settled surplus if deleted event was settled
      if (evt && evt.isSettled && evt.settledSurplus > 0) {
        const currentBank = prev.society?.treasury?.bankBalance || 0;
        const currentCash = prev.society?.treasury?.cashBalance || 0;
        const surplus = Number(evt.settledSurplus || 0);
        const dest = evt.settledDestination || 'cash';

        const newBank = dest === 'bank' ? Math.max(0, currentBank - surplus) : currentBank;
        const newCash = dest === 'cash' ? Math.max(0, currentCash - surplus) : currentCash;

        updatedSociety = {
          ...prev.society,
          treasury: {
            bankBalance: newBank,
            cashBalance: newCash,
            totalReserve: newBank + newCash
          }
        };
      }

      return {
        ...prev,
        society: updatedSociety,
        events: prev.events.filter((e) => e.id !== eventId)
      };
    });
    setCurrentView('dashboard');
  };

  // MEMBER CRUD
  const addMember = (memberData) => {
    const newMember = {
      id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      flat: (memberData.flat || '').trim().toUpperCase(),
      name: (memberData.name || '').trim(),
      phone: (memberData.phone || '').trim().replace(/\D/g, ''),
      role: memberData.role || 'Member'
    };

    setData((prev) => ({
      ...prev,
      members: [...prev.members, newMember]
    }));

    return newMember;
  };

  const updateMember = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      members: prev.members.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            flat: (updatedFields.flat || m.flat).trim().toUpperCase(),
            name: (updatedFields.name || m.name).trim(),
            phone: (updatedFields.phone !== undefined ? updatedFields.phone : m.phone).trim().replace(/\D/g, ''),
            role: updatedFields.role || m.role
          };
        }
        return m;
      })
    }));
  };

  const deleteMember = (id) => {
    setData((prev) => {
      const updatedMembers = prev.members.filter((m) => m.id !== id);
      const updatedEvents = prev.events.map((evt) => ({
        ...evt,
        contributions: (evt.contributions || []).filter((c) => c.memberId !== id)
      }));
      return {
        ...prev,
        members: updatedMembers,
        events: updatedEvents
      };
    });
  };

  const quickAddFlats = (flatsList) => {
    const newMembers = flatsList.map((f, idx) => ({
      id: `m-${Date.now()}-${idx}`,
      flat: f.flat.toUpperCase(),
      name: f.name || `Resident ${f.flat}`,
      phone: f.phone || '',
      role: f.role || 'Member'
    }));

    setData((prev) => {
      const existingFlats = new Set(prev.members.map((m) => m.flat));
      const filtered = newMembers.filter((m) => !existingFlats.has(m.flat));
      return {
        ...prev,
        members: [...prev.members, ...filtered]
      };
    });
  };

  // CONTRIBUTIONS
  const recordContribution = (eventId, memberId, amount, mode) => {
    const receiptNo = `REC-${new Date().getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 900) + 100)}`;

    setData((prev) => {
      const updatedEvents = prev.events.map((evt) => {
        if (evt.id === eventId) {
          const filtered = (evt.contributions || []).filter((c) => c.memberId !== memberId);
          return {
            ...evt,
            contributions: [
              ...filtered,
              {
                memberId,
                amount: Number(amount),
                mode,
                date: new Date().toISOString().split('T')[0],
                receiptNo
              }
            ]
          };
        }
        return evt;
      });

      return { ...prev, events: updatedEvents };
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#E65100', '#FFA000', '#FFD54F', '#2E7D32']
      });
    } catch (_) {}
  };

  const removeContribution = (eventId, memberId) => {
    setData((prev) => {
      const updatedEvents = prev.events.map((evt) => {
        if (evt.id === eventId) {
          return {
            ...evt,
            contributions: (evt.contributions || []).filter((c) => c.memberId !== memberId)
          };
        }
        return evt;
      });
      return { ...prev, events: updatedEvents };
    });
  };

  // EXPENSES / BILLS (Completely Free-Form, No pre-predicted categories!)
  const addExpense = (eventId, expenseData) => {
    const newExpense = {
      id: `exp-${Date.now()}`,
      title: expenseData.title.trim(),
      amount: Number(expenseData.amount),
      vendor: (expenseData.vendor || '').trim() || 'Vendor',
      paidBy: (expenseData.paidBy || '').trim() || 'Treasurer',
      date: expenseData.date || new Date().toISOString().split('T')[0],
      receiptNote: (expenseData.receiptNote || '').trim()
    };

    setData((prev) => {
      const updatedEvents = prev.events.map((evt) => {
        if (evt.id === eventId) {
          return {
            ...evt,
            expenses: [newExpense, ...(evt.expenses || [])]
          };
        }
        return evt;
      });
      return { ...prev, events: updatedEvents };
    });
  };

  const updateExpense = (eventId, expenseId, updatedData) => {
    setData((prev) => {
      const updatedEvents = prev.events.map((evt) => {
        if (evt.id === eventId) {
          return {
            ...evt,
            expenses: (evt.expenses || []).map((exp) => {
              if (exp.id === expenseId) {
                return {
                  ...exp,
                  title: updatedData.title !== undefined ? updatedData.title.trim() : exp.title,
                  amount: updatedData.amount !== undefined ? Number(updatedData.amount) : exp.amount,
                  vendor: updatedData.vendor !== undefined ? updatedData.vendor.trim() : exp.vendor,
                  paidBy: updatedData.paidBy !== undefined ? updatedData.paidBy.trim() : exp.paidBy,
                  date: updatedData.date !== undefined ? updatedData.date : exp.date,
                  receiptNote: updatedData.receiptNote !== undefined ? updatedData.receiptNote.trim() : exp.receiptNote
                };
              }
              return exp;
            })
          };
        }
        return evt;
      });
      return { ...prev, events: updatedEvents };
    });
  };

  const deleteExpense = (eventId, expenseId) => {
    setData((prev) => {
      const updatedEvents = prev.events.map((evt) => {
        if (evt.id === eventId) {
          return {
            ...evt,
            expenses: (evt.expenses || []).filter((e) => e.id !== expenseId)
          };
        }
        return evt;
      });
      return { ...prev, events: updatedEvents };
    });
  };

  // EXPORT / BROADCAST HELPERS
  const generateWhatsAppSummary = (event) => {
    if (!event) return '';
    const stats = getEventStats(event);
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    let text = `🚩 *${(society.name || 'SOCIETY MANDAL').toUpperCase()}* 🚩\n`;
    text += `*${(event.title || 'FESTIVAL').toUpperCase()}*\n`;
    text += `📅 Accounts Update: ${dateStr}\n\n`;
    text += `💰 *FINANCIAL SUMMARY:*\n`;
    text += `• Target Budget: ₹${(event.estimatedBudget || 0).toLocaleString('en-IN')}\n`;
    text += `• Total Collected: ₹${stats.totalCollected.toLocaleString('en-IN')} (${stats.count} of ${stats.totalMembers} Flats Paid)\n`;
    text += `• Total Spent: ₹${stats.totalSpent.toLocaleString('en-IN')}\n`;
    text += `• In-Hand Balance: *₹${stats.balance.toLocaleString('en-IN')}*\n`;
    text += `• Society General Corpus: ₹${(society.treasury?.totalReserve || 0).toLocaleString('en-IN')}\n\n`;

    if (event.expenses && event.expenses.length > 0) {
      text += `📋 *BILLS LOGGED:*\n`;
      event.expenses.slice(0, 6).forEach((exp) => {
        text += ` - ${exp.title}: ₹${Number(exp.amount || 0).toLocaleString('en-IN')} (${exp.vendor})\n`;
      });
      text += `\n`;
    }

    text += `🙏 *A heartfelt thank you to all families who contributed!*\n`;
    if (society.upiId) {
      text += `📲 Pay your contribution via UPI: *${society.upiId}*\n`;
    }
    text += `🔗 Live Accounts Link: ${window.location.origin}\n`;

    return text;
  };

  const getMemberWhatsAppReminderUrl = (member, event) => {
    if (!event || !member) return '#';
    const politeMessage = `Namaste ${member.name} Ji (Flat ${member.flat}) 🙏\n\n` +
      `${society.name} is organizing *${event.title}*.\n` +
      `The community contribution is *₹${event.targetPerMember} per flat*.\n\n` +
      `Kindly transfer via UPI to *${society.upiId}* or pay cash to the committee.\n\n` +
      `Your support ensures smooth celebrations for our society! Thank you.`;

    const encoded = encodeURIComponent(politeMessage);
    const phone = (member.phone || '').replace(/\D/g, '');
    return phone ? `https://wa.me/91${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  };

  return (
    <MandalContext.Provider
      value={{
        authSession,
        currentSocietyId,
        isAuthenticated,
        login,
        signup,
        forgotPassword,
        verifyAccount,
        resetPasswordWithPin,
        logout,
        society,
        members,
        events,
        selectedEventId,
        setSelectedEventId,
        selectedEvent,
        currentView,
        setCurrentView,
        eventTab,
        setEventTab,
        isAdmin,
        unlockAdmin,
        lockAdmin,
        getEventStats,
        getOverallSocietyStats,
        updateSociety,
        createNewEvent,
        updateEvent,
        deleteEvent,
        completeAndSettleEvent,
        reopenEvent,
        addMember,
        updateMember,
        deleteMember,
        quickAddFlats,
        recordContribution,
        removeContribution,
        addExpense,
        updateExpense,
        deleteExpense,
        resetToCleanData,
        loadSampleDemoData,
        generateWhatsAppSummary,
        getMemberWhatsAppReminderUrl,
        isCloudConnected,
        cloudSyncStatus,
        connectCloudDatabase,
        disconnectCloudDatabase
      }}
    >
      {children}
    </MandalContext.Provider>
  );
}

export function useMandal() {
  return useContext(MandalContext);
}
