export const generatePrintHTML = (
  confirmationNumber: string,
  fullName: string,
  dateOfBirth: Date
): string => {
  const formattedDate = new Date(dateOfBirth).toISOString().split('T')[0]
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>DV Lottery Submission Proof - ${confirmationNumber}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 40px;
          background: white;
          color: #333;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .content {
          max-width: 600px;
          margin: 0 auto;
        }
        .info-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 30px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-value {
          font-size: 16px;
          color: #111827;
          font-weight: 500;
        }
        .confirmation-number {
          font-family: 'Courier New', monospace;
          font-size: 20px;
          font-weight: bold;
          color: #059669;
          background: #ecfdf5;
          padding: 10px 15px;
          border-radius: 6px;
          border: 2px solid #10b981;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #6b7280;
          font-size: 12px;
        }
        .important-note {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 20px;
          margin-top: 30px;
        }
        .important-note h4 {
          color: #92400e;
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
        }
        .important-note p {
          color: #78350f;
          margin: 0;
          font-size: 13px;
        }
        @media print {
          body { margin: 0; padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="content">
        <div class="header">
          <div class="title">DV Lottery Submission Proof</div>
          <div class="subtitle">Diversity Visa Program - Official Confirmation</div>
          <div class="subtitle">Generated on ${currentDate}</div>
        </div>

        <div class="info-section">
          <div class="info-row">
            <span class="info-label">Full Name</span>
            <span class="info-value">${fullName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date of Birth</span>
            <span class="info-value">${formattedDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">DV Confirmation Number</span>
            <span class="confirmation-number">${confirmationNumber}</span>
          </div>
        </div>

        <div class="important-note">
          <h4>⚠️ Important Information</h4>
          <p>
            This confirmation number is your proof of entry into the DV Lottery program. 
            Keep this document safe and use this confirmation number to check your status 
            on the official DV website. Do not lose this number as it cannot be retrieved later.
          </p>
        </div>

        <div class="footer">
          <p>This document was generated from your DV Lottery application system.</p>
          <p>For official status checks, visit the U.S. Department of State DV website.</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `
}