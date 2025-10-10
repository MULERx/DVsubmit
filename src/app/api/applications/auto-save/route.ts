import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'
import { personalInfoSchema, contactInfoSchema, educationWorkSchema } from '@/lib/validations/application'
import { z } from 'zod'

// Schema for partial application updates
const partialApplicationSchema = z.object({
  applicationId: z.string().optional(), // Optional application ID for editing specific applications
  personal: personalInfoSchema.partial().optional(),
  contact: contactInfoSchema.partial().optional(),
  education: educationWorkSchema.partial().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const userWithRole = await authServer.getUserWithRole()
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate the request body
    const validationResult = partialApplicationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid application data',
            details: validationResult.error.issues
          }
        },
        { status: 400 }
      )
    }

    const { applicationId, personal, contact, education } = validationResult.data

    // Find specific application or most recent draft
    let application = null
    if (applicationId) {
      // Find specific application for editing
      application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          userId: userWithRole.dbUser.id,
          status: {
            in: ['DRAFT', 'PAYMENT_PENDING'] // Allow editing of draft and payment pending applications
          }
        }
      })
    } else {
      // Find most recent draft application
      application = await prisma.application.findFirst({
        where: {
          userId: userWithRole.dbUser.id,
          status: 'DRAFT',
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Map form data to database fields
    if (personal) {
      if (personal.firstName) updateData.firstName = personal.firstName
      if (personal.lastName) updateData.lastName = personal.lastName
      if (personal.dateOfBirth) updateData.dateOfBirth = new Date(personal.dateOfBirth)
      if (personal.countryOfBirth) updateData.countryOfBirth = personal.countryOfBirth
      if (personal.countryOfEligibility) updateData.countryOfEligibility = personal.countryOfEligibility
    }

    if (contact) {
      if (contact.email) updateData.email = contact.email
      if (contact.phone) updateData.phone = contact.phone
      if (contact.address) updateData.address = contact.address
    }

    if (education) {
      if (education.education) updateData.education = education.education
      if (education.occupation) updateData.occupation = education.occupation
    }

    if (application) {
      // Update existing application
      application = await prisma.application.update({
        where: {
          id: application.id,
        },
        data: updateData,
      })
    } else {
      // Check draft application limit before creating new one
      const draftCount = await prisma.application.count({
        where: {
          userId: userWithRole.dbUser.id,
          status: 'DRAFT',
        },
      })

      const MAX_DRAFT_APPLICATIONS = 5
      if (draftCount >= MAX_DRAFT_APPLICATIONS) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DRAFT_LIMIT_EXCEEDED',
              message: `You can only have ${MAX_DRAFT_APPLICATIONS} draft applications at a time. Please submit or delete existing drafts to create new ones.`
            }
          },
          { status: 400 }
        )
      }

      // Create new draft application with minimal required fields
      const requiredFields = {
        firstName: personal?.firstName || '',
        lastName: personal?.lastName || '',
        dateOfBirth: personal?.dateOfBirth ? new Date(personal.dateOfBirth) : new Date(),
        countryOfBirth: personal?.countryOfBirth || '',
        countryOfEligibility: personal?.countryOfEligibility || '',
        email: contact?.email || userWithRole.dbUser.email || '',
        phone: contact?.phone || '',
        address: contact?.address || {},
        education: education?.education || '',
        occupation: education?.occupation || '',
      }

      application = await prisma.application.create({
        data: {
          ...requiredFields,
          ...updateData,
          userId: userWithRole.dbUser.id,
          status: 'DRAFT',
        },
      })
    }

    // Log the auto-save action (less verbose than full updates)
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: 'APPLICATION_AUTO_SAVED',
        details: {
          sections: Object.keys(validationResult.data).filter(key => validationResult.data[key as keyof typeof validationResult.data]),
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: application,
    })
  } catch (error) {
    console.error('Error auto-saving application:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to auto-save application'
        }
      },
      { status: 500 }
    )
  }
}