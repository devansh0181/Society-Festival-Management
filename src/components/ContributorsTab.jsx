import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import { Search, Award, Trash2 } from 'lucide-react';

export default function ContributorsTab() {
  const { selectedEvent, members, isAdmin, removeContribution, setActiveTab } = useMandal();
  const [search, setSearch] = useState('');

  if (!selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '36px 16px', background: '#F9FAFB', borderRadius: '14px', color: 'var(--text-muted)' }}>
        No festival selected. Please select or create an event above.
      </div>
    );
  }

  const contributions = selectedEvent.contributions || [];

  // Match contribution with member details
  const enrichedList = contributions.map((c) => {
    const member = members.find((m) => m.id === c.memberId) || {
      name: 'Resident',
      flat: 'Flat',
      role: 'Member'
    };
    return { ...c, member };
  });

  // Filter list by search query
  const filtered = enrichedList.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.member.name.toLowerCase().includes(q) ||
      item.member.flat.toLowerCase().includes(q) ||
      (item.receiptNo || '').toLowerCase().includes(q)
    );
  });

  return (
    <div id="contributors-tab-view">
      {/* Header and Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={18} color="var(--saffron-900)" />
            <span>Sahyogi Donors ({contributions.length} Families)</span>
          </h3>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Heartfelt thanks to our esteemed society members for their noble contributions.
          </p>
        </div>

        {contributions.length > 0 && (
          <div style={{ position: 'relative', width: '100%', maxWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              id="search-contributor-input"
              type="text"
              className="form-input"
              placeholder="Search Flat or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '30px', paddingRight: '8px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12.5px' }}
            />
          </div>
        )}
      </div>

      {contributions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 16px', background: '#FFFDF9', borderRadius: '14px', border: '1.5px dashed var(--border-medium)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🙏</div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>No Contributions Recorded Yet</h4>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '340px', margin: '6px auto 14px' }}>
            When residents contribute towards {selectedEvent.title}, their names and verified receipts will be celebrated here publicly.
          </p>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('defaulters')}
              className="action-btn"
              style={{ background: 'var(--saffron-900)', color: '#FFF', padding: '8px 16px', fontSize: '12px', margin: '0 auto' }}
            >
              Go to Pending Flats & Record First Payment
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', background: '#F9FAFB', borderRadius: '12px' }}>
          No contributors found matching "{search}".
        </div>
      ) : (
        <div className="contributor-list" id="contributor-list-container">
          {filtered.map((item) => (
            <div key={item.memberId} className="contributor-card" id={`contributor-row-${item.member.flat}`}>
              <div className="member-info">
                <div className="flat-badge">{item.member.flat}</div>
                <div>
                  <div className="member-name">{item.member.name}</div>
                  <div className="member-role">
                    {item.member.role !== 'Member' ? `• ${item.member.role} ` : ''}
                    Receipt: {item.receiptNo}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="paid-badge">
                  <div className="paid-amount">₹{(Number(item.amount) || 0).toLocaleString('en-IN')}</div>
                  <div className="paid-meta">
                    <span style={{ color: item.mode === 'UPI' ? 'var(--blue-600)' : 'var(--saffron-900)', fontWeight: 600 }}>
                      {item.mode}
                    </span>
                    <span> • {item.date}</span>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove contribution record for ${item.member.name} (${item.member.flat})?`)) {
                        removeContribution(selectedEvent.id, item.memberId);
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}
                    title="Undo Contribution (Admin)"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
