import React from 'react';
import { useMandal } from '../context/MandalContext';
import { Calendar, Users, PlusCircle } from 'lucide-react';

export default function BudgetOverview({ onOpenCreateEvent }) {
  const { selectedEvent, getEventStats, isAdmin, members } = useMandal();

  if (!selectedEvent) {
    return (
      <div className="budget-hero" id="budget-overview-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>🚩</div>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-dark)' }}>No Active Festival Event</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', margin: '6px auto 18px', lineHeight: 1.5 }}>
          {isAdmin 
            ? 'Publish a new festival celebration (e.g. Ganesh Chaturthi, Diwali Sneh Milan) to set target budgets and track collections.'
            : 'No society events are currently scheduled. Please check back when the committee announces the next celebration.'}
        </p>
        {isAdmin && (
          <button
            id="btn-zero-create-event"
            className="submit-btn"
            onClick={onOpenCreateEvent}
            style={{ width: 'auto', padding: '9px 20px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={15} />
            <span>+ Create First Festival Event</span>
          </button>
        )}
      </div>
    );
  }

  const stats = getEventStats(selectedEvent);
  const isSurplus = stats.balance >= 0;

  return (
    <div className="budget-hero" id="budget-overview-card">
      <div className="fest-card-header" style={{ marginBottom: '14px' }}>
        <div>
          <h2 className="fest-card-title">
            <span>{selectedEvent.icon || '🚩'}</span>
            <span>{selectedEvent.title}</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} />
              {selectedEvent.dates || 'Upcoming'}
            </span>
            <span>•</span>
            <span>Target: ₹{(selectedEvent.targetPerMember || 0).toLocaleString('en-IN')} / Flat</span>
          </div>
        </div>

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
          {selectedEvent.status || 'Active'}
        </span>
      </div>

      {/* 4 Stats Grid */}
      <div className="budget-stats-grid">
        <div className="stat-box">
          <div className="stat-label">Estimated Budget</div>
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
          <div className="stat-label">Total Spent</div>
          <div className="stat-value" style={{ color: 'var(--maroon-900)' }}>
            ₹{stats.totalSpent.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {(selectedEvent.expenses || []).length} Bills Logged
          </div>
        </div>

        <div className={`stat-box ${isSurplus ? 'surplus' : 'spent'}`}>
          <div className="stat-label">In-Hand Balance</div>
          <div className={`stat-value ${isSurplus ? 'green' : 'red'}`}>
            {isSurplus ? '+' : ''}₹{stats.balance.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: isSurplus ? 'var(--green-600)' : 'var(--red-600)', fontWeight: 600, marginTop: '2px' }}>
            {isSurplus ? 'Surplus Reserve' : 'Deficit Due'}
          </div>
        </div>
      </div>

      {/* Collection Progress Bar */}
      <div className="progress-container">
        <div className="progress-labels">
          <span>Target Progress ({stats.budgetPercent}%)</span>
          <span>Pending: ₹{Math.max(0, (selectedEvent.estimatedBudget || 0) - stats.totalCollected).toLocaleString('en-IN')}</span>
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(100, stats.budgetPercent)}%` }} 
          />
        </div>
      </div>
    </div>
  );
}
