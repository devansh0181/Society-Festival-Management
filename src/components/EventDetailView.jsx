import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import ContributorsTab from './ContributorsTab';
import AdminDefaultersTab from './AdminDefaultersTab';
import ExpensesTab from './ExpensesTab';
import CompleteEventModal from './CompleteEventModal';
import { 
  ArrowLeft, 
  Calendar, 
  Edit3, 
  BarChart2, 
  Award, 
  Clock, 
  Receipt, 
  TrendingUp, 
  CheckCircle2, 
  Share2,
  PieChart
} from 'lucide-react';

export default function EventDetailView({ 
  onBackToDashboard, 
  onOpenEditEvent, 
  onOpenMarkPaid, 
  onOpenAddExpense, 
  onOpenEditExpense, 
  onOpenAddMember, 
  onOpenAdminModal,
  onOpenExport
}) {
  const { selectedEvent, getEventStats, members, isAdmin, eventTab, setEventTab, reopenEvent } = useMandal();
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  if (!selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: '#FFFDF9', borderRadius: '16px' }}>
        <h3>No event selected</h3>
        <button className="submit-btn" onClick={onBackToDashboard} style={{ width: 'auto', padding: '8px 18px', margin: '14px auto 0' }}>
          Back to Society Dashboard
        </button>
      </div>
    );
  }

  const stats = getEventStats(selectedEvent);
  const isSurplus = stats.balance >= 0;

  // Chart data calculations
  const budget = selectedEvent.estimatedBudget || 1;
  const collected = stats.totalCollected;
  const spent = stats.totalSpent;
  const budgetAchievedPercent = Math.min(150, Math.round((collected / budget) * 100));
  const budgetSpentPercent = Math.min(150, Math.round((spent / budget) * 100));
  const turnoutPercent = members.length > 0 ? Math.round((stats.count / members.length) * 100) : 0;

  return (
    <div id="event-detail-view">
      {/* 1. Navigation Back Button & Event Banner */}
      <div style={{ marginBottom: '16px' }}>
        <button
          id="btn-back-to-dashboard"
          onClick={onBackToDashboard}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--saffron-900)',
            fontSize: '12.5px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            padding: '4px 0',
            marginBottom: '10px'
          }}
        >
          <ArrowLeft size={15} />
          <span>← Back to All Society Events</span>
        </button>

        {/* Event Header Banner */}
        <div className="fest-card" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 100%)', border: '1.5px solid var(--saffron-200)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>{selectedEvent.icon || '🚩'}</span>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                  {selectedEvent.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    {selectedEvent.dates || 'Upcoming'}
                  </span>
                  <span>•</span>
                  <span>Target: <strong>₹{(selectedEvent.targetPerMember || 0).toLocaleString('en-IN')} / Flat</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: selectedEvent.status === 'active' ? '#DCFCE7' : selectedEvent.status === 'completed' ? '#E0F2FE' : '#FEF3C7',
                  color: selectedEvent.status === 'active' ? '#166534' : selectedEvent.status === 'completed' ? '#075985' : '#92400E'
                }}
              >
                {selectedEvent.status}
              </span>

              {isAdmin && selectedEvent.status !== 'completed' && (
                <button
                  id="btn-trigger-complete-event"
                  onClick={() => setIsCompleteModalOpen(true)}
                  style={{
                    background: 'var(--green-600)',
                    border: 'none',
                    color: '#FFF',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Complete event and transfer remaining surplus into society main money"
                >
                  <Award size={13} />
                  <span>Complete Event</span>
                </button>
              )}

              {isAdmin && (
                <button
                  id="btn-edit-selected-event"
                  onClick={() => onOpenEditEvent(selectedEvent)}
                  style={{
                    background: '#FFF',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--text-body)'
                  }}
                  title="Edit Event Details"
                >
                  <Edit3 size={13} color="var(--saffron-900)" />
                  <span>Edit Event</span>
                </button>
              )}
            </div>
          </div>

          {/* Settled Event Callout Banner */}
          {selectedEvent.status === 'completed' && (
            <div style={{
              marginTop: '12px',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="var(--green-600)" />
                <span style={{ fontSize: '12.5px', color: '#166534', fontWeight: 700 }}>
                  Event Completed & Settled: Surplus of ₹{(selectedEvent.settledSurplus !== undefined ? selectedEvent.settledSurplus : stats.surplus).toLocaleString('en-IN')} was added into the Society Main Treasury.
                </span>
              </div>
              {isAdmin && (
                <button
                  id="btn-reopen-event"
                  onClick={() => {
                    if (confirm(`Reopen festival "${selectedEvent.title}"? This will return the surplus from the Main Treasury back to active event balance.`)) {
                      reopenEvent(selectedEvent.id);
                    }
                  }}
                  style={{
                    background: '#FFF',
                    border: '1px solid #86EFAC',
                    color: '#15803D',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Reopen Event
                </button>
              )}
            </div>
          )}

          {selectedEvent.notes && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-body)', background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid var(--saffron-900)' }}>
              {selectedEvent.notes}
            </div>
          )}
        </div>
      </div>

      {/* 2. Sub-Tabs Strip */}
      <div className="tab-nav" id="event-sub-tabs" style={{ marginBottom: '16px' }}>
        <button
          id="event-tab-btn-overview"
          className={`tab-btn ${eventTab === 'overview' ? 'active' : ''}`}
          onClick={(e) => {
            setEventTab('overview');
            e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }}
        >
          <BarChart2 size={14} style={{ flexShrink: 0 }} />
          <span>Charts & Overview</span>
        </button>

        <button
          id="event-tab-btn-contributors"
          className={`tab-btn ${eventTab === 'contributors' ? 'active' : ''}`}
          onClick={(e) => {
            setEventTab('contributors');
            e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }}
        >
          <span style={{ flexShrink: 0 }}>🙏</span>
          <span>Contributors ({stats.count})</span>
        </button>

        <button
          id="event-tab-btn-defaulters"
          className={`tab-btn ${eventTab === 'defaulters' ? 'active' : ''}`}
          onClick={(e) => {
            setEventTab('defaulters');
            e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }}
        >
          <span style={{ flexShrink: 0 }}>⏳</span>
          <span>Pending ({stats.pending})</span>
        </button>

        <button
          id="event-tab-btn-expenses"
          className={`tab-btn ${eventTab === 'expenses' ? 'active' : ''}`}
          onClick={(e) => {
            setEventTab('expenses');
            e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }}
        >
          <Receipt size={14} style={{ flexShrink: 0 }} />
          <span>Bills / Expenses ({(selectedEvent.expenses || []).length})</span>
        </button>
      </div>

      {/* 3. Sub-Tab Content */}

      {/* TAB 1: CHARTS & FINANCIAL OVERVIEW */}
      {eventTab === 'overview' && (
        <div id="event-overview-charts-section">
          {/* 4 Hero Stats */}
          <div className="budget-stats-grid" style={{ marginBottom: '16px' }}>
            <div className="stat-box">
              <div className="stat-label">Estimated Target Budget</div>
              <div className="stat-value">₹{(selectedEvent.estimatedBudget || 0).toLocaleString('en-IN')}</div>
            </div>

            <div className="stat-box highlight">
              <div className="stat-label">Total Collected</div>
              <div className="stat-value saffron">₹{stats.totalCollected.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '11px', color: 'var(--saffron-900)', fontWeight: 600, marginTop: '2px' }}>
                {stats.count} of {stats.totalMembers} Flats Paid
              </div>
            </div>

            <div className="stat-box spent">
              <div className="stat-label">Total Spent (Bills)</div>
              <div className="stat-value" style={{ color: 'var(--maroon-900)' }}>
                ₹{stats.totalSpent.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {(selectedEvent.expenses || []).length} Verified Bills
              </div>
            </div>

            <div className={`stat-box ${isSurplus ? 'surplus' : 'spent'}`}>
              <div className="stat-label">In-Hand Balance</div>
              <div className={`stat-value ${isSurplus ? 'green' : 'red'}`}>
                {isSurplus ? '+' : ''}₹{stats.balance.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: isSurplus ? 'var(--green-600)' : 'var(--red-600)', fontWeight: 600, marginTop: '2px' }}>
                {isSurplus ? 'Surplus Balance' : 'Deficit Due'}
              </div>
            </div>
          </div>

          {/* VISUAL CHARTS SECTION */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            {/* Chart 1: Financial Flow Bar Comparison Chart */}
            <div className="fest-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <BarChart2 size={16} color="var(--saffron-900)" />
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)' }}>
                  Financial Comparison Breakdown
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Bar 1: Target Budget */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-body)' }}>Target Budget</span>
                    <strong>₹{(selectedEvent.estimatedBudget || 0).toLocaleString('en-IN')} (100%)</strong>
                  </div>
                  <div style={{ height: '10px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '100%', background: '#94A3B8', borderRadius: '999px' }} />
                  </div>
                </div>

                {/* Bar 2: Total Collected */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--saffron-900)' }}>Total Collected</span>
                    <strong style={{ color: 'var(--saffron-900)' }}>
                      ₹{stats.totalCollected.toLocaleString('en-IN')} ({stats.budgetPercent}%)
                    </strong>
                  </div>
                  <div style={{ height: '10px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${Math.min(100, stats.budgetPercent)}%`, 
                        background: 'linear-gradient(90deg, #F59E0B, #E65100)', 
                        borderRadius: '999px',
                        transition: 'width 0.6s ease'
                      }} 
                    />
                  </div>
                </div>

                {/* Bar 3: Total Spent */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--maroon-900)' }}>Total Spent</span>
                    <strong style={{ color: 'var(--maroon-900)' }}>
                      ₹{stats.totalSpent.toLocaleString('en-IN')} ({budgetSpentPercent}%)
                    </strong>
                  </div>
                  <div style={{ height: '10px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${Math.min(100, budgetSpentPercent)}%`, 
                        background: '#9F1239', 
                        borderRadius: '999px',
                        transition: 'width 0.6s ease'
                      }} 
                    />
                  </div>
                </div>

                {/* Bar 4: Net Balance */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: isSurplus ? 'var(--green-600)' : 'var(--red-600)' }}>
                      In-Hand Balance
                    </span>
                    <strong style={{ color: isSurplus ? 'var(--green-600)' : 'var(--red-600)' }}>
                      {isSurplus ? '+' : ''}₹{stats.balance.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div style={{ height: '10px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${Math.min(100, Math.max(5, Math.abs(Math.round((stats.balance / budget) * 100))))}%`, 
                        background: isSurplus ? 'var(--green-600)' : 'var(--red-600)', 
                        borderRadius: '999px' 
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Community Participation Gauge Chart */}
            <div className="fest-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <PieChart size={16} color="var(--green-600)" />
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)' }}>
                  Member Participation Rate
                </h4>
              </div>

              {/* Visual Ring / Gauge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 0' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="100" height="100" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#F1F5F9"
                      strokeWidth="3.8"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={turnoutPercent >= 75 ? 'var(--green-600)' : turnoutPercent >= 40 ? 'var(--saffron-900)' : 'var(--blue-600)'}
                      strokeWidth="3.8"
                      strokeDasharray={`${turnoutPercent}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)' }}>
                      {turnoutPercent}%
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Turnout</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--green-600)' }} />
                    <span>Paid: <strong>{stats.count} Flats</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--red-600)' }} />
                    <span>Pending: <strong>{stats.pending} Flats</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#94A3B8' }} />
                    <span>Total: <strong>{stats.totalMembers} Flats</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Jump Button */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={() => setEventTab('contributors')}
                  style={{
                    flex: 1,
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: 'var(--green-600)',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  View Donors ({stats.count})
                </button>
                <button
                  onClick={() => setEventTab('defaulters')}
                  style={{
                    flex: 1,
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: 'var(--red-600)',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  View Pending ({stats.pending})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTRIBUTORS */}
      {eventTab === 'contributors' && <ContributorsTab />}

      {/* TAB 3: PENDING DEFAULTERS */}
      {eventTab === 'defaulters' && (
        <AdminDefaultersTab
          onOpenMarkPaid={onOpenMarkPaid}
          onOpenAdminModal={onOpenAdminModal}
          onOpenAddMember={onOpenAddMember}
        />
      )}

      {/* TAB 4: EXPENSES / BILLS */}
      {eventTab === 'expenses' && (
        <ExpensesTab
          onOpenAddExpense={onOpenAddExpense}
          onOpenEditExpense={onOpenEditExpense}
        />
      )}

      {/* Complete & Settle Event Modal */}
      <CompleteEventModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
}
