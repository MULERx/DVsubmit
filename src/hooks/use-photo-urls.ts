import { useState, useCallback } from 'react'

/**
 * Custom hook for managing photo signed URLs
 */
export const usePhotoUrls = () => {
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Fetches a signed URL for a photo path
   */
  const getSignedUrl = useCallback(async (path: string): Promise<string | undefined> => {
    try {
      const response = await fetch('/api/photos/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      })

      if (!response.ok) {
        console.error('Failed to get signed URL:', response.statusText)
        return undefined
      }

      const result = await response.json()
      return result.success ? result.signedUrl : undefined
    } catch (error) {
      console.error('Error getting signed URL:', error)
      return undefined
    }
  }, [])

  /**
   * Fetches signed URLs for multiple photo paths
   */
  const getMultipleSignedUrls = useCallback(async (paths: string[]): Promise<Record<string, string>> => {
    setIsLoading(true)
    const results: Record<string, string> = {}

    try {
      const promises = paths.map(async (path) => {
        const signedUrl = await getSignedUrl(path)
        if (signedUrl) {
          results[path] = signedUrl
        }
      })

      await Promise.all(promises)
    } catch (error) {
      console.error('Error fetching multiple signed URLs:', error)
    } finally {
      setIsLoading(false)
    }

    return results
  }, [getSignedUrl])

  return {
    getSignedUrl,
    getMultipleSignedUrls,
    isLoading
  }
}