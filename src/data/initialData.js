// Initial Data & Defaults for Community Society Festival & Treasury Management

// Clean Blank Slate: Absolutely NO dummy events, NO dummy members, NO dummy contributions or expenses
export const CLEAN_DATA = {
  society: {
    id: 'society-1',
    name: 'Shakti Yuvak Mandal',
    subtitle: 'Residential Society Welfare & Festivals',
    tagline: 'Satya, Seva aur Samarpan',
    location: 'Society Campus',
    upiId: 'shaktimandal@upi',
    adminPin: '1234',
    treasury: {
      bankBalance: 0,
      cashBalance: 0,
      totalReserve: 0
    }
  },
  members: [],
  events: [] // ZERO events - admin creates them or uses Get Started wizard
};

export const MEMBER_ROLES = [
  'Member',
  'President',
  'Secretary',
  'Treasurer',
  'Committee Member'
];

// Optional Demo Dataset (Only loaded if user explicitly clicks "Load Sample Demo Data" in footer)
export const DEMO_MEMBERS = [
  { id: 'm1', flat: 'A-101', name: 'Suresh Patel', phone: '9825012341', role: 'President' },
  { id: 'm2', flat: 'A-102', name: 'Devansh Shrimali', phone: '9825012342', role: 'Treasurer' },
  { id: 'm3', flat: 'A-103', name: 'Rajesh Sharma', phone: '9825012343', role: 'Secretary' },
  { id: 'm4', flat: 'A-104', name: 'Amit Joshi', phone: '9825012344', role: 'Committee Member' },
  { id: 'm5', flat: 'A-201', name: 'Nilesh Shah', phone: '9825012345', role: 'Member' },
  { id: 'm6', flat: 'A-202', name: 'Harish Mehta', phone: '9825012346', role: 'Member' },
  { id: 'm7', flat: 'B-101', name: 'Arvind Rathod', phone: '9825012347', role: 'Member' },
  { id: 'm8', flat: 'B-102', name: 'Paresh Thakkar', phone: '9825012348', role: 'Member' }
];

export const DEMO_DATA = {
  society: {
    id: 'society-1',
    name: 'Shakti Yuvak Mandal',
    subtitle: 'Gokul Heights Residential Society',
    tagline: 'Satya, Seva aur Samarpan • Estd. 1978',
    location: 'Satellite Road, Ahmedabad',
    upiId: 'shaktimandal@okhdfcbank',
    adminPin: '1234',
    treasury: {
      bankBalance: 14500,
      cashBalance: 4000,
      totalReserve: 18500
    }
  },
  members: DEMO_MEMBERS,
  events: [
    {
      id: 'demo-ganesh-2026',
      title: 'Ganesh Chaturthi Mahotsav 2026',
      badge: 'Active Festival',
      dates: '07 Sep - 17 Sep 2026',
      status: 'active',
      icon: '🚩',
      estimatedBudget: 25000,
      targetPerMember: 1000,
      notes: '10 Days Grand Utsav with Daily Aarti, Prasad, and Dhol-Tasha Visarjan Yatra',
      contributions: [
        { memberId: 'm1', amount: 1200, mode: 'UPI', date: '2026-08-28', receiptNo: 'SYM-26-001' },
        { memberId: 'm2', amount: 1500, mode: 'UPI', date: '2026-08-28', receiptNo: 'SYM-26-002' },
        { memberId: 'm3', amount: 1000, mode: 'Cash', date: '2026-08-29', receiptNo: 'SYM-26-003' },
        { memberId: 'm4', amount: 1000, mode: 'UPI', date: '2026-08-29', receiptNo: 'SYM-26-004' }
      ],
      expenses: [
        {
          id: 'exp-1',
          title: 'Mandap Stage, Flower Garlands & LED Lights',
          vendor: 'Jay Ambe Decorators',
          amount: 4500,
          paidBy: 'Devansh (Treasurer)',
          date: '2026-09-06',
          receiptNote: 'Bill #JA-402'
        },
        {
          id: 'exp-2',
          title: 'Petrol for Electricity Generator',
          vendor: 'HP Petrol Pump',
          amount: 800,
          paidBy: 'Rajesh Sharma',
          date: '2026-09-07',
          receiptNote: 'Fuel Receipt Cash'
        }
      ]
    }
  ]
};

export const INITIAL_DATA = CLEAN_DATA;
export const INITIAL_MEMBERS = CLEAN_DATA.members;
