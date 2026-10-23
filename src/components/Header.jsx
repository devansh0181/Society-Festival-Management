import React from 'react';
import { useMandal } from '../context/MandalContext';
import { Shield, ShieldCheck, Landmark, LayoutDashboard, Users, Settings } from 'lucide-react';

export default function Header({ onOpenAdminModal, onOpenSocietySettings }) {
  const { society, isAdmin, lockAdmin, members, currentView, setCurrentView } = useMandal();

  const treasury = society?.treasury || { bankBalance: 0, cashBalance: 0, totalReserve: 0 };

  return (
    <header className="festival-header" id="mandal-header">
      <div className="header-top">
        <div className="mandal-brand" onClick={() => setCurrentView('dashboard')} style={{ cursor: 'pointer' }}>
          <img 
            src="/mandal-logo.jpg" 
            alt="Shakti Yuvak Mandal Logo" 
            className="mandal-avatar"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="mandal-title-group">
            <h1>{society?.name || 'Shakti Yuvak Mandal'}</h1>
            <div className="mandal-tagline">
              {society?.subtitle || 'Residential Society'} • {members.length} Flats
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Society Settings Button for Admin */}
          {isAdmin && (
            <button
              id="header-society-settings-btn"
              onClick={onOpenSocietySettings}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.4)',
                color: '#FFF',
                borderRadius: '999px',
                padding: '6px 10px',
                fontSize: '11.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Edit Society Name, Opening Money & UPI"
            >
              <Settings size={13} />
              <span>Settings</span>
            </button>
          )}

          {/* Admin Login/Lock Button */}
          {isAdmin ? (
            <button 
              id="admin-status-btn"
              className="admin-badge-btn unlocked" 
              onClick={lockAdmin}
              title="Admin Active (Click to switch to Normal Public View)"
            >
              <ShieldCheck size={14} />
              <span>Admin (Active)</span>
            </button>
          ) : (
            <button 
              id="admin-status-btn"
              className="admin-badge-btn" 
              onClick={onOpenAdminModal}
              title="Admin Access (PIN: 1234)"
            >
              <Shield size={14} />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Society Mandal Reserve / Corpus Fund Banner */}
      <div className="treasury-bar" id="mandal-treasury-bar">
        <div>
          <div className="treasury-label">
            <Landmark size={14} />
            <span>Mandal General Corpus (Main Amount)</span>
          </div>
          <div className="treasury-splits">
            Bank: ₹{(treasury.bankBalance || 0).toLocaleString('en-IN')} • Cash: ₹{(treasury.cashBalance || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="treasury-values" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="treasury-amount">
            ₹{(treasury.totalReserve || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Top Main Navigation Switcher */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px' }}>
        <button
          id="nav-btn-dashboard"
          onClick={() => setCurrentView('dashboard')}
          style={{
            flex: 1,
            padding: '7px 12px',
            borderRadius: '8px',
            border: 'none',
            background: currentView === 'dashboard' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)',
            color: currentView === 'dashboard' ? 'var(--maroon-900)' : '#FFF',
            fontWeight: 700,
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <LayoutDashboard size={14} />
          <span>Society Dashboard</span>
        </button>

        <button
          id="nav-btn-members"
          onClick={() => setCurrentView('members')}
          style={{
            flex: 1,
            padding: '7px 12px',
            borderRadius: '8px',
            border: 'none',
            background: currentView === 'members' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)',
            color: currentView === 'members' ? 'var(--maroon-900)' : '#FFF',
            fontWeight: 700,
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Users size={14} />
          <span>Members Directory ({members.length})</span>
        </button>
      </div>
    </header>
  );
}
