import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import { BarChart3, TrendingUp, Search, Calendar, CheckCircle2, XCircle, Users } from 'lucide-react';

export default function AnalyticsTab() {
  const { events, members, getEventStats, setActiveTab } = useMandal();
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');

  // Selected member for history inspection
  const activeMember = members.find((m) => m.id === selectedMemberId) || members[0] || null;

  // Calculate member's participation across all events
  const memberHistory = activeMember
    ? events.map((evt) => {
        const contribution = (evt.contributions || []).find((c) => c.memberId === activeMember.id);
        return {
          eventTitle: evt.title,
          dates: evt.dates,
          hasPaid: Boolean(contribution),
          amount: contribution ? Number(contribution.amount || 0) : 0,
          mode: contribution ? contribution.mode : '-',
          receiptNo: contribution ? contribution.receiptNo : '-'
        };
      })
    : [];

  const totalPaidByMember = memberHistory.reduce((sum, h) => sum + h.amount, 0);

  // Overall festival stats summary
  const eventSummaries = events.map((evt) => {
    const stats = getEventStats(evt);
    return {
      id: evt.id,
      title: evt.title,
      dates: evt.dates,
      budget: evt.estimatedBudget || 0,
      collected: stats.totalCollected,
      spent: stats.totalSpent,
      balance: stats.balance,
      paidCount: stats.count,
      totalCount: stats.totalMembers,
      percent: stats.totalMembers > 0 ? Math.round((stats.count / stats.totalMembers) * 100) : 0
    };
  });

  return (
    <div id="analytics-tab-view">
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BarChart3 size={18} color="var(--saffron-900)" />
          <span>Organization History & Multi-Event Analytics</span>
        </h3>
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
          Historical benchmarks, participation trends, and individual flat contribution track records.
        </p>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 16px', background: '#FFFDF9', borderRadius: '14px', border: '1.5px dashed var(--border-medium)', marginBottom: '16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>No Historical Events Yet</h4>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '340px', margin: '6px auto' }}>
            As you celebrate and manage festivals over time, comparative charts and financial surplus data will automatically appear here.
          </p>
        </div>
      ) : (
        /* 1. Event Comparison Table */
        <div className="fest-card" style={{ padding: '14px', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '10px' }}>
            Festival Performance & Balance History
          </h4>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 4px' }}>Festival</th>
                  <th style={{ padding: '8px 4px' }}>Budget</th>
                  <th style={{ padding: '8px 4px' }}>Collected</th>
                  <th style={{ padding: '8px 4px' }}>Spent</th>
                  <th style={{ padding: '8px 4px' }}>Surplus</th>
                  <th style={{ padding: '8px 4px' }}>Turnout</th>
                </tr>
              </thead>
              <tbody>
                {eventSummaries.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '8px 4px', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {item.title}
                    </td>
                    <td style={{ padding: '8px 4px' }}>₹{item.budget.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 4px', color: 'var(--saffron-900)', fontWeight: 600 }}>
                      ₹{item.collected.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '8px 4px', color: 'var(--maroon-900)' }}>
                      ₹{item.spent.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '8px 4px', color: item.balance >= 0 ? 'var(--green-600)' : 'var(--red-600)', fontWeight: 700 }}>
                      {item.balance >= 0 ? '+' : ''}₹{item.balance.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '8px 4px' }}>
                      <span style={{ background: '#ECFDF5', color: '#047857', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                        {item.percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Member Track Record Inspector */}
      {members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 16px', background: '#FFFDF9', borderRadius: '14px', border: '1.5px dashed var(--border-medium)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>No Members Registered</h4>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '340px', margin: '6px auto 14px' }}>
            Add society members to inspect their individual payment records across past festivals.
          </p>
          <button
            onClick={() => setActiveTab('members')}
            className="action-btn"
            style={{ background: 'var(--saffron-900)', color: '#FFF', padding: '8px 16px', fontSize: '12px', margin: '0 auto' }}
          >
            Go to Members Directory
          </button>
        </div>
      ) : activeMember ? (
        <div className="fest-card" style={{ padding: '14px' }}>
          <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
            Member Lifetime Contribution Inspector
          </h4>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Select any resident or flat to verify their past festival payment records.
          </p>

          {/* Member Selector Dropdown */}
          <div style={{ marginBottom: '14px' }}>
            <select
              id="member-analytics-select"
              className="form-select"
              value={activeMember.id}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.flat} - {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Member Card */}
          <div style={{ background: 'var(--bg-body)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)' }}>
                  {activeMember.name} ({activeMember.flat})
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {activeMember.phone ? `Phone: +91 ${activeMember.phone} • ` : ''}{activeMember.role}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Contributed</div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--green-600)' }}>
                  ₹{totalPaidByMember.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Events checklist for this member */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {memberHistory.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '10px 0' }}>
                  No festival events recorded yet.
                </div>
              ) : (
                memberHistory.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: h.hasPaid ? '#F0FDF4' : '#FEF2F2',
                      border: `1px solid ${h.hasPaid ? '#BBF7D0' : '#FECACA'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {h.hasPaid ? (
                        <CheckCircle2 size={16} color="var(--green-600)" />
                      ) : (
                        <XCircle size={16} color="var(--red-600)" />
                      )}
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-dark)' }}>
                        {h.eventTitle}
                      </span>
                    </div>

                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: h.hasPaid ? 'var(--green-600)' : 'var(--red-600)' }}>
                      {h.hasPaid ? `₹${h.amount.toLocaleString('en-IN')} (${h.mode})` : 'Pending'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
