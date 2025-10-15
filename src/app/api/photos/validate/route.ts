import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validatePhotoFile } from "@/lib/utils/photo-validation";
// Note: Advanced validation requires client-side APIs, so we'll use basic validation for now
// import { validateAdvancedPhotoCompliance } from '@/lib/utils/advanced-photo-validation'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("photo") as File;
    const validationType = (formData.get("type") as string) || "basic";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No photo file provided" },
        { status: 400 }
      );
    }

    // Perform basic validation first
    const basicValidation = await validatePhotoFile(file);

    // If basic validation fails, return early
    if (!basicValidation.isValid) {
      return NextResponse.json({
        success: true,
        data: {
          validation: basicValidation,
          validationType: "basic",
        },
      });
    }

    // Perform advanced validation if requested
    let advancedValidation = null;
    if (validationType === "advanced") {
      // Advanced validation requires client-side APIs (Canvas, Image)
      // For server-side validation, we'll return a placeholder
      advancedValidation = {
        isValid: basicValidation.isValid,
        errors: basicValidation.errors,
        warnings: [
          ...basicValidation.warnings,
          "Advanced validation requires client-side processing",
        ],
        complianceScore: basicValidation.isValid ? 85 : 40,
        complianceIssues: [],
        recommendations: ["Upload photo on client-side for full validation"],
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        validation: basicValidation,
        advancedValidation,
        validationType,
      },
    });
  } catch (error) {
    console.error("Photo validation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Validation failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get validation requirements
    return NextResponse.json({
      success: true,
      data: {
        requirements: {
          basic: {
            minWidth: 600,
            maxWidth: 1200,
            minHeight: 600,
            maxHeight: 1200,
            maxSize: 5 * 1024 * 1024,
            allowedFormats: ["image/jpeg", "image/jpg", "image/png"],
            aspectRatioTolerance: 0.1,
          },
          advanced: {
            faceDetection: true,
            backgroundAnalysis: true,
            qualityAssessment: true,
            complianceChecks: [
              "proper_lighting",
              "neutral_expression",
              "eyes_open",
              "no_glasses_glare",
              "centered_face",
              "plain_background",
            ],
          },
        },
      },
    });
  } catch (error) {
    console.error("Photo validation requirements API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get requirements",
      },
      { status: 500 }
    );
  }
}
