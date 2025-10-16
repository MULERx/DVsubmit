/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authServer } from "@/lib/auth/server-auth-helpers";
import { applicationSchema } from "@/lib/validations/application";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userWithRole = await authServer.getUserWithRole();
    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id: applicationId } = await params;

    // Validate the complete application data
    const validationResult = applicationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid application data",
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Find the application and verify ownership
    const existingApplication = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userWithRole.dbUser.id,
      },
      include: {
        children: true,
      },
    });

    if (!existingApplication) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Application not found" },
        },
        { status: 404 }
      );
    }

    // Only allow updating APPLICATION_REJECTED applications
    if (existingApplication.status !== "APPLICATION_REJECTED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "Application can only be updated when rejected",
          },
        },
        { status: 400 }
      );
    }

    // Update the application and reset status to PAYMENT_PENDING
    await prisma.application.update({
      where: { id: applicationId },
      data: {
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
        phoneNumber: data.phoneNumber,
        email: data.email,

        // Education
        educationLevel: data.educationLevel,

        // Marital Status
        maritalStatus: data.maritalStatus,
        spouseFamilyName: data.spouseFamilyName || null,
        spouseGivenName: data.spouseGivenName || null,
        spouseMiddleName: data.spouseMiddleName || null,
        spouseGender: data.spouseGender || null,
        spouseDateOfBirth: data.spouseDateOfBirth
          ? new Date(data.spouseDateOfBirth)
          : null,
        spouseCityOfBirth: data.spouseCityOfBirth || null,
        spouseCountryOfBirth: data.spouseCountryOfBirth || null,

        // Photos
        photoUrl: (data as any).photoUrl || null,
        spousePhotoUrl: (data as any).spousePhotoUrl || null,

        // Payment
        paymentReference: (data as any).paymentReference || null,

        // Reset status to pending for review
        status: "PAYMENT_PENDING",
        updatedAt: new Date(),
      },
      select: { id: true },
    });

    // Handle children updates
    if (data.children && data.children.length > 0) {
      // Delete existing children
      await prisma.child.deleteMany({
        where: { applicationId: applicationId },
      });

      // Create new children records
      await prisma.child.createMany({
        data: data.children.map((child) => ({
          applicationId: applicationId,
          familyName: child.familyName,
          givenName: child.givenName,
          middleName: child.middleName || null,
          gender: child.gender,
          dateOfBirth: new Date(child.dateOfBirth),
          cityOfBirth: child.cityOfBirth,
          countryOfBirth: child.countryOfBirth,
          photoUrl: (child as any).photoUrl || null,
        })),
      });
    } else {
      // If no children in the update, remove existing ones
      await prisma.child.deleteMany({
        where: { applicationId: applicationId },
      });
    }

    // Log the update
    await prisma.auditLog.create({
      data: {
        userId: userWithRole.dbUser.id,
        applicationId: applicationId,
        action: "APPLICATION_UPDATED",
        details: {
          hasSpouse: !!data.spouseFamilyName,
          childrenCount: data.children?.length || 0,
          timestamp: new Date().toISOString(),
        },
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
      select: { id: true },
    });

    // Fetch the complete updated application with children
    const completeApplication = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        children: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: completeApplication,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update application",
        },
      },
      { status: 500 }
    );
  }
}
