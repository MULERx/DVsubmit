import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'
import { applicationSchema } from '@/lib/validations/application'

export async function POST(request: NextRequest) {
  try {
    let userWithRole = await authServer.getUserWithRole()
    
    // If user exists in Supabase but not in database, sync them
    if (userWithRole?.supabaseUser && !userWithRole.dbUser) {
      try {
        const dbUser = await authServer.syncUserToDatabase({
          id: userWithRole.supabaseUser.id,
          email: userWithRole.supabaseUser.email || '',
        })
        userWithRole = { ...userWithRole, dbUser }
      } catch (syncError) {
        console.error('Failed to sync user to database:', syncError)
        return NextResponse.json(
          { success: false, error: { code: 'USER_SYNC_ERROR', message: 'Failed to sync user data' } },
          { status: 500 }
        )
      }
    }
    
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate the complete application data
    const validationResult = applicationSchema.safeParse(body)
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

    const data = validationResult.data

    // Create the application with all data
    const application = await prisma.application.create({
      data: {
        userId: userWithRole.dbUser.id,
        
        // Personal Information
        familyName: data.familyName,
        givenName: data.givenName,
        middleName: data.middleName || null,
        gender: data.gender,
        dateOfBirth: new Date(data.dateOfBirth),
        cityOfBirth: data.cityOfBirth,
        countryOfBirth: data.countryOfBirth,
        countryOfEligibility: data.countryOfEligibility,
        eligibilityClaimType: data.eligibilityClaimType || null,
        
        // Mailing Address
        inCareOf: data.inCareOf || null,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        stateProvince: data.stateProvince,
        postalCode: data.postalCode,
        country: data.country,
        countryOfResidence: data.countryOfResidence,
        
        // Contact Information
        phoneNumber: data.phoneNumber || null,
        email: data.email,
        
        // Education
        educationLevel: data.educationLevel,
        
        // Marital Status
        maritalStatus: data.maritalStatus,
        spouseFamilyName: data.spouseFamilyName || null,
        spouseGivenName: data.spouseGivenName || null,
        spouseMiddleName: data.spouseMiddleName || null,
        spouseGender: data.spouseGender || null,
        spouseDateOfBirth: data.spouseDateOfBirth ? new Date(data.spouseDateOfBirth) : null,
        spouseCityOfBirth: data.spouseCityOfBirth || null,
        spouseCountryOfBirth: data.spouseCountryOfBirth || null,
        spousePhotoUrl: null, // Will be handled separately
        
        // Photo
        photoUrl: null, // Will be handled separately
        photoValidated: false,
        
        // Payment - starts as pending
        paymentStatus: 'PENDING',
        status: 'PAYMENT_PENDING',
      },
    })

    // Create children records if any
    if (data.children && data.children.length > 0) {
      await prisma.child.createMany({
        data: data.children.map(child => ({
          applicationId: application.id,
          familyName: child.familyName,
          givenName: child.givenName,
          middleName: child.middleName || null,
          gender: child.gender,
          dateOfBirth: new Date(child.dateOfBirth),
          cityOfBirth: child.cityOfBirth,
          countryOfBirth: child.countryOfBirth,
          photoUrl: null, // Will be handled separately
        })),
      })
    }

    // Log the submission
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: application.id,
        action: 'APPLICATION_SUBMITTED',
        details: {
          hasSpouse: !!data.spouseFamilyName,
          childrenCount: data.children?.length || 0,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Fetch the complete application with children
    const completeApplication = await prisma.application.findUnique({
      where: { id: application.id },
      include: {
        children: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: completeApplication,
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to submit application'
        }
      },
      { status: 500 }
    )
  }
}