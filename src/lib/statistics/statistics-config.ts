export const STATISTICS_CONFIG = {
  // Realtime settings
  realtime: {
    channelName: 'statistics-applications',
    tableName: 'applications',
    enableByDefault: true,
    retryAttempts: 3,
    connectionTimeout: 10000, // 10 seconds
  },

  // UI settings
  ui: {
    refreshDebounce: 1000, // 1 second
    loadingTimeout: 15000, // 15 seconds
    showLastUpdated: true,
    showConnectionDetails: true,
  },

  // Error handling
  errors: {
    maxConsecutiveErrors: 3,
    errorCooldown: 60000, // 1 minute
    showErrorDetails: process.env.NODE_ENV === 'development',
  },

  // Performance settings
  performance: {
    enableStatisticsValidation: true,
    enableIncrementalUpdates: true,
    maxEventQueueSize: 100,
    eventProcessingDelay: 100, // ms
  }
} as const

export type StatisticsConfig = typeof STATISTICS_CONFIG