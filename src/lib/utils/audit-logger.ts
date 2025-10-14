import { prisma } from "@/lib/db";

interface AuditLogData {
  action: string;
  userId?: string;
  applicationId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: data.action,
          userId: data.userId || null,
          applicationId: data.applicationId || null,
          details: data.details,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
        },
      });
    } catch (error) {
      console.error("Failed to create audit log:", error);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  // Convenience methods for common actions
  static async logUserAction(
    action: string,
    userId: string,
    details: Record<string, any>,
    request?: Request
  ): Promise<void> {
    const ipAddress = request?.headers.get("x-forwarded-for") || 
                     request?.headers.get("x-real-ip") || 
                     undefined;
    const userAgent = request?.headers.get("user-agent") || undefined;

    await this.log({
      action,
      userId,
      details,
      ipAddress,
      userAgent,
    });
  }

  static async logApplicationAction(
    action: string,
    applicationId: string,
    userId?: string,
    details: Record<string, any> = {},
    request?: Request
  ): Promise<void> {
    const ipAddress = request?.headers.get("x-forwarded-for") || 
                     request?.headers.get("x-real-ip") || 
                     undefined;
    const userAgent = request?.headers.get("user-agent") || undefined;

    await this.log({
      action,
      userId,
      applicationId,
      details,
      ipAddress,
      userAgent,
    });
  }

  static async logSystemAction(
    action: string,
    details: Record<string, any>,
    request?: Request
  ): Promise<void> {
    const ipAddress = request?.headers.get("x-forwarded-for") || 
                     request?.headers.get("x-real-ip") || 
                     undefined;
    const userAgent = request?.headers.get("user-agent") || undefined;

    await this.log({
      action,
      details,
      ipAddress,
      userAgent,
    });
  }

  // Authentication related logs
  static async logLogin(userId: string, request?: Request): Promise<void> {
    await this.logUserAction("user_login", userId, { timestamp: new Date().toISOString() }, request);
  }

  static async logLogout(userId: string, request?: Request): Promise<void> {
    await this.logUserAction("user_logout", userId, { timestamp: new Date().toISOString() }, request);
  }

  static async logFailedLogin(email: string, reason: string, request?: Request): Promise<void> {
    await this.logSystemAction("user_login_failed", { 
      email, 
      reason, 
      timestamp: new Date().toISOString() 
    }, request);
  }

  // Application related logs
  static async logApplicationCreated(applicationId: string, userId: string, request?: Request): Promise<void> {
    await this.logApplicationAction("application_create", applicationId, userId, {
      timestamp: new Date().toISOString()
    }, request);
  }

  static async logApplicationUpdated(
    applicationId: string, 
    userId: string, 
    changes: Record<string, any>,
    request?: Request
  ): Promise<void> {
    await this.logApplicationAction("application_update", applicationId, userId, {
      changes,
      timestamp: new Date().toISOString()
    }, request);
  }

  static async logApplicationSubmitted(
    applicationId: string, 
    userId: string, 
    submittedBy: string,
    request?: Request
  ): Promise<void> {
    await this.logApplicationAction("application_submit", applicationId, userId, {
      submittedBy,
      timestamp: new Date().toISOString()
    }, request);
  }

  static async logApplicationRejected(
    applicationId: string, 
    rejectedBy: string, 
    reason: string,
    request?: Request
  ): Promise<void> {
    await this.logApplicationAction("application_reject", applicationId, undefined, {
      rejectedBy,
      reason,
      timestamp: new Date().toISOString()
    }, request);
  }

  // Payment related logs
  static async logPaymentVerified(
    applicationId: string, 
    verifiedBy: string, 
    paymentReference: string,
    request?: Request
  ): Promise<void> {
    await this.logApplicationAction("payment_verify", applicationId, undefined, {
      verifiedBy,
      paymentReference,
      timestamp: new Date().toISOString()
    }, request);
  }

  static async logPaymentRejected(
    applicationId: string, 
    rejectedBy: string, 
    reason: string,
    request?: Request
  ): Promise<void> {
    await this.logApplicationAction("payment_reject", applicationId, undefined, {
      rejectedBy,
      reason,
      timestamp: new Date().toISOString()
    }, request);
  }

  // Admin actions
  static async logAdminAction(
    action: string,
    adminUserId: string,
    targetUserId?: string,
    details: Record<string, any> = {},
    request?: Request
  ): Promise<void> {
    await this.logUserAction(`admin_${action}`, adminUserId, {
      targetUserId,
      ...details,
      timestamp: new Date().toISOString()
    }, request);
  }
}

// Export common action types for consistency
export const AUDIT_ACTIONS = {
  // User actions
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  USER_LOGIN_FAILED: "user_login_failed",
  USER_REGISTER: "user_register",
  USER_PASSWORD_RESET: "user_password_reset",
  USER_EMAIL_VERIFIED: "user_email_verified",
  USER_PROFILE_UPDATE: "user_profile_update",

  // Application actions
  APPLICATION_CREATE: "application_create",
  APPLICATION_UPDATE: "application_update",
  APPLICATION_DELETE: "application_delete",
  APPLICATION_SUBMIT: "application_submit",
  APPLICATION_REJECT: "application_reject",
  APPLICATION_VIEW: "application_view",

  // Payment actions
  PAYMENT_VERIFY: "payment_verify",
  PAYMENT_REJECT: "payment_reject",
  PAYMENT_REFERENCE_UPDATE: "payment_reference_update",

  // Admin actions
  ADMIN_USER_ROLE_CHANGE: "admin_user_role_change",
  ADMIN_USER_DELETE: "admin_user_delete",
  ADMIN_SYSTEM_SETTINGS_UPDATE: "admin_system_settings_update",
  ADMIN_BULK_ACTION: "admin_bulk_action",

  // System actions
  SYSTEM_BACKUP: "system_backup",
  SYSTEM_MAINTENANCE: "system_maintenance",
  SYSTEM_ERROR: "system_error",
} as const;