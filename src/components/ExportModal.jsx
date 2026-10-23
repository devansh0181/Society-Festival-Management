import React, { useState, useEffect } from 'react';
import { useMandal } from '../context/MandalContext';
import { generateEventPdf } from '../utils/pdfGenerator';
import { 
  Share2, 
  Printer, 
  Copy, 
  Check, 
  X, 
  MessageCircle, 
  Download, 
  FileDown, 
  CheckCircle,
  FileCheck,
  Building
} from 'lucide-react';

export default function ExportModal({ isOpen, onClose, initialTab = 'whatsapp' }) {
  const { society, selectedEvent, getEventStats, members, generateWhatsAppSummary } = useMandal();
  const [activeSubTab, setActiveSubTab] = useState(initialTab || 'whatsapp');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  if (!selectedEvent) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '30px 20px' }}>
          <div style={{ fontSize: '30px', marginBottom: '10px' }}>🚩</div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>No Event Selected</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '8px 0 16px' }}>
            Please create or select a festival event before exporting statements.
          </p>
          <button className="submit-btn" onClick={onClose} style={{ width: 'auto', padding: '8px 20px', margin: '0 auto' }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const stats = getEventStats(selectedEvent);
  const whatsappText = generateWhatsAppSummary(selectedEvent);
  const contributions = selectedEvent.contributions || [];
  const expenses = selectedEvent.expenses || [];
  const memberMap = new Map((members || []).map((m) => [m.id, m]));

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 1. Direct Vector PDF File Download (.pdf)
  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      const doc = generateEventPdf({ society, event: selectedEvent, stats, members });
      const safeTitle = (selectedEvent.title || 'Festival').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeSociety = (society.name || 'Mandal').replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`${safeSociety}_${safeTitle}_Accounts.pdf`);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Unable to generate PDF. Please check console.');
    } finally {
      setIsDownloading(false);
    }
  };

  // 2. Clean Dedicated A4 Print Window (Not screenshotting modal)
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>${society.name} - ${selectedEvent.title} Accounts Statement</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 10px;
              font-size: 10.5pt;
              line-height: 1.4;
            }
            .header-strip {
              height: 5px;
              background: #9a3412;
              border-bottom: 2px solid #7c1d1d;
              margin: -10px -10px 15px -10px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #7c1d1d;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .title {
              font-size: 19pt;
              font-weight: 800;
              color: #7c1d1d;
              margin: 0;
              letter-spacing: 0.5px;
            }
            .subtitle {
              font-size: 9.5pt;
              color: #64748b;
              margin-top: 4px;
            }
            .banner {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 10px;
              text-align: center;
              margin: 12px 0 16px;
            }
            .banner h4 {
              margin: 0 0 3px;
              font-size: 12pt;
              color: #0f172a;
              letter-spacing: 0.3px;
            }
            .banner .event {
              font-weight: 700;
              color: #b45309;
              font-size: 10.5pt;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              margin-bottom: 16px;
            }
            .kpi {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 8px 10px;
              text-align: center;
            }
            .kpi-label {
              font-size: 7.5pt;
              color: #64748b;
              text-transform: uppercase;
              font-weight: 700;
            }
            .kpi-value {
              font-size: 12.5pt;
              font-weight: 800;
              margin-top: 2px;
            }
            .settled-note {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              color: #166534;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 9.5pt;
              font-weight: 700;
              margin-bottom: 14px;
            }
            h5 {
              margin: 16px 0 6px;
              font-size: 11pt;
              font-weight: 800;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              font-size: 9pt;
            }
            th {
              padding: 6px 8px;
              text-align: left;
              font-size: 8.5pt;
              font-weight: 700;
              background: #7c1d1d;
              color: #ffffff;
            }
            th.saffron {
              background: #c2410c;
            }
            td {
              padding: 5px 8px;
              border-bottom: 1px solid #e2e8f0;
            }
            tr:nth-child(even) {
              background: #f8fafc;
            }
            .total-row {
              font-weight: 800;
              background: #f1f5f9 !important;
              border-top: 2px solid #cbd5e1;
            }
            .text-right {
              text-align: right;
            }
            .signatures {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              margin-top: 36px;
              padding-top: 14px;
              border-top: 1px dashed #94a3b8;
              font-size: 8.5pt;
            }
            .sig-block {
              text-align: center;
            }
            .sig-line {
              margin-bottom: 24px;
              color: #94a3b8;
            }
            .footer-meta {
              margin-top: 25px;
              text-align: center;
              font-size: 7.5pt;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="header-strip"></div>
          <div class="header">
            <h1 class="title">${society.name}</h1>
            <div class="subtitle">${society.subtitle} • ${society.location}</div>
          </div>

          <div class="banner">
            <h4>OFFICIAL STATEMENT OF FESTIVAL ACCOUNTS</h4>
            <div class="event">${selectedEvent.title} (${selectedEvent.dates})</div>
          </div>

          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-label">Target Budget</div>
              <div class="kpi-value">₹${(selectedEvent.estimatedBudget || 0).toLocaleString('en-IN')}</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">Total Collections</div>
              <div class="kpi-value" style="color: #c2410c;">₹${stats.totalCollected.toLocaleString('en-IN')}</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">Total Spent</div>
              <div class="kpi-value" style="color: #991b1b;">₹${stats.totalSpent.toLocaleString('en-IN')}</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">Net Balance</div>
              <div class="kpi-value" style="color: ${stats.balance >= 0 ? '#16a34a' : '#dc2626'};">
                ₹${stats.balance.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          ${selectedEvent.status === 'completed' ? `
            <div class="settled-note">
              ✅ EVENT COMPLETED: Net surplus of ₹${(selectedEvent.settledSurplus !== undefined ? selectedEvent.settledSurplus : stats.surplus).toLocaleString('en-IN')} was deposited into the Society Main Treasury.
            </div>
          ` : ''}

          <h5 style="color: #7c1d1d;">Itemized Expenses & Verified Bills (${expenses.length})</h5>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Expense Item / Purpose</th>
                <th>Vendor / Supplier</th>
                <th>Paid By</th>
                <th>Date</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:#64748b;">No bills recorded</td></tr>' : ''}
              ${expenses.map((e, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${e.title}</strong>${e.receiptNote ? `<br><small style="color:#64748b">${e.receiptNote}</small>` : ''}</td>
                  <td>${e.vendor || '-'}</td>
                  <td>${e.paidBy || '-'}</td>
                  <td>${e.date || '-'}</td>
                  <td class="text-right"><strong>₹${Number(e.amount || 0).toLocaleString('en-IN')}</strong></td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5">TOTAL EXPENSES VERIFIED</td>
                <td class="text-right">₹${stats.totalSpent.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <h5 style="color: #c2410c;">Resident Flat-wise Contributions (${contributions.length})</h5>
          <table>
            <thead>
              <tr>
                <th class="saffron" style="width: 30px;">#</th>
                <th class="saffron">Flat No</th>
                <th class="saffron">Resident Name</th>
                <th class="saffron">Mode</th>
                <th class="saffron">Receipt No</th>
                <th class="saffron">Date</th>
                <th class="saffron text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${contributions.length === 0 ? '<tr><td colspan="7" style="text-align:center;color:#64748b;">No contributions recorded</td></tr>' : ''}
              ${contributions.map((c, idx) => {
                const mem = memberMap.get(c.memberId);
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${mem ? mem.flat : 'Flat'}</strong></td>
                    <td>${mem ? mem.name : 'Resident'}</td>
                    <td>${c.mode || 'UPI'}</td>
                    <td>${c.receiptNo || '-'}</td>
                    <td>${c.date || '-'}</td>
                    <td class="text-right"><strong>₹${Number(c.amount || 0).toLocaleString('en-IN')}</strong></td>
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td colspan="6">TOTAL COLLECTIONS RECEIVED</td>
                <td class="text-right">₹${stats.totalCollected.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-block">
              <div class="sig-line">__________________________</div>
              <strong>Treasurer (Devansh)</strong>
            </div>
            <div class="sig-block">
              <div class="sig-line">__________________________</div>
              <strong>Secretary (Rajesh Sharma)</strong>
            </div>
            <div class="sig-block">
              <div class="sig-line">__________________________</div>
              <strong>President (Suresh Patel)</strong>
            </div>
          </div>

          <div class="footer-meta">
            ${society.name} • Official Financial Audit Statement • Printed on ${new Date().toLocaleDateString('en-IN')}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', width: '95%' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={20} color="var(--saffron-900)" />
            <span>Export & Share Accounts</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <button
            id="tab-export-whatsapp"
            onClick={() => setActiveSubTab('whatsapp')}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: activeSubTab === 'whatsapp' ? '2px solid #16A34A' : '1px solid var(--border-medium)',
              background: activeSubTab === 'whatsapp' ? '#F0FDF4' : '#FFF',
              color: activeSubTab === 'whatsapp' ? '#16A34A' : 'var(--text-body)',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <MessageCircle size={16} />
            <span>WhatsApp Text</span>
          </button>

          <button
            id="tab-export-pdf"
            onClick={() => setActiveSubTab('pdf')}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: activeSubTab === 'pdf' ? '2px solid var(--maroon-900)' : '1px solid var(--border-medium)',
              background: activeSubTab === 'pdf' ? '#FFF1F2' : '#FFF',
              color: activeSubTab === 'pdf' ? 'var(--maroon-900)' : 'var(--text-body)',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <FileDown size={16} />
            <span>Official PDF (.pdf) & Print</span>
          </button>
        </div>

        {activeSubTab === 'whatsapp' ? (
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Copy and paste this cleanly formatted message directly into your society's WhatsApp group:
            </p>

            <div
              id="whatsapp-preview-box"
              style={{
                background: '#E7F5EE',
                border: '1px solid #C6E9D5',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                maxHeight: '260px',
                overflowY: 'auto',
                color: '#1F2937',
                marginBottom: '14px'
              }}
            >
              {whatsappText}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                id="btn-copy-whatsapp"
                onClick={handleCopy}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: copied ? '#15803D' : '#16A34A',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
              </button>

              <a
                id="btn-open-whatsapp-intent"
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#25D366',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  textDecoration: 'none'
                }}
                title="Share directly to WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        ) : (
          <div>
            {/* Primary Action Buttons Header */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <button
                id="btn-download-pdf-file"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                style={{
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: downloadSuccess ? '#15803D' : 'var(--maroon-900)',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {downloadSuccess ? <Check size={18} /> : <Download size={18} />}
                <span>{downloadSuccess ? 'Downloaded PDF!' : isDownloading ? 'Generating PDF...' : 'Download Official PDF (.pdf)'}</span>
              </button>

              <button
                id="btn-trigger-clean-print"
                onClick={handlePrint}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#FFF',
                  border: '1.5px solid var(--border-medium)',
                  color: 'var(--text-dark)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
                title="Print full A4 sheet without modal dialogs"
              >
                <Printer size={16} />
                <span>Print Document</span>
              </button>
            </div>

            {/* Document Live Preview Sheet */}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Document Preview (Official A4 Format with Itemized Expenses & Sign-offs):
            </div>

            <div
              id="printable-statement-container"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                padding: '20px',
                maxHeight: '340px',
                overflowY: 'auto',
                fontSize: '11px',
                color: '#1E293B',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              {/* Letterhead */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid var(--maroon-900)', paddingBottom: '10px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '17px', color: 'var(--maroon-900)', margin: 0, fontWeight: 800, letterSpacing: '0.5px' }}>
                  {society.name.toUpperCase()}
                </h3>
                <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                  {society.subtitle} • {society.location}
                </div>
                <div style={{ fontWeight: 800, marginTop: '6px', fontSize: '12px', color: '#0F172A' }}>
                  OFFICIAL STATEMENT OF FESTIVAL ACCOUNTS
                </div>
                <div style={{ fontSize: '11px', color: 'var(--saffron-900)', fontWeight: 700, marginTop: '2px' }}>
                  {selectedEvent.title} ({selectedEvent.dates})
                </div>
              </div>

              {/* Financial Summary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', background: '#F8FAFC', padding: '8px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Target Budget</div>
                  <div style={{ fontWeight: 800, fontSize: '12.5px', marginTop: '2px' }}>₹{selectedEvent.estimatedBudget.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Collected</div>
                  <div style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--saffron-900)', marginTop: '2px' }}>₹{stats.totalCollected.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Spent</div>
                  <div style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--maroon-900)', marginTop: '2px' }}>₹{stats.totalSpent.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Net Balance</div>
                  <div style={{ color: stats.balance >= 0 ? '#16A34A' : '#DC2626', fontWeight: 800, fontSize: '12.5px', marginTop: '2px' }}>
                    ₹{stats.balance.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Completed Note */}
              {selectedEvent.status === 'completed' && (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '6px 10px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, marginBottom: '10px' }}>
                  ✅ EVENT COMPLETED: Net surplus of ₹{(selectedEvent.settledSurplus !== undefined ? selectedEvent.settledSurplus : stats.surplus).toLocaleString('en-IN')} was deposited into the Society Main Treasury.
                </div>
              )}

              {/* Itemized Expenses Table */}
              <div style={{ fontWeight: 800, fontSize: '11px', color: 'var(--maroon-900)', marginBottom: '4px' }}>
                Itemized Expenses & Verified Bills ({expenses.length})
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '10px' }}>
                <thead>
                  <tr style={{ background: 'var(--maroon-900)', color: '#FFF' }}>
                    <th style={{ padding: '4px 6px', width: '24px' }}>#</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left' }}>Item / Service</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left' }}>Vendor</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left' }}>Paid By</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#64748B' }}>No expenses recorded yet</td></tr>
                  ) : (
                    expenses.map((e, idx) => (
                      <tr key={e.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '4px 6px', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ padding: '4px 6px' }}><strong>{e.title}</strong></td>
                        <td style={{ padding: '4px 6px' }}>{e.vendor}</td>
                        <td style={{ padding: '4px 6px' }}>{e.paidBy}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>₹{Number(e.amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                  <tr style={{ background: '#F1F5F9', fontWeight: 800 }}>
                    <td colSpan={4} style={{ padding: '5px 6px' }}>TOTAL EXPENSES VERIFIED</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right' }}>₹{stats.totalSpent.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              {/* Resident Contributions Table */}
              <div style={{ fontWeight: 800, fontSize: '11px', color: 'var(--saffron-900)', marginBottom: '4px' }}>
                Resident Flat Contributions ({contributions.length})
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '10px' }}>
                <thead>
                  <tr style={{ background: 'var(--saffron-900)', color: '#FFF' }}>
                    <th style={{ padding: '4px 6px', width: '24px' }}>#</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left' }}>Flat</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left' }}>Resident Name</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left' }}>Mode</th>
                    <th style={{ padding: '4px 6px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#64748B' }}>No contributions recorded yet</td></tr>
                  ) : (
                    contributions.map((c, idx) => {
                      const mem = memberMap.get(c.memberId);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '4px 6px', textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ padding: '4px 6px', fontWeight: 700 }}>{mem ? mem.flat : 'Flat'}</td>
                          <td style={{ padding: '4px 6px' }}>{mem ? mem.name : 'Resident'}</td>
                          <td style={{ padding: '4px 6px' }}>{c.mode || 'UPI'}</td>
                          <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 700 }}>₹{Number(c.amount || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })
                  )}
                  <tr style={{ background: '#F1F5F9', fontWeight: 800 }}>
                    <td colSpan={4} style={{ padding: '5px 6px' }}>TOTAL COLLECTIONS RECEIVED</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right' }}>₹{stats.totalCollected.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '22px', paddingTop: '10px', borderTop: '1px dashed #94A3B8', fontSize: '9.5px', textAlign: 'center' }}>
                <div>
                  <div style={{ color: '#94A3B8', marginBottom: '14px' }}>______________________</div>
                  <strong>Treasurer (Devansh)</strong>
                </div>
                <div>
                  <div style={{ color: '#94A3B8', marginBottom: '14px' }}>______________________</div>
                  <strong>Secretary (Rajesh Sharma)</strong>
                </div>
                <div>
                  <div style={{ color: '#94A3B8', marginBottom: '14px' }}>______________________</div>
                  <strong>President (Suresh Patel)</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
