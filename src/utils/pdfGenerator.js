import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates an official, publication-quality A4 PDF balance sheet for the festival event.
 * Uses clean vector rendering, tables, headers, and signatures.
 */
export function generateEventPdf({ society, event, stats, members }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. TOP BRAND ACCENT BARS
  doc.setFillColor(154, 52, 18); // Saffron-900
  doc.rect(0, 0, pageWidth, 4.5, 'F');
  doc.setFillColor(124, 29, 29); // Maroon-900
  doc.rect(0, 4.5, pageWidth, 2, 'F');

  // 2. LETTERHEAD HEADER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(124, 29, 29);
  doc.text((society.name || 'SHAKTI YUVAK MANDAL').toUpperCase(), pageWidth / 2, 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const locationSubtext = `${society.subtitle || 'Residential Society Welfare & Festivals'} • ${society.location || 'Society Campus'}`;
  doc.text(locationSubtext, pageWidth / 2, 20, { align: 'center' });

  // Thin decorative separator
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 23, pageWidth - margin, 23);

  // 3. STATEMENT BANNER
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, 26, pageWidth - (margin * 2), 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL STATEMENT OF FESTIVAL ACCOUNTS', pageWidth / 2, 32, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(180, 83, 9);
  const eventHeadline = `${(event.title || 'FESTIVAL').toUpperCase()} (${event.dates || 'Active Dates'})`;
  doc.text(eventHeadline, pageWidth / 2, 38, { align: 'center' });

  // 4. FINANCIAL OVERVIEW CARDS (4 KPI BOXES)
  const summaryY = 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('FINANCIAL SUMMARY', margin, summaryY);

  const colWidth = (pageWidth - (margin * 2) - 9) / 4;
  const isSettled = event.isSettled || event.status === 'completed';
  const surplusAmt = event.settledSurplus !== undefined ? event.settledSurplus : stats.balance;

  const kpis = [
    { label: 'Target Budget', value: `Rs. ${(event.estimatedBudget || 0).toLocaleString('en-IN')}`, color: [30, 41, 59] },
    { label: 'Total Collections', value: `Rs. ${stats.totalCollected.toLocaleString('en-IN')}`, color: [194, 65, 12] },
    { label: 'Total Spent', value: `Rs. ${stats.totalSpent.toLocaleString('en-IN')}`, color: [153, 27, 27] },
    { label: isSettled ? 'Settled Surplus' : 'Net Balance', value: `Rs. ${surplusAmt.toLocaleString('en-IN')}`, color: surplusAmt >= 0 ? [22, 101, 52] : [220, 38, 38] }
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (colWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, summaryY + 2, colWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + colWidth / 2, summaryY + 6.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + colWidth / 2, summaryY + 12, { align: 'center' });
  });

  let currentY = summaryY + 20;

  // Status Banner if Event is Completed & Settled
  if (isSettled) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 8.5, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text(
      `* EVENT COMPLETED: Net surplus of Rs. ${surplusAmt.toLocaleString('en-IN')} deposited to Society Main Treasury.`,
      margin + 4,
      currentY + 5.5
    );
    currentY += 12.5;
  }

  // 5. TABLE 1: ITEMIZED EXPENSES & BILLS
  const expenses = event.expenses || [];
  const expenseRows = expenses.map((e, idx) => [
    idx + 1,
    e.title || 'Expense',
    e.vendor || '-',
    e.paidBy || '-',
    e.receiptNote || '-',
    e.date || '-',
    `Rs. ${Number(e.amount || 0).toLocaleString('en-IN')}`
  ]);

  if (expenseRows.length === 0) {
    expenseRows.push(['-', 'No bills logged for this festival', '-', '-', '-', '-', 'Rs. 0']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Bill / Expense Purpose', 'Vendor / Supplier', 'Paid By', 'Receipt / Ref', 'Date', 'Amount']],
    body: expenseRows,
    foot: [['', 'TOTAL VERIFIED EXPENSES', '', '', '', '', `Rs. ${stats.totalSpent.toLocaleString('en-IN')}`]],
    theme: 'grid',
    headStyles: {
      fillColor: [124, 29, 29], // Maroon-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Check page overflow for Table 2
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 20;
  }

  // 6. TABLE 2: MEMBER / FLAT CONTRIBUTIONS
  const contributions = event.contributions || [];
  const memberMap = new Map((members || []).map((m) => [m.id, m]));

  const contribRows = contributions.map((c, idx) => {
    const mem = memberMap.get(c.memberId);
    return [
      idx + 1,
      mem ? mem.flat : 'Flat',
      mem ? mem.name : 'Resident',
      c.mode || 'UPI',
      c.receiptNo || '-',
      c.date || '-',
      `Rs. ${Number(c.amount || 0).toLocaleString('en-IN')}`
    ];
  });

  if (contribRows.length === 0) {
    contribRows.push(['-', 'No resident contributions recorded yet', '-', '-', '-', '-', 'Rs. 0']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Flat No', 'Resident Name', 'Payment Mode', 'Receipt No', 'Date', 'Amount']],
    body: contribRows,
    foot: [['', 'TOTAL COLLECTIONS RECEIVED', '', '', '', '', `Rs. ${stats.totalCollected.toLocaleString('en-IN')}`]],
    theme: 'grid',
    headStyles: {
      fillColor: [194, 65, 12], // Saffron-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 18, fontStyle: 'bold' },
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
    }
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // 7. SIGN-OFF & AUDIT SIGNATURES
  if (currentY > pageHeight - 38) {
    doc.addPage();
    currentY = 22;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  const sigColWidth = (pageWidth - (margin * 2)) / 3;
  const signatories = [
    { role: 'Treasurer', name: 'Devansh Shrimali' },
    { role: 'Secretary', name: 'Rajesh Sharma' },
    { role: 'President', name: 'Suresh Patel' }
  ];

  signatories.forEach((sig, idx) => {
    const x = margin + idx * sigColWidth;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorized Signatory:', x + 4, currentY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(sig.role, x + 4, currentY + 5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`(${sig.name})`, x + 4, currentY + 9.5);
  });

  // 8. FOOTER METADATA ON ALL PAGES
  const totalPages = doc.getNumberOfPages();
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${society.name} • Official Financial Audit Statement • ${dateStr}`,
      margin,
      pageHeight - 6
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 6,
      { align: 'right' }
    );
  }

  return doc;
}
