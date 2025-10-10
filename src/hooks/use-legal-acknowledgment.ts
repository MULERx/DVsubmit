'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'

interface LegalAcknowledgment {
  version: string
  acknowledgedAt: string
  userId: string
}

const CURRENT_TERMS_VERSION = '1.0.0'
const STORAGE_KEY = 'dvsubmit_legal_acknowledgment'

export function useLegalAcknowledgment() {
  const { user } = useAuth()
  const [hasAcknowledged, setHasAcknowledged] = useState<boolean>(false)
  const [needsAcknowledgment, setNeedsAcknowledgment] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Check if user has acknowledged current terms
  useEffect(() => {
    const checkAcknowledgment = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) {
          setNeedsAcknowledgment(true)
          setHasAcknowledged(false)
          setIsLoading(false)
          return
        }

        const acknowledgment: LegalAcknowledgment = JSON.parse(stored)
        
        // Check if acknowledgment is for current user and current version
        const isCurrentUser = user?.id === acknowledgment.userId
        const isCurrentVersion = acknowledgment.version === CURRENT_TERMS_VERSION
        
        if (isCurrentUser && isCurrentVersion) {
          setHasAcknowledged(true)
          setNeedsAcknowledgment(false)
        } else {
          setHasAcknowledged(false)
          setNeedsAcknowledgment(true)
        }
      } catch (error) {
        console.error('Error checking legal acknowledgment:', error)
        setNeedsAcknowledgment(true)
        setHasAcknowledged(false)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      checkAcknowledgment()
    } else {
      // For non-authenticated users, check if they've seen the first-visit disclaimer
      const guestAcknowledgment = localStorage.getItem('dvsubmit_guest_disclaimer')
      setNeedsAcknowledgment(!guestAcknowledgment)
      setHasAcknowledged(!!guestAcknowledgment)
      setIsLoading(false)
    }
  }, [user])

  // Acknowledge current terms
  const acknowledgeTerms = async (type: string = 'general') => {
    try {
      if (user) {
        // Store in database via API
        const response = await fetch('/api/legal/acknowledgment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: CURRENT_TERMS_VERSION,
            type
          })
        })

        if (!response.ok) {
          throw new Error('Failed to record acknowledgment')
        }

        // Also store locally for quick access
        const acknowledgment: LegalAcknowledgment = {
          version: CURRENT_TERMS_VERSION,
          acknowledgedAt: new Date().toISOString(),
          userId: user.id
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(acknowledgment))
      } else {
        // For guest users (first visit)
        localStorage.setItem('dvsubmit_guest_disclaimer', 'acknowledged')
      }
      
      setHasAcknowledged(true)
      setNeedsAcknowledgment(false)
    } catch (error) {
      console.error('Error acknowledging terms:', error)
      // Fallback to local storage only
      if (user) {
        const acknowledgment: LegalAcknowledgment = {
          version: CURRENT_TERMS_VERSION,
          acknowledgedAt: new Date().toISOString(),
          userId: user.id
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(acknowledgment))
        setHasAcknowledged(true)
        setNeedsAcknowledgment(false)
      }
    }
  }

  // Force re-acknowledgment (for terms updates)
  const requireReacknowledgment = () => {
    localStorage.removeItem(STORAGE_KEY)
    setHasAcknowledged(false)
    setNeedsAcknowledgment(true)
  }

  // Check if user needs to acknowledge terms for specific actions
  const needsAcknowledgmentFor = (action: 'registration' | 'payment' | 'submission') => {
    if (!user) return true // Always require acknowledgment for non-authenticated users
    
    switch (action) {
      case 'registration':
        return !hasAcknowledged
      case 'payment':
        return !hasAcknowledged
      case 'submission':
        return !hasAcknowledged
      default:
        return !hasAcknowledged
    }
  }

  return {
    hasAcknowledged,
    needsAcknowledgment,
    isLoading,
    acknowledgeTerms,
    requireReacknowledgment,
    needsAcknowledgmentFor,
    currentVersion: CURRENT_TERMS_VERSION
  }
}