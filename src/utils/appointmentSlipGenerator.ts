import { DocumentRequest } from '../types/Request';
import { BARANGAY_INFO } from './constants';
import { formatCurrency, formatDateTime, formatDate, formatTime } from './formatters';

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate Code 39 Barcode SVG for the reference number.
 * 100% vector, zero external dependencies, works offline.
 */
function generateCode39Svg(text: string): string {
  const clean = text.toUpperCase().replace(/[^0-9A-Z\-]/g, '');
  const raw = `*${clean}*`;

  const CODE39_MAP: Record<string, string> = {
    '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
    '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
    '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
    'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
    'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
    'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
    'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
    'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
    'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
    '-': '010000101', '*': '010010100',
  };

  const narrowWidth = 1.3;
  const wideWidth = 3.2;
  const barHeight = 28;

  let totalWidth = 0;
  for (let i = 0; i < raw.length; i++) {
    const pattern = CODE39_MAP[raw[i]] || CODE39_MAP['*'];
    for (let j = 0; j < 9; j++) {
      totalWidth += pattern[j] === '1' ? wideWidth : narrowWidth;
    }
    totalWidth += narrowWidth; // inter-character gap
  }

  let x = 4;
  let rects = '';
  for (let i = 0; i < raw.length; i++) {
    const pattern = CODE39_MAP[raw[i]] || CODE39_MAP['*'];
    for (let j = 0; j < 9; j++) {
      const isBar = j % 2 === 0;
      const width = pattern[j] === '1' ? wideWidth : narrowWidth;
      if (isBar) {
        rects += `<rect x="${x.toFixed(1)}" y="0" width="${width.toFixed(1)}" height="${barHeight}" fill="#0f172a"/>`;
      }
      x += width;
    }
    x += narrowWidth; // gap
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${(totalWidth + 8).toFixed(1)} ${barHeight}" height="28" style="display: block; margin: 0 auto; max-width: 100%;">
      ${rects}
    </svg>
  `;
}

/**
 * Clean SVG seal for the Republic of the Philippines.
 */
function getPhilippineSealSvg(): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="76" height="76">
      <circle cx="50" cy="50" r="47" fill="#ffffff" stroke="#1E4E8C" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="43" fill="#f8fafc" stroke="#F2B600" stroke-width="1.5"/>
      <!-- Outer Stars Ring -->
      <circle cx="50" cy="13" r="2.2" fill="#F2B600"/>
      <circle cx="20" cy="30" r="2.2" fill="#F2B600"/>
      <circle cx="80" cy="30" r="2.2" fill="#F2B600"/>
      <circle cx="15" cy="60" r="2.2" fill="#F2B600"/>
      <circle cx="85" cy="60" r="2.2" fill="#F2B600"/>
      <circle cx="30" cy="85" r="2.2" fill="#F2B600"/>
      <circle cx="70" cy="85" r="2.2" fill="#F2B600"/>
      <!-- Heraldic Shield -->
      <path d="M 30 28 L 70 28 L 70 54 C 70 68 50 78 50 78 C 50 78 30 68 30 54 Z" fill="#ffffff" stroke="#0F2A4A" stroke-width="1.8"/>
      <!-- Split Shield: Blue Left, Red Right -->
      <path d="M 30 40 L 50 40 L 50 78 C 50 78 30 68 30 54 Z" fill="#1E4E8C"/>
      <path d="M 50 40 L 70 40 L 70 54 C 70 68 50 78 50 78 Z" fill="#D64545"/>
      <!-- White Chief with Sun and 3 Stars -->
      <path d="M 30 28 L 70 28 L 70 40 L 30 40 Z" fill="#ffffff"/>
      <polygon points="50,30 51.5,33.5 55,34 52.2,36 53,39.5 50,37.5 47,39.5 47.8,36 45,34 48.5,33.5" fill="#F2B600"/>
      <circle cx="36" cy="34" r="1.4" fill="#F2B600"/>
      <circle cx="64" cy="34" r="1.4" fill="#F2B600"/>
      <!-- Central Sunburst Motif -->
      <circle cx="50" cy="52" r="5" fill="#F2B600" stroke="#0F2A4A" stroke-width="0.8"/>
    </svg>
  `;
}

/**
 * Clean SVG seal for Barangay Cansojong, Talisay City.
 */
function getBarangaySealSvg(): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="76" height="76">
      <circle cx="50" cy="50" r="47" fill="#ffffff" stroke="#1E4E8C" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="42" fill="#eff5fc" stroke="#2E8B57" stroke-width="1.5"/>
      <!-- Laurel Wreath Leaves Left and Right -->
      <path d="M 22 55 C 20 40 28 26 40 20 C 35 30 32 45 35 58 Z" fill="#2E8B57" opacity="0.85"/>
      <path d="M 78 55 C 80 40 72 26 60 20 C 65 30 68 45 65 58 Z" fill="#2E8B57" opacity="0.85"/>
      <!-- Center Emblem: Building & Waves -->
      <circle cx="50" cy="50" r="22" fill="#ffffff" stroke="#0F2A4A" stroke-width="1.5"/>
      <!-- Stylized Barangay Hall Roof -->
      <polygon points="50,34 36,44 64,44" fill="#1E4E8C"/>
      <rect x="40" y="44" width="20" height="14" fill="#0F2A4A"/>
      <rect x="47" y="49" width="6" height="9" fill="#F2B600"/>
      <!-- Waves representing Talisay City coastal heritage -->
      <path d="M 34 62 Q 42 58 50 62 T 66 62" fill="none" stroke="#3B82C4" stroke-width="2" stroke-linecap="round"/>
      <path d="M 38 66 Q 44 63 50 66 T 62 66" fill="none" stroke="#2E8B57" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Star on Top -->
      <polygon points="50,14 51.5,17.5 55,18 52.2,20 53,23.5 50,21.5 47,23.5 47.8,20 45,18 48.5,17.5" fill="#F2B600"/>
    </svg>
  `;
}

/**
 * Fallback verification QR SVG.
 */
function getQrFallbackSvg(): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
      <rect width="100" height="100" fill="#ffffff"/>
      <!-- Position Markers -->
      <rect x="8" y="8" width="24" height="24" fill="#0F2A4A"/>
      <rect x="12" y="12" width="16" height="16" fill="#ffffff"/>
      <rect x="16" y="16" width="8" height="8" fill="#1E4E8C"/>

      <rect x="68" y="8" width="24" height="24" fill="#0F2A4A"/>
      <rect x="72" y="12" width="16" height="16" fill="#ffffff"/>
      <rect x="76" y="16" width="8" height="8" fill="#1E4E8C"/>

      <rect x="8" y="68" width="24" height="24" fill="#0F2A4A"/>
      <rect x="12" y="72" width="16" height="16" fill="#ffffff"/>
      <rect x="16" y="76" width="8" height="8" fill="#1E4E8C"/>

      <!-- Data Dots Simulation -->
      <rect x="40" y="12" width="6" height="6" fill="#0F2A4A"/>
      <rect x="52" y="16" width="6" height="6" fill="#0F2A4A"/>
      <rect x="44" y="24" width="6" height="6" fill="#0F2A4A"/>
      <rect x="12" y="44" width="6" height="6" fill="#0F2A4A"/>
      <rect x="24" y="48" width="6" height="6" fill="#0F2A4A"/>
      <rect x="40" y="40" width="20" height="20" fill="#1E4E8C"/>
      <rect x="46" y="46" width="8" height="8" fill="#F2B600"/>
      <rect x="68" y="44" width="6" height="6" fill="#0F2A4A"/>
      <rect x="80" y="52" width="6" height="6" fill="#0F2A4A"/>
      <rect x="44" y="72" width="6" height="6" fill="#0F2A4A"/>
      <rect x="56" y="80" width="6" height="6" fill="#0F2A4A"/>
      <rect x="72" y="72" width="8" height="8" fill="#0F2A4A"/>
      <rect x="84" y="80" width="6" height="6" fill="#0F2A4A"/>
    </svg>
  `;
}

/**
 * Main generator: Converts a DocumentRequest into a complete, standalone,
 * print-ready HTML document for an Official Barangay Transaction & Appointment Slip.
 */
export function generateAppointmentSlipHtml(request: DocumentRequest): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const trackingUrl = `${origin}/track/${encodeURIComponent(request.referenceNumber)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=0&data=${encodeURIComponent(trackingUrl)}`;

  const barcodeSvg = generateCode39Svg(request.referenceNumber);
  const repSealSvg = getPhilippineSealSvg();
  const brgySealSvg = getBarangaySealSvg();
  const qrFallbackSvg = getQrFallbackSvg();

  const residentName = request.resident?.fullName || 'N/A';
  const residentId = request.resident?.id || 1;
  const address = request.resident?.address || 'Barangay Cansojong, Talisay City, Cebu';
  const contact = request.resident?.contactNumber || 'N/A';
  const email = request.resident?.email || 'N/A';

  const serviceName = request.service?.name || 'Barangay Certification';
  const serviceCode = request.service?.serviceCode || 'BC-REQ';
  const fee = request.service?.fee || 0;
  const feeFormatted = formatCurrency(fee);
  const estDays = request.service?.estimatedProcessingDays || 1;
  const purpose = request.purpose || 'General Reference';

  const paymentNotice = fee > 0
    ? `UNPAID • Pay ${feeFormatted} in exact cash at Barangay Hall Cashier upon appearance`
    : 'FREE / WAIVED (Statutory Exemption)';

  const now = new Date();
  const issuedTimestamp = formatDateTime(now.toISOString());

  // Appointment block
  let appointmentContent = '';
  if (request.appointment) {
    const apptDate = formatDate(request.appointment.appointmentDate);
    const apptTime = formatTime(request.appointment.appointmentTime);
    const apptStatus = request.appointment.status || 'CONFIRMED';

    appointmentContent = `
      <div class="appt-grid">
        <div class="appt-cell highlight-slot">
          <div class="appt-label">SCHEDULED APPEARANCE DATE</div>
          <div class="appt-val-large">${escapeHtml(apptDate)}</div>
          <div class="appt-sub">Day of Appointment</div>
        </div>
        <div class="appt-cell highlight-slot">
          <div class="appt-label">APPOINTMENT TIME SLOT</div>
          <div class="appt-val-large time-val">${escapeHtml(apptTime)}</div>
          <div class="appt-sub">Allocated Processing Window</div>
        </div>
        <div class="appt-cell">
          <div class="appt-label">OFFICE VENUE / LOCATION</div>
          <div class="appt-val-bold">${escapeHtml(BARANGAY_INFO.name)} Hall</div>
          <div class="appt-sub">${escapeHtml(BARANGAY_INFO.fullLocation)}</div>
        </div>
        <div class="appt-cell">
          <div class="appt-label">DESIGNATED SERVICE COUNTER</div>
          <div class="appt-val-bold">Window 2: Document Processing Desk</div>
          <div class="appt-sub">Status: <span class="badge-status-confirmed">${escapeHtml(apptStatus)}</span></div>
        </div>
      </div>
    `;
  } else {
    appointmentContent = `
      <div class="appt-notice-box">
        <strong>APPOINTMENT PENDING / WALK-IN QUEUE:</strong>
        An appointment slot has not yet been locked for this request. Please present this slip at the Barangay Cansojong Triage Counter during regular operating hours (${escapeHtml(BARANGAY_INFO.officeHours)}).
      </div>
    `;
  }

  // Checklist items
  const requirementsList = request.service?.requirements || [];
  let checklistItemsHtml = '';

  // Mandatory default items
  checklistItemsHtml += `
    <div class="check-item">
      <div class="box">[ &nbsp; ]</div>
      <div class="check-text">
        <strong>This Printed Transaction Slip</strong>
        <span>Present physical slip or clear digital barcode on smartphone at Triage.</span>
      </div>
    </div>
    <div class="check-item">
      <div class="box">[ &nbsp; ]</div>
      <div class="check-text">
        <strong>One (1) Original Valid Government-Issued Photo ID</strong>
        <span>PhilSys National ID, Driver's License, Voter's ID, Passport, UMID, Postal ID, or Senior Citizen ID.</span>
      </div>
    </div>
    <div class="check-item">
      <div class="box">[ &nbsp; ]</div>
      <div class="check-text">
        <strong>Exact Fee Amount in Cash (${feeFormatted})</strong>
        <span>${fee > 0 ? 'Payable directly to the Barangay Hall Cashier upon document verification.' : 'Statutory fee exemption applied.'}</span>
      </div>
    </div>
  `;

  // Specific service requirements
  if (requirementsList.length > 0) {
    requirementsList.forEach((req) => {
      checklistItemsHtml += `
        <div class="check-item">
          <div class="box">[ &nbsp; ]</div>
          <div class="check-text">
            <strong>Original / Physical Copy: ${escapeHtml(req.requirementName)}</strong>
            <span>${req.isMandatory ? 'Mandatory Requirement' : 'Supporting Document'}${req.description ? ` - ${escapeHtml(req.description)}` : ''}</span>
          </div>
        </div>
      `;
    });
  } else if (request.files && request.files.length > 0) {
    request.files.forEach((f) => {
      checklistItemsHtml += `
        <div class="check-item">
          <div class="box">[ &nbsp; ]</div>
          <div class="check-text">
            <strong>Original Document for: ${escapeHtml(f.requirementName || f.originalFileName)}</strong>
            <span>Uploaded online for preliminary verification. Bring original document for physical validation.</span>
          </div>
        </div>
      `;
    });
  } else {
    checklistItemsHtml += `
      <div class="check-item">
        <div class="box">[ &nbsp; ]</div>
        <div class="check-text">
          <strong>Proof of Residency / Community Tax Certificate (Cedula)</strong>
          <span>Issued by Barangay Cansojong or City of Talisay for the current calendar year.</span>
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Transaction Slip - ${escapeHtml(request.referenceNumber)} - Barangay Cansojong</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 8mm 10mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1F2933;
      background-color: #f1f5f9;
      font-size: 11px;
      line-height: 1.35;
      padding: 16px 0;
    }

    .btn-action {
      cursor: pointer;
      font-family: inherit;
      font-weight: 600;
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 6px;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    /* Slip Page Container */
    .slip-container {
      max-width: 820px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 2px solid #1E4E8C;
      border-radius: 8px;
      padding: 16px 20px;
      box-shadow: 0 6px 24px rgba(15, 42, 74, 0.08);
      position: relative;
    }

    /* Header Letterhead */
    .slip-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 8px;
    }
    .header-seal {
      width: 76px;
      height: 76px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .header-text {
      text-align: center;
      flex: 1;
    }
    .country {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #475569;
      text-transform: uppercase;
    }
    .province {
      font-size: 10.5px;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 1px;
    }
    .barangay {
      font-size: 20px;
      font-weight: 800;
      color: #0F2A4A;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .office {
      font-size: 10.5px;
      font-weight: 700;
      color: #1E4E8C;
      letter-spacing: 0.5px;
      margin-top: 2px;
      text-transform: uppercase;
    }
    .hall-address {
      font-size: 8.5px;
      color: #64748b;
      margin-top: 2px;
    }

    .header-divider {
      height: 3px;
      background: linear-gradient(90deg, #1E4E8C 0%, #F2B600 50%, #1E4E8C 100%);
      margin: 6px 0 10px 0;
      border-radius: 2px;
    }

    /* Title Banner */
    .slip-title-bar {
      text-align: center;
      background: #eff5fc;
      border: 1px solid #bcd5f0;
      padding: 6px 10px;
      border-radius: 6px;
      margin-bottom: 10px;
    }
    .title-main {
      font-size: 15px;
      font-weight: 800;
      color: #0F2A4A;
      letter-spacing: 1.2px;
      text-transform: uppercase;
    }
    .title-sub {
      font-size: 9.5px;
      color: #1E4E8C;
      font-weight: 600;
      margin-top: 1px;
    }

    /* Reference & Barcode Strip */
    .ref-strip {
      display: grid;
      grid-template-columns: 1.6fr 1.6fr 0.8fr;
      gap: 10px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background-color: #fafbfc;
      padding: 8px 12px;
      margin-bottom: 10px;
      align-items: center;
    }
    .ref-highlight {
      background-color: #ffffff;
      border: 1px solid #bcd5f0;
      border-radius: 6px;
      padding: 6px 8px;
      text-align: center;
    }
    .ref-label {
      display: block;
      font-size: 8.5px;
      font-weight: 700;
      color: #616E7C;
      letter-spacing: 0.8px;
    }
    .ref-value {
      display: block;
      font-size: 16px;
      font-weight: 800;
      color: #1E4E8C;
      letter-spacing: 1.5px;
      font-family: 'Courier New', Courier, monospace;
      margin: 2px 0;
    }
    .barcode-wrapper {
      margin-top: 2px;
    }
    .meta-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2px 0;
      font-size: 9.5px;
      border-bottom: 1px dashed #e2e8f0;
    }
    .meta-item:last-child {
      border-bottom: none;
    }
    .meta-label {
      color: #64748b;
      font-weight: 600;
    }
    .meta-val {
      font-weight: 700;
      color: #1F2933;
    }
    .meta-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8.5px;
      font-weight: 700;
      background-color: #edf7f2;
      color: #2E8B57;
      border: 1px solid #a8dfc1;
    }
    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 4px;
    }
    .qr-caption {
      font-size: 7.5px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }

    /* Section Styling */
    .section-block {
      margin-bottom: 8px;
    }
    .section-title {
      font-size: 9.5px;
      font-weight: 800;
      color: #0F2A4A;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      background: #f1f5f9;
      padding: 3px 8px;
      border-left: 3px solid #1E4E8C;
      margin-bottom: 4px;
    }

    /* Data Tables */
    .slip-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    .slip-table td {
      padding: 4px 6px;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    .slip-table .lbl {
      background-color: #f8fafc;
      color: #475569;
      font-weight: 600;
    }
    .slip-table .val {
      color: #0f172a;
    }
    .slip-table .bold {
      font-weight: 700;
    }
    .slip-table .mono {
      font-family: 'Courier New', Courier, monospace;
      font-weight: 700;
    }
    .fee-highlight {
      color: #1E4E8C;
      font-size: 11.5px;
    }
    .payment-terms {
      font-size: 9.5px;
      color: #475569;
    }

    /* Appointment Box */
    .appointment-box {
      border: 1.5px solid #1E4E8C;
      border-radius: 6px;
      background-color: #f8fafc;
      padding: 6px 8px;
    }
    .appt-title {
      background: #1E4E8C;
      color: #ffffff;
      border-left: none;
      padding: 3px 8px;
      border-radius: 3px;
      margin-bottom: 6px;
    }
    .appt-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    .appt-cell {
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 6px 8px;
      text-align: center;
    }
    .highlight-slot {
      background-color: #eff5fc;
      border-color: #bcd5f0;
    }
    .appt-label {
      font-size: 8px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .appt-val-large {
      font-size: 13px;
      font-weight: 800;
      color: #0F2A4A;
    }
    .appt-val-large.time-val {
      color: #1E4E8C;
    }
    .appt-val-bold {
      font-size: 10.5px;
      font-weight: 700;
      color: #0F2A4A;
    }
    .appt-sub {
      font-size: 8px;
      color: #64748b;
      margin-top: 1px;
    }
    .badge-status-confirmed {
      display: inline-block;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 700;
      background: #2E8B57;
      color: #ffffff;
    }
    .appt-notice-box {
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 10px;
    }

    /* Checklist Grid */
    .checklist-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }
    .check-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 5px 8px;
    }
    .check-item .box {
      font-family: monospace;
      font-weight: 800;
      font-size: 11px;
      color: #1E4E8C;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .check-text strong {
      display: block;
      font-size: 9.5px;
      color: #0F2A4A;
    }
    .check-text span {
      display: block;
      font-size: 8px;
      color: #64748b;
      margin-top: 1px;
      line-height: 1.25;
    }

    /* Guidelines Grid */
    .guidelines-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      background-color: #fafbfc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 6px 10px;
    }
    .rule-item {
      font-size: 8.5px;
      color: #475569;
      line-height: 1.3;
    }
    .rule-item strong {
      color: #0F2A4A;
    }

    /* Official Staff & Cashier Section */
    .official-use-box {
      border: 1.5px solid #0F2A4A;
      border-radius: 6px;
      background-color: #fafbfc;
      padding: 6px 8px;
    }
    .official-title {
      background: #0F2A4A;
      color: #F2B600;
      border-left: none;
      padding: 3px 8px;
      border-radius: 3px;
      margin-bottom: 6px;
    }
    .official-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
    }
    .official-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      vertical-align: top;
      background-color: #ffffff;
    }
    .officer-field-label {
      font-size: 8px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .officer-line {
      border-bottom: 1px solid #94a3b8;
      height: 14px;
      margin-top: 2px;
    }
    .field-sub {
      font-size: 7.5px;
      color: #94a3b8;
      text-align: center;
      margin-top: 2px;
    }
    .id-checks {
      font-size: 8.5px;
      color: #334155;
      font-family: monospace;
      margin-top: 2px;
    }

    /* Footer */
    .slip-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      margin-top: 6px;
    }
    .footer-disclaimer {
      font-size: 7.5px;
      color: #64748b;
      line-height: 1.3;
      text-align: justify;
    }
    .footer-audit {
      display: flex;
      justify-content: space-between;
      font-size: 7px;
      color: #94a3b8;
      font-family: monospace;
      margin-top: 4px;
    }

    /* Print Specific Tweaks */
    @media print {
      body {
        background-color: #ffffff !important;
        padding: 0 !important;
      }
      .slip-container {
        border: 2px solid #0F2A4A !important;
        box-shadow: none !important;
        padding: 10px 14px !important;
        max-width: 100% !important;
        border-radius: 0 !important;
      }
      .section-block {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="slip-container">
    <!-- 1. Formal Letterhead -->
    <div class="slip-header">
      <div class="header-seal left-seal">
        ${repSealSvg}
      </div>
      <div class="header-text">
        <div class="country">Republic of the Philippines</div>
        <div class="province">Province of Cebu • City of Talisay</div>
        <div class="barangay">BARANGAY CANSOJONG</div>
        <div class="office">OFFICE OF THE PUNONG BARANGAY • CITIZENS' E-SERVICES PORTAL</div>
        <div class="hall-address">Barangay Hall Complex, Cansojong, Talisay City, Cebu 6045 • Hotline: (032) 272-0000</div>
      </div>
      <div class="header-seal right-seal">
        ${brgySealSvg}
      </div>
    </div>

    <div class="header-divider"></div>

    <!-- Slip Document Title -->
    <div class="slip-title-bar">
      <div class="title-main">OFFICIAL TRANSACTION & APPOINTMENT SLIP</div>
      <div class="title-sub">Document Request Acknowledgement & In-Person Appearance Claim Voucher</div>
    </div>

    <!-- Reference & Metadata Strip -->
    <div class="ref-strip">
      <div class="ref-highlight">
        <span class="ref-label">APPLICATION REFERENCE NUMBER</span>
        <span class="ref-value">${escapeHtml(request.referenceNumber)}</span>
        <div class="barcode-wrapper">${barcodeSvg}</div>
      </div>
      <div>
        <div class="meta-item">
          <span class="meta-label">APPLICATION DATE:</span>
          <span class="meta-val">${formatDateTime(request.createdAt)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">CURRENT STATUS:</span>
          <span class="meta-badge">${escapeHtml(request.currentStatus)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">SLIP ISSUED ON:</span>
          <span class="meta-val">${issuedTimestamp}</span>
        </div>
      </div>
      <div class="qr-container">
        <img
          src="${qrCodeUrl}"
          alt="QR Code"
          width="76"
          height="76"
          style="display: block; border-radius: 2px;"
          onerror="this.style.display='none'; document.getElementById('qr-fallback-box').style.display='block';"
        />
        <div id="qr-fallback-box" style="display: none;">
          ${qrFallbackSvg}
        </div>
        <span class="qr-caption">SCAN TO VERIFY</span>
      </div>
    </div>

    <!-- Section 1: Applicant Information -->
    <div class="section-block">
      <div class="section-title">1. APPLICANT & RESIDENT IDENTIFICATION</div>
      <table class="slip-table">
        <tr>
          <td class="lbl" style="width: 20%;">Applicant Full Name:</td>
          <td class="val bold" style="width: 42%; font-size: 11.5px; color: #0F2A4A;">${escapeHtml(residentName)}</td>
          <td class="lbl" style="width: 16%;">Resident ID No.:</td>
          <td class="val mono" style="width: 22%;">CAN-RES-${String(residentId).padStart(5, '0')}</td>
        </tr>
        <tr>
          <td class="lbl">Registered Address:</td>
          <td class="val" colspan="3">${escapeHtml(address)}</td>
        </tr>
        <tr>
          <td class="lbl">Contact Mobile:</td>
          <td class="val">${escapeHtml(contact)}</td>
          <td class="lbl">Registered Email:</td>
          <td class="val">${escapeHtml(email)}</td>
        </tr>
      </table>
    </div>

    <!-- Section 2: Transaction & Service Details -->
    <div class="section-block">
      <div class="section-title">2. DOCUMENT REQUEST & ASSESSMENT SUMMARY</div>
      <table class="slip-table">
        <tr>
          <td class="lbl" style="width: 20%;">Requested Document:</td>
          <td class="val bold" style="width: 45%; color: #1E4E8C; font-size: 11.5px;">${escapeHtml(serviceName)}</td>
          <td class="lbl" style="width: 15%;">Service Code:</td>
          <td class="val mono" style="width: 20%;">${escapeHtml(serviceCode)}</td>
        </tr>
        <tr>
          <td class="lbl">Declared Purpose:</td>
          <td class="val" colspan="3">${escapeHtml(purpose)}</td>
        </tr>
        <tr>
          <td class="lbl">Assessed Document Fee:</td>
          <td class="val bold fee-highlight">${feeFormatted}</td>
          <td class="lbl">Payment Terms:</td>
          <td class="val payment-terms">${paymentNotice}</td>
        </tr>
        <tr>
          <td class="lbl">Estimated Turnaround:</td>
          <td class="val" colspan="3">Standard Turnaround: ${estDays} Business Day(s) upon in-person physical appearance & verification</td>
        </tr>
      </table>
    </div>

    <!-- Section 3: Scheduled Office Appearance -->
    <div class="section-block appointment-box">
      <div class="section-title appt-title">3. SCHEDULED IN-PERSON APPEARANCE SCHEDULE</div>
      ${appointmentContent}
    </div>

    <!-- Section 4: Physical Requirements Checklist -->
    <div class="section-block">
      <div class="section-title">4. MANDATORY IN-PERSON REQUIREMENTS CHECKLIST (WHAT TO BRING)</div>
      <div class="checklist-grid">
        ${checklistItemsHtml}
      </div>
    </div>

    <!-- Section 5: Guidelines & Appearance Policies -->
    <div class="section-block">
      <div class="section-title">5. IMPORTANT CITIZENS' CHARTER REMINDERS & GUIDELINES</div>
      <div class="guidelines-grid">
        <div class="rule-item">
          <strong>• Punctuality & Triage:</strong> Arrive 10 to 15 minutes before your scheduled slot. Present this printed slip at the Triage Desk to be called in your designated window.
        </div>
        <div class="rule-item">
          <strong>• Dress Code Decorum:</strong> Standard government attire is strictly enforced. Sleeveless tops, short shorts, and slippers/flip-flops are prohibited inside the session hall.
        </div>
        <div class="rule-item">
          <strong>• Authorized Representative:</strong> If unable to appear in person, representative must submit: (1) Signed Authorization Letter, (2) Applicant's Original Valid ID, and (3) Representative's Original Valid ID.
        </div>
        <div class="rule-item">
          <strong>• Non-Transferable:</strong> This slip is non-transferable and valid solely for the declared applicant and reference number. Rescheduling must be done via the online portal.
        </div>
      </div>
    </div>

    <!-- Section 6: Official Use Desk -->
    <div class="section-block official-use-box">
      <div class="section-title official-title">6. FOR BARANGAY CANSOJONG OFFICIAL & CASHIER USE ONLY</div>
      <table class="official-table">
        <tr>
          <td style="width: 25%;">
            <div class="officer-field-label">Date & Time Appeared:</div>
            <div class="officer-line"></div>
          </td>
          <td style="width: 35%;">
            <div class="officer-field-label">Triage & Receiving Staff:</div>
            <div class="officer-line"></div>
            <div class="field-sub">Signature over Printed Name</div>
          </td>
          <td style="width: 40%;">
            <div class="officer-field-label">Valid ID Presented & Verified:</div>
            <div class="id-checks">
              [ ] PhilSys &nbsp; [ ] DL &nbsp; [ ] Passport &nbsp; [ ] Other: ______
            </div>
            <div style="font-size: 8px; margin-top: 3px;">ID No.: ____________________________</div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="officer-field-label">Official Receipt (O.R.) No.:</div>
            <div class="officer-line"></div>
          </td>
          <td>
            <div class="officer-field-label">Amount Paid & Cashier Signature:</div>
            <div class="officer-line"></div>
            <div class="field-sub">₱ _______________ &nbsp; Cashier</div>
          </td>
          <td>
            <div class="officer-field-label">Document Release Control No.:</div>
            <div class="officer-line"></div>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <div class="officer-field-label">Approved & Released By:</div>
            <div class="officer-line" style="margin-top: 18px;"></div>
            <div class="field-sub">Authorized Releasing Officer (Signature over Printed Name)</div>
          </td>
          <td>
            <div class="officer-field-label">Applicant Document Claim Acknowledgment:</div>
            <div class="officer-line" style="margin-top: 18px;"></div>
            <div class="field-sub">Signature of Applicant / Authorized Representative</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Footer Security Notice -->
    <div class="slip-footer">
      <div class="footer-disclaimer">
        <strong>SYSTEM AUTHENTICATION NOTICE:</strong> This document is an official computer-generated transaction and appointment slip issued by the Barangay Cansojong eServices Online Portal (Talisay City, Cebu). No physical signature is required to validate this appointment slip. Authenticity can be verified at <u>${escapeHtml(trackingUrl)}</u> or by scanning the QR code above.
      </div>
      <div class="footer-audit">
        <span>PORTAL VERIFICATION REF: ${escapeHtml(request.referenceNumber)}</span>
        <span>GENERATED: ${new Date().toISOString()}</span>
        <span>BARANGAY CANSOJONG CITIZENS' CHARTER COMPLIANT</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}
