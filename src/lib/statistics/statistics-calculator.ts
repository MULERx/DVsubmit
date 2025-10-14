import { Statistics } from '@/hooks/use-statistics'

export type ApplicationStatus = 
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFIED' 
  | 'PAYMENT_REJECTED'
  | 'APPLICATION_REJECTED'
  | 'SUBMITTED'

export interface ApplicationRecord {
  id: string
  status: ApplicationStatus
  [key: string]: any
}

export class StatisticsCalculator {
  /**
   * Calculate statistics from a list of applications
   */
  static calculateFromApplications(applications: ApplicationRecord[]): Statistics {
    const stats: Statistics = {
      totalSubmittedApplications: applications.length,
      pendingPaymentVerify: 0,
      rejectedPayments: 0,
      rejectedApplications: 0,
      pendingReviewAndSubmit: 0,
      submittedToDV: 0
    }

    applications.forEach(app => {
      switch (app.status) {
        case 'PAYMENT_PENDING':
          stats.pendingPaymentVerify++
          break
        case 'PAYMENT_REJECTED':
          stats.rejectedPayments++
          break
        case 'APPLICATION_REJECTED':
          stats.rejectedApplications++
          break
        case 'PAYMENT_VERIFIED':
          stats.pendingReviewAndSubmit++
          break
        case 'SUBMITTED':
          stats.submittedToDV++
          break
      }
    })

    return stats
  }

  /**
   * Update statistics based on a single application change
   */
  static updateFromChange(
    currentStats: Statistics,
    eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    newRecord?: ApplicationRecord,
    oldRecord?: ApplicationRecord
  ): Statistics {
    const newStats = { ...currentStats }

    switch (eventType) {
      case 'INSERT':
        if (newRecord) {
          newStats.totalSubmittedApplications++
          this.incrementStatusCount(newStats, newRecord.status)
        }
        break

      case 'UPDATE':
        if (newRecord && oldRecord && oldRecord.status !== newRecord.status) {
          this.decrementStatusCount(newStats, oldRecord.status)
          this.incrementStatusCount(newStats, newRecord.status)
        }
        break

      case 'DELETE':
        if (oldRecord) {
          newStats.totalSubmittedApplications--
          this.decrementStatusCount(newStats, oldRecord.status)
        }
        break
    }

    // Ensure no negative values
    return this.ensureNonNegative(newStats)
  }

  /**
   * Increment count for a specific status
   */
  private static incrementStatusCount(stats: Statistics, status: ApplicationStatus): void {
    switch (status) {
      case 'PAYMENT_PENDING':
        stats.pendingPaymentVerify++
        break
      case 'PAYMENT_REJECTED':
        stats.rejectedPayments++
        break
      case 'APPLICATION_REJECTED':
        stats.rejectedApplications++
        break
      case 'PAYMENT_VERIFIED':
        stats.pendingReviewAndSubmit++
        break
      case 'SUBMITTED':
        stats.submittedToDV++
        break
    }
  }

  /**
   * Decrement count for a specific status
   */
  private static decrementStatusCount(stats: Statistics, status: ApplicationStatus): void {
    switch (status) {
      case 'PAYMENT_PENDING':
        stats.pendingPaymentVerify--
        break
      case 'PAYMENT_REJECTED':
        stats.rejectedPayments--
        break
      case 'APPLICATION_REJECTED':
        stats.rejectedApplications--
        break
      case 'PAYMENT_VERIFIED':
        stats.pendingReviewAndSubmit--
        break
      case 'SUBMITTED':
        stats.submittedToDV--
        break
    }
  }

  /**
   * Ensure all statistics values are non-negative
   */
  private static ensureNonNegative(stats: Statistics): Statistics {
    return {
      totalSubmittedApplications: Math.max(0, stats.totalSubmittedApplications),
      pendingPaymentVerify: Math.max(0, stats.pendingPaymentVerify),
      rejectedPayments: Math.max(0, stats.rejectedPayments),
      rejectedApplications: Math.max(0, stats.rejectedApplications),
      pendingReviewAndSubmit: Math.max(0, stats.pendingReviewAndSubmit),
      submittedToDV: Math.max(0, stats.submittedToDV)
    }
  }

  /**
   * Validate statistics integrity
   */
  static validateStatistics(stats: Statistics): boolean {
    const sum = stats.pendingPaymentVerify + 
                stats.rejectedPayments + 
                stats.rejectedApplications + 
                stats.pendingReviewAndSubmit + 
                stats.submittedToDV

    return sum <= stats.totalSubmittedApplications
  }
}