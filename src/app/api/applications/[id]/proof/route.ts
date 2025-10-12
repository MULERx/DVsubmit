import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userWithRole = await authServer.getUserWithRole()
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const applicationId = params.id

    // Get the application and verify ownership
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userWithRole.dbUser.id,
      },
      include: {
        user: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      )
    }

    // Check if application has been submitted and has confirmation number
    if (!application.confirmationNumber || !application.submittedAt) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'NOT_SUBMITTED', 
            message: 'Application has not been submitted yet' 
          } 
        },
        { status: 400 }
      )
    }

    // Generate proof of submission document (HTML that can be printed as PDF)
    const proofHtml = generateProofOfSubmissionHTML(application)

    // Log the proof generation
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: 'PROOF_DOWNLOADED',
        details: {
          confirmationNumber: application.confirmationNumber,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Return HTML response that can be printed as PDF
    return new NextResponse(proofHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="DV-Submission-Proof-${application.confirmationNumber}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating proof of submission:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to generate proof of submission' 
        } 
      },
      { status: 500 }
    )
  }
}

function generateProofOfSubmissionHTML(application: any): string {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DV Lottery Submission Proof - ${application.confirmationNumber}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #1f2937;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #6b7280;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        .confirmation-box {
            background: #f0f9ff;
            border: 2px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        .confirmation-number {
            font-size: 32px;
            font-weight: bold;
            color: #0ea5e9;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
            margin: 10px 0;
        }
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
        }
        .detail-section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }
        .detail-section h3 {
            margin: 0 0 15px 0;
            color: #1f2937;
            font-size: 18px;
        }
        .detail-item {
            margin: 8px 0;
            display: flex;
            justify-content: space-between;
        }
        .detail-label {
            font-weight: bold;
            color: #4b5563;
        }
        .detail-value {
            color: #1f2937;
        }
        .disclaimer {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        .disclaimer h3 {
            color: #92400e;
            margin: 0 0 10px 0;
        }
        .disclaimer p {
            color: #92400e;
            margin: 5px 0;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
        }
        @media print {
            body {
                padding: 20px;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>DV Lottery Submission Proof</h1>
        <p>Official Confirmation of Application Submission</p>
    </div>

    <div class="confirmation-box">
        <h2 style="margin: 0; color: #1f2937;">Confirmation Number</h2>
        <div class="confirmation-number">${application.confirmationNumber}</div>
        <p style="margin: 10px 0 0 0; color: #6b7280;">
            Keep this number for your records
        </p>
    </div>

    <div class="details-grid">
        <div class="detail-section">
            <h3>Personal Information</h3>
            <div class="detail-item">
                <span class="detail-label">Full Name:</span>
                <span class="detail-value">${application.givenName} ${application.familyName}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Date of Birth:</span>
                <span class="detail-value">${new Date(application.dateOfBirth).toISOString().split('T')[0]}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Country of Birth:</span>
                <span class="detail-value">${application.countryOfBirth}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Country of Eligibility:</span>
                <span class="detail-value">${application.countryOfEligibility}</span>
            </div>
        </div>

        <div class="detail-section">
            <h3>Submission Details</h3>
            <div class="detail-item">
                <span class="detail-label">Submitted On:</span>
                <span class="detail-value">${formatDate(application.submittedAt)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Application ID:</span>
                <span class="detail-value">${application.id}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${application.email}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${application.status}</span>
            </div>
        </div>
    </div>

    <div class="detail-section" style="grid-column: 1 / -1;">
        <h3>Contact Information</h3>
        <div class="detail-item">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${application.phone}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Address:</span>
            <span class="detail-value">
                ${application.address?.street || ''}, 
                ${application.address?.city || ''}, 
                ${application.address?.state || ''} 
                ${application.address?.postalCode || ''}, 
                ${application.address?.country || ''}
            </span>
        </div>
    </div>

    <div class="disclaimer">
        <h3>Important Notice</h3>
        <p><strong>This is not a government document.</strong> This proof of submission was generated by DVSubmit, a private service that assists with DV lottery applications.</p>
        <p>Selection in the DV lottery is not guaranteed. This document only confirms that your application was submitted to the official U.S. Department of State DV lottery system.</p>
        <p>For official results and information, please visit the U.S. Department of State's official DV lottery website.</p>
        <p>Keep this confirmation number safe as you may need it to check your results on the official website.</p>
    </div>

    <div class="footer">
        <p>Generated on ${formatDate(new Date())}</p>
        <p>DVSubmit - DV Lottery Application Service</p>
        <p>This document can be printed or saved as PDF for your records</p>
    </div>
</body>
</html>
  `.trim()
}