import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authServer } from '@/lib/auth/server-auth-helpers'

export async function PATCH(
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

    const applicationData = await request.json()

    // Find the application and verify ownership
    const existingApplication = await prisma.application.findFirst({
      where: {
        id: params.id,
        userId: userWithRole.dbUser.id,
      },
    })

    if (!existingApplication) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      )
    }

    // Only allow updating APPLICATION_REJECTED applications
    if (existingApplication.status !== 'APPLICATION_REJECTED') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'Application can only be updated when rejected' } },
        { status: 400 }
      )
    }

    // Update the application and reset status to PAYMENT_PENDING
    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: {
        // Personal Information
        familyName: applicationData.familyName,
        givenName: applicationData.givenName,
        middleName: applicationData.middleName,
        gender: applicationData.gender,
        dateOfBirth: applicationData.dateOfBirth,
        cityOfBirth: applicationData.cityOfBirth,
        countryOfBirth: applicationData.countryOfBirth,
        countryOfEligibility: applicationData.countryOfEligibility,
        eligibilityClaimType: applicationData.eligibilityClaimType,
        
        // Mailing Address
        inCareOf: applicationData.inCareOf,
        addressLine1: applicationData.addressLine1,
        addressLine2: applicationData.addressLine2,
        city: applicationData.city,
        stateProvince: applicationData.stateProvince,
        postalCode: applicationData.postalCode,
        country: applicationData.country,
        countryOfResidence: applicationData.countryOfResidence,
        
        // Contact Information
        phoneNumber: applicationData.phoneNumber,
        email: applicationData.email,
        
        // Education
        educationLevel: applicationData.educationLevel,
        
        // Marital Status
        maritalStatus: applicationData.maritalStatus,
        spouseFamilyName: applicationData.spouseFamilyName,
        spouseGivenName: applicationData.spouseGivenName,
        spouseMiddleName: applicationData.spouseMiddleName,
        spouseGender: applicationData.spouseGender,
        spouseDateOfBirth: applicationData.spouseDateOfBirth,
        spouseCityOfBirth: applicationData.spouseCityOfBirth,
        spouseCountryOfBirth: applicationData.spouseCountryOfBirth,
        
        // Children
        children: applicationData.children,
        
        // Reset status to pending for review
        status: 'PAYMENT_PENDING',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedApplication
    })

  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to update application' 
        } 
      },
      { status: 500 }
    )
  }
}