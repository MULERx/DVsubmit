/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authServer } from "@/lib/auth/server-auth-helpers";

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await authServer.isAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all"; // 'active', 'blocked', 'all'
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      // Only get users who have applications (applicants)
      applications: {
        some: {},
      },
    };

    // Filter by status (active/blocked)
    if (status === "active") {
      where.blocked = false;
    } else if (status === "blocked") {
      where.blocked = true;
    }
    // 'all' includes both active and blocked

    // Add search filter
    if (search) {
      where.email = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === "email") {
      orderBy.email = sortOrder;
    } else if (sortBy === "applicationsCount") {
      orderBy.applications = { _count: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get applicants with their applications
    const [applicants, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
          applications: {
            select: {
              id: true,
              status: true,
              familyName: true,
              givenName: true,
              createdAt: true,
              submittedAt: true,
              confirmationNumber: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        applicants,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch applicants",
      },
      { status: 500 }
    );
  }
}
