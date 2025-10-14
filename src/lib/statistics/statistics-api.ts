import { Statistics } from '@/hooks/use-statistics'

export interface StatisticsResponse {
  success: boolean
  data?: Statistics
  error?: string
}

export class StatisticsAPI {
  private static readonly ENDPOINT = '/api/admin/statistics'

  /**
   * Fetch current statistics from the API
   */
  static async fetchStatistics(): Promise<Statistics> {
    try {
      const response = await fetch(this.ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: StatisticsResponse = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Invalid response format')
      }

      return result.data
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Fetch statistics with retry logic
   */
  static async fetchStatisticsWithRetry(
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<Statistics> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.fetchStatistics()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        if (attempt === maxRetries) {
          break
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }

    throw lastError!
  }

  /**
   * Check if the statistics API is available
   */
  static async healthCheck(): Promise<boolean> {
    try {
      await this.fetchStatistics()
      return true
    } catch {
      return false
    }
  }
}