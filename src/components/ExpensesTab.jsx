import React, { useState } from 'react';
import { useMandal } from '../context/MandalContext';
import { PlusCircle, Receipt, Trash2, Edit2, Search } from 'lucide-react';

export default function ExpensesTab({ onOpenAddExpense, onOpenEditExpense }) {
  const { selectedEvent, isAdmin, deleteExpense } = useMandal();
  const [search, setSearch] = useState('');

  if (!selectedEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '36px 16px', background: '#F9FAFB', borderRadius: '14px', color: 'var(--text-muted)' }}>
        No festival selected. Please select or create an event from the Society Dashboard.
      </div>
    );
  }

  const expenses = selectedEvent.expenses || [];

  const filteredExpenses = expenses.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.title || '').toLowerCase().includes(q) ||
      (e.vendor || '').toLowerCase().includes(q) ||
      (e.paidBy || '').toLowerCase().includes(q) ||
      (e.receiptNote || '').toLowerCase().includes(q)
    );
  });

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div id="expenses-tab-view">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Receipt size={18} color="var(--maroon-900)" />
            <span>Festival Bills & Expenses ({expenses.length} Logged)</span>
          </h3>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Complete transparency of payments: petrol, sound, stage, pooja, prasad, and miscellaneous bills.
          </p>
        </div>

        {isAdmin && (
          <button
            id="btn-open-add-expense"
            className="action-btn"
            onClick={onOpenAddExpense}
            style={{
              padding: '7px 16px',
              fontSize: '12.5px',
              background: 'var(--maroon-900)',
              color: '#FFF',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <PlusCircle size={14} />
            <span>+ Add Bill</span>
          </button>
        )}
      </div>

      {/* Search Input when bills exist */}
      {expenses.length > 0 && (
        <div style={{ position: 'relative', width: '100%', marginBottom: '14px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search bills by description, vendor, or paid by..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '34px', paddingRight: '10px', paddingTop: '7px', paddingBottom: '7px', fontSize: '12.5px' }}
          />
        </div>
      )}

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 16px', background: '#FFFDF9', borderRadius: '14px', border: '1.5px dashed var(--border-medium)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧾</div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>No Bills Logged Yet</h4>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '340px', margin: '6px auto 14px' }}>
            {isAdmin 
              ? 'Click "+ Add Bill" to record any expense (e.g. Petrol, Sound, Decorators, Sweets) with full vendor transparency.' 
              : 'No expenses have been recorded yet for this festival.'}
          </p>
          {isAdmin && (
            <button
              onClick={onOpenAddExpense}
              className="action-btn"
              style={{ background: 'var(--maroon-900)', color: '#FFF', padding: '8px 18px', fontSize: '12px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <PlusCircle size={13} />
              <span>Log First Bill</span>
            </button>
          )}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', background: '#F9FAFB', borderRadius: '12px' }}>
          No bills found matching "{search}".
        </div>
      ) : (
        <div className="fest-card" style={{ padding: '8px 16px' }} id="expense-list-container">
          {filteredExpenses.map((exp) => (
            <div key={exp.id} className="expense-item" id={`expense-item-${exp.id}`}>
              <div style={{ flex: 1, paddingRight: '12px' }}>
                <div className="expense-title" style={{ fontSize: '14px', fontWeight: 700 }}>{exp.title}</div>
                <div className="expense-vendor" style={{ marginTop: '2px' }}>
                  <span>Vendor / Shop: <strong>{exp.vendor}</strong></span>
                  <span> • Paid by: {exp.paidBy}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{exp.date}</span>
                  {exp.receiptNote && <span>• Note: {exp.receiptNote}</span>}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="expense-amount" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--maroon-900)' }}>
                  ₹{Number(exp.amount).toLocaleString('en-IN')}
                </div>

                {isAdmin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => onOpenEditExpense(exp)}
                      style={{ background: 'none', border: 'none', color: 'var(--blue-600)', cursor: 'pointer', padding: '4px' }}
                      title="Edit Bill"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete bill "${exp.title}" (₹${exp.amount})?`)) {
                          deleteExpense(selectedEvent.id, exp.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}
                      title="Delete Bill"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Total Spent */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', marginTop: '6px', borderTop: '2px dashed var(--border-medium)', fontWeight: 800 }}>
            <span style={{ fontSize: '13px', color: 'var(--text-dark)' }}>Total Festival Expenses:</span>
            <span style={{ fontSize: '18px', color: 'var(--maroon-900)' }}>₹{totalSpent.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
