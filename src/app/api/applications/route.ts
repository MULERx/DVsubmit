import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authServer } from "@/lib/auth/server-auth-helpers";

export async function GET() {
  try {
    let userWithRole = await authServer.getUserWithRole();

    // If user exists in Supabase but not in database, sync them
    if (userWithRole?.supabaseUser && !userWithRole.dbUser) {
      try {
        const dbUser = await authServer.syncUserToDatabase({
          id: userWithRole.supabaseUser.id,
          email: userWithRole.supabaseUser.email || "",
        });
        userWithRole = { ...userWithRole, dbUser };
      } catch (syncError) {
        console.error("Failed to sync user to database:", syncError);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "USER_SYNC_ERROR",
              message: "Failed to sync user data",
            },
          },
          { status: 500 }
        );
      }
    }

    if (!userWithRole?.dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    // Get user's applications with children
    const applications = await prisma.application.findMany({
      where: {
        userId: userWithRole.dbUser.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch applications",
        },
      },
      { status: 500 }
    );
  }
}
