import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { createClient } from "@/lib/supabase/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Verify authentication and admin role
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role from database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { role: true },
    });

    if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get statistics
    const [
      totalSubmittedApplications,
      pendingPaymentVerify,
      rejectedPayments,
      rejectedApplications,
      pendingReviewAndSubmit,
      submittedToDV,
    ] = await Promise.all([
      prisma.application.count(),

      prisma.application.count({
        where: {
          status: "PAYMENT_PENDING",
        },
      }),

      prisma.application.count({
        where: {
          status: "PAYMENT_REJECTED",
        },
      }),

      prisma.application.count({
        where: {
          status: "APPLICATION_REJECTED",
        },
      }),

      prisma.application.count({
        where: {
          status: "PAYMENT_VERIFIED",
        },
      }),

      prisma.application.count({
        where: {
          status: "SUBMITTED",
        },
      }),
    ]);

    const statistics = {
      totalSubmittedApplications,
      pendingPaymentVerify,
      rejectedPayments,
      rejectedApplications,
      pendingReviewAndSubmit,
      submittedToDV,
    };

    return NextResponse.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}
