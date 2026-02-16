import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

const RECEIPTS = [
  {
    receiptNo: 'RCP-5784-0001',
    title: 'Hachnasas Kallah Essentials Fund 5784',
    orgName: 'Keren Hachnasas Kallah of Greater New York',
    orgAddress: '1385 Broadway, Suite 402, New York, NY 10018',
    orgEIN: '13-4012587',
    amount: 180000,
    date: 'November 28, 2023',
    hebrewDate: 'Kislev 15, 5784',
  },
  {
    receiptNo: 'RCP-5784-0002',
    title: 'Chesed Shel Emes Emergency Appeal',
    orgName: 'Chesed Shel Emes Burial Society',
    orgAddress: '4218 18th Avenue, Brooklyn, NY 11218',
    orgEIN: '11-2684930',
    amount: 50000,
    date: 'September 18, 2023',
    hebrewDate: 'Tishrei 3, 5784',
  },
  {
    receiptNo: 'RCP-5784-0003',
    title: 'Beit Midrash Renovation — Yeshivat Ohr Somayach',
    orgName: 'Yeshivat Ohr Somayach — Jerusalem Campus',
    orgAddress: '22 Shimon Hatzadik St, Jerusalem, Israel 9110401',
    orgEIN: '13-2798092',
    amount: 360000,
    date: 'March 30, 2024',
    hebrewDate: 'Adar II 20, 5784',
  },
];

export async function GET(request: Request) {
  const session = await getSession();

  let donorName = 'Valued Donor';
  let donorEmail = '';

  if (session) {
    const user = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, session.userId))
      .get();
    if (user) {
      donorName = user.name;
      donorEmail = user.email;
    }
  }

  const url = new URL(request.url);
  const idx = parseInt(url.searchParams.get('index') ?? '', 10);

  if (isNaN(idx) || idx < 0 || idx >= RECEIPTS.length) {
    return NextResponse.json({ error: 'Invalid receipt index' }, { status: 400 });
  }

  const r = RECEIPTS[idx];
  const fmtAmount = `$${r.amount.toLocaleString('en-US')}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Receipt ${r.receiptNo} — Aron Philanthropic Services</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    background: #f8f7f4;
    color: #1a1a1a;
    padding: 0;
  }
  .page {
    max-width: 700px;
    margin: 40px auto;
    background: #ffffff;
    border: 1px solid #e0ddd5;
    padding: 60px 56px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .header {
    text-align: center;
    border-bottom: 2px solid #D4AF37;
    padding-bottom: 28px;
    margin-bottom: 36px;
  }
  .header h1 {
    font-size: 26px;
    font-weight: 400;
    letter-spacing: 2px;
    color: #1a1a1a;
    margin-bottom: 4px;
  }
  .header .tagline {
    font-size: 12px;
    color: #888;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }
  .receipt-title {
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    color: #D4AF37;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 32px;
  }
  .meta-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
  }
  .meta-row .label {
    color: #777;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 1px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }
  .meta-row .value {
    font-weight: 600;
    text-align: right;
  }
  .section {
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  .section-label {
    font-size: 11px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    margin-bottom: 10px;
  }
  .amount-box {
    text-align: center;
    margin: 36px 0;
    padding: 28px 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }
  .amount-box .amount {
    font-size: 42px;
    font-weight: 300;
    color: #1a1a1a;
    letter-spacing: 1px;
  }
  .amount-box .amount-label {
    font-size: 11px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 6px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }
  .tax-notice {
    margin-top: 36px;
    padding: 20px 24px;
    background: #faf9f6;
    border: 1px solid #e8e5dd;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
    line-height: 1.7;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }
  .footer {
    margin-top: 40px;
    text-align: center;
    font-size: 11px;
    color: #aaa;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }
  .print-bar {
    text-align: center;
    margin: 24px auto 0;
    max-width: 700px;
  }
  .print-bar button {
    background: #D4AF37;
    color: #fff;
    border: none;
    padding: 12px 36px;
    font-size: 14px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    letter-spacing: 1px;
    cursor: pointer;
    border-radius: 4px;
  }
  .print-bar button:hover { background: #c5a030; }
  @media print {
    body { background: #fff; padding: 0; }
    .page { margin: 0; border: none; box-shadow: none; padding: 40px; }
    .print-bar { display: none; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>Aron Philanthropic Services</h1>
      <div class="tagline">Guided Giving &bull; Lasting Impact</div>
    </div>

    <div class="receipt-title">Tax Deductible Donation Receipt</div>

    <div class="meta-row">
      <span class="label">Receipt No.</span>
      <span class="value">${r.receiptNo}</span>
    </div>
    <div class="meta-row">
      <span class="label">Date</span>
      <span class="value">${r.date} (${r.hebrewDate})</span>
    </div>

    <div class="section">
      <div class="section-label">Donor</div>
      <div style="font-size:16px;font-weight:600;margin-bottom:2px;">${donorName}</div>
      ${donorEmail ? `<div style="font-size:13px;color:#666;">${donorEmail}</div>` : ''}
    </div>

    <div class="section">
      <div class="section-label">Beneficiary Organization</div>
      <div style="font-size:16px;font-weight:600;margin-bottom:2px;">${r.orgName}</div>
      <div style="font-size:13px;color:#666;margin-bottom:2px;">${r.orgAddress}</div>
      <div style="font-size:12px;color:#999;">EIN: ${r.orgEIN}</div>
    </div>

    <div class="section">
      <div class="section-label">Purpose</div>
      <div style="font-size:15px;line-height:1.5;">${r.title}</div>
    </div>

    <div class="amount-box">
      <div class="amount">${fmtAmount}</div>
      <div class="amount-label">Total Donation Amount (USD)</div>
    </div>

    <div class="tax-notice">
      This receipt confirms your tax-deductible contribution under Section 501(c)(3) of the Internal Revenue Code.
      No goods or services were provided in exchange for this donation.
      Please retain this receipt for your tax records.
    </div>

    <div class="footer">
      Aron Philanthropic Services &bull; Confidential &bull; Generated for record-keeping purposes
    </div>
  </div>

  <div class="print-bar">
    <button onclick="window.print()">Print Receipt</button>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
