import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import { 
  Building, 
  Landmark, 
  Users, 
  Calendar, 
  TrendingUp, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Receipt,
  User,
  Settings,
  Lock
} from 'lucide-react';

export default function SocietyDashboard({ 
  onOpenCreateEvent, 
  onOpenEditEvent, 
  onOpenGetStarted, 
  onOpenProfile,
  onOpenSocietySettings, 
  onOpenAdminModal,
  onSelectEvent 
}) {
  const { 
    society, 
    events, 
    members, 
    isAdmin, 
    getOverallSocietyStats, 
    getEventStats, 
    deleteEvent,
    updateSociety 
  } = useMandal();

  const [filter, setFilter] = useState('all'); // all | active | completed

  const overall = getOverallSocietyStats();

  const filteredEvents = events.filter((evt) => {
    if (filter === 'all') return true;
    return evt.status === filter;
  });

  // Wizard is permanently hidden once completed or dismissed
  const isWizardDone = Boolean(
    society?.wizardCompleted || 
    (typeof window !== 'undefined' && localStorage.getItem(`setup_wizard_done_${society?.id}`) === 'true')
  );
  const shouldShowWizard = !isWizardDone && events.length === 0 && members.length === 0;

  return (
    <div id="society-dashboard-view">
      {/* 1. Get Started Banner for New/Empty Setup */}
      {shouldShowWizard && (
        <div 
          style={{
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)',
            border: '1.5px solid var(--saffron-200)',
            borderRadius: '16px',
            padding: '18px 20px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFEDD5', color: 'var(--saffron-900)', padding: '3px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700 }}>
                  <Sparkles size={13} />
                  <span>Quick Setup Wizard</span>
                </div>
                {!isAdmin && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#991B1B', background: '#FEE2E2', padding: '2px 8px', borderRadius: '6px' }}>
                    🔒 Admin Access Only
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)' }}>
                Welcome to {society.name}!
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-body)', marginTop: '4px', lineHeight: 1.45 }}>
                Configure your society name, opening treasury money, register flats, and publish your first festival event in 4 quick steps.
              </p>
            </div>

            {isAdmin ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  id="btn-launch-setup-wizard"
                  className="action-btn"
                  onClick={onOpenGetStarted}
                  style={{
                    background: 'var(--saffron-900)',
                    color: '#FFF',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Launch Setup Wizard</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  onClick={() => {
                    updateSociety({ wizardCompleted: true });
                    try {
                      if (society?.id) localStorage.setItem(`setup_wizard_done_${society.id}`, 'true');
                    } catch (_) {}
                  }}
                  style={{
                    background: '#FFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                  title="Dismiss setup wizard"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <button
                id="btn-launch-setup-wizard-locked"
                className="action-btn"
                onClick={() => {
                  alert("Admin Access Required: Only the society administrator can configure society setup. Please click 'Admin Login' in the top header and enter your 4-digit PIN.");
                  if (onOpenAdminModal) onOpenAdminModal();
                }}
                style={{
                  background: '#94A3B8',
                  color: '#FFF',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
                title="Admin PIN required to configure society setup"
              >
                <Lock size={15} />
                <span>Admin Only (Unlock PIN)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Top Organization Overview Metrics */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Building size={19} color="var(--saffron-900)" />
              <span>Society Organization Dashboard</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Overall financial health, treasury reserves, and community festival track records.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenProfile || onOpenSocietySettings}
              style={{
                background: '#FFF',
                border: '1px solid var(--border-medium)',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '12px',
                color: 'var(--text-dark)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600
              }}
              title="Edit Society Name, Opening Treasury, UPI ID & Contacts"
            >
              <User size={13} color="var(--saffron-900)" />
              <span>Society Profile</span>
            </button>
          )}
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="budget-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          {/* Main Society Reserve */}
          <div className="stat-box" style={{ background: '#F8FAFC', borderLeft: '4px solid var(--blue-600)' }}>
            <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Landmark size={12} color="var(--blue-600)" />
              <span>General Corpus</span>
            </div>
            <div className="stat-value" style={{ color: 'var(--blue-600)', fontSize: '18px' }}>
              ₹{overall.generalCorpus.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-light)', marginTop: '2px' }}>
              Bank: ₹{(society.treasury?.bankBalance || 0).toLocaleString('en-IN')} • Cash: ₹{(society.treasury?.cashBalance || 0).toLocaleString('en-IN')}
            </div>
            {overall.totalSettledSurplus > 0 && (
              <div style={{ fontSize: '10.5px', color: 'var(--green-600)', marginTop: '3px', fontWeight: 700 }}>
                Includes +₹{overall.totalSettledSurplus.toLocaleString('en-IN')} surplus from completed festivals
              </div>
            )}
          </div>

          {/* Total Collections */}
          <div className="stat-box highlight" style={{ borderLeft: '4px solid var(--saffron-900)' }}>
            <div className="stat-label">Total Collections</div>
            <div className="stat-value saffron" style={{ fontSize: '18px' }}>
              ₹{overall.totalCollectedAll.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--saffron-900)', marginTop: '2px', fontWeight: 600 }}>
              Across {events.length} Festivals
            </div>
          </div>

          {/* Total Spent */}
          <div className="stat-box spent" style={{ borderLeft: '4px solid var(--maroon-900)' }}>
            <div className="stat-label">Total Spent</div>
            <div className="stat-value" style={{ color: 'var(--maroon-900)', fontSize: '18px' }}>
              ₹{overall.totalSpentAll.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              All Verified Bills
            </div>
          </div>

          {/* Net Festival Surplus */}
          <div className={`stat-box ${overall.netFestivalBalance >= 0 ? 'surplus' : 'spent'}`} style={{ borderLeft: `4px solid ${overall.netFestivalBalance >= 0 ? 'var(--green-600)' : 'var(--red-600)'}` }}>
            <div className="stat-label">Festival In-Hand</div>
            <div className={`stat-value ${overall.netFestivalBalance >= 0 ? 'green' : 'red'}`} style={{ fontSize: '18px' }}>
              {overall.netFestivalBalance >= 0 ? '+' : ''}₹{overall.netFestivalBalance.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10.5px', color: overall.netFestivalBalance >= 0 ? 'var(--green-600)' : 'var(--red-600)', marginTop: '2px', fontWeight: 600 }}>
              {overall.netFestivalBalance >= 0 ? 'Surplus Balance' : 'Deficit'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. All Festival Events Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-dark)' }}>
              Festival Celebrations ({events.length})
            </h4>

            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '2px', borderRadius: '8px' }}>
              {['all', 'active', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    border: 'none',
                    background: filter === f ? '#FFF' : 'transparent',
                    color: filter === f ? 'var(--text-dark)' : 'var(--text-muted)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    textTransform: 'capitalize'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (
            <button
              id="btn-create-first-event"
              className="action-btn"
              onClick={onOpenCreateEvent}
              style={{
                padding: '7px 14px',
                fontSize: '12px',
                background: 'var(--saffron-900)',
                color: '#FFF',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <PlusCircle size={14} />
              <span>+ Create Event</span>
            </button>
          )}
        </div>

        {/* Zero Events State */}
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '45px 20px', background: '#FFFDF9', borderRadius: '16px', border: '1.5px dashed var(--border-medium)' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🚩</div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)' }}>No Events Created Yet</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '360px', margin: '8px auto 18px', lineHeight: 1.5 }}>
              {isAdmin
                ? 'Create your first celebration event (e.g. Ganesh Chaturthi, Navratri, Diwali) to set target budgets, collect contributions, and track bills.'
                : 'No festivals or events have been scheduled yet by the society committee.'}
            </p>

            {isAdmin && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={onOpenCreateEvent}
                  className="submit-btn"
                  style={{ width: 'auto', padding: '9px 20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <PlusCircle size={15} />
                  <span>+ Create First Festival Event</span>
                </button>
                <button
                  onClick={onOpenGetStarted}
                  style={{
                    background: '#FFF',
                    border: '1.5px solid var(--border-medium)',
                    borderRadius: '10px',
                    padding: '9px 18px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={14} color="var(--saffron-900)" />
                  <span>Use Setup Wizard</span>
                </button>
              </div>
            )}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', background: '#F9FAFB', borderRadius: '12px' }}>
            No events found under "{filter}".
          </div>
        ) : (
          /* Events Grid Cards */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {filteredEvents.map((evt) => {
              const stats = getEventStats(evt);
              const isSurplus = stats.balance >= 0;

              return (
                <div
                  key={evt.id}
                  id={`dashboard-event-card-${evt.id}`}
                  className="fest-card"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                  onClick={() => onSelectEvent(evt.id)}
                >
                  {/* Top Bar: Icon, Title, Status & Admin Actions */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}>{evt.icon || '🚩'}</span>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)' }}>
                            {evt.title}
                          </h4>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Calendar size={12} />
                            <span>{evt.dates || 'Upcoming'}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: evt.status === 'active' ? '#DCFCE7' : evt.status === 'completed' ? '#E0F2FE' : '#FEF3C7',
                            color: evt.status === 'active' ? '#166534' : evt.status === 'completed' ? '#075985' : '#92400E'
                          }}
                        >
                          {evt.status}
                        </span>

                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditEvent(evt);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '3px'
                            }}
                            title="Edit Event"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px', marginTop: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target</div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-dark)', marginTop: '2px' }}>
                            ₹{(evt.estimatedBudget || 0).toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--saffron-900)', textTransform: 'uppercase' }}>Collected</div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--saffron-900)', marginTop: '2px' }}>
                            ₹{stats.totalCollected.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--maroon-900)', textTransform: 'uppercase' }}>Spent</div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--maroon-900)', marginTop: '2px' }}>
                            ₹{stats.totalSpent.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {/* Mini Progress Bar */}
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                          <span>Collection Progress ({stats.budgetPercent}%)</span>
                          <span>In-Hand: <strong>₹{stats.balance.toLocaleString('en-IN')}</strong></span>
                        </div>
                        <div style={{ height: '6px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, stats.budgetPercent)}%`,
                              background: 'linear-gradient(90deg, var(--saffron-500) 0%, var(--green-600) 100%)',
                              borderRadius: '999px'
                            }}
                          />
                        </div>
                      </div>

                      {/* Completed & Settled Banner */}
                      {evt.status === 'completed' && (
                        <div style={{ marginTop: '9px', padding: '5px 8px', background: '#F0FDF4', borderRadius: '6px', border: '1px solid #BBF7D0', fontSize: '10.5px', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>✅</span>
                          <span>Completed • +₹{(evt.settledSurplus !== undefined ? evt.settledSurplus : stats.surplus).toLocaleString('en-IN')} Settled to Main Treasury</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      <strong>{stats.count}</strong> of {stats.totalMembers} Flats Paid
                    </div>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: 'var(--saffron-900)' }}>
                      <span>View Charts & Details</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
