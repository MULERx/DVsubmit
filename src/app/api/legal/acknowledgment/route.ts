/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { version, type } = body;

    if (!version || !type) {
      return NextResponse.json(
        { error: "Version and type are required" },
        { status: 400 }
      );
    }

    // Find the user in our database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create audit log for legal acknowledgment
    await prisma.auditLog.create({
      data: {
        userId: dbUser.id,
        action: "LEGAL_ACKNOWLEDGMENT",
        details: {
          version,
          type,
          acknowledgedAt: new Date().toISOString(),
          userAgent: request.headers.get("user-agent"),
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
        },
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Legal acknowledgment recorded",
    });
  } catch (error) {
    console.error("Legal acknowledgment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user in our database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get latest legal acknowledgment
    const latestAcknowledgment = await prisma.auditLog.findFirst({
      where: {
        userId: dbUser.id,
        action: "LEGAL_ACKNOWLEDGMENT",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      hasAcknowledged: !!latestAcknowledgment,
      acknowledgment: latestAcknowledgment
        ? {
            version: (latestAcknowledgment.details as any)?.version,
            type: (latestAcknowledgment.details as any)?.type,
            acknowledgedAt: latestAcknowledgment.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Get legal acknowledgment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
