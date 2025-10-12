import { useState, useCallback, useEffect, useRef } from 'react'
import { FormStep, FormStepData, ApplicationRecord } from '@/lib/types/application'
import { transformApplicationToFormData, createPhotoData } from '@/lib/utils/form-data-transformer'
import { usePhotoUrls } from './use-photo-urls'

/**
 * Custom hook for managing form data state and initialization
 */
export const useFormData = (existingApplication?: ApplicationRecord | null) => {
  const [formData, setFormData] = useState<Partial<FormStepData>>({})
  const { getSignedUrl } = usePhotoUrls()
  const signedUrlsFetched = useRef(false)

  /**
   * Initialize form data with existing application data and fetch signed URLs
   */
  useEffect(() => {
    if (existingApplication && !signedUrlsFetched.current) {
      console.log('Initializing form with existing application:', existingApplication)

      const transformedData = transformApplicationToFormData(existingApplication)

      // Add photo data if available
      if (existingApplication.photoUrl) {
        transformedData.photo = createPhotoData(existingApplication.photoUrl)
      }

      if (existingApplication.spousePhotoUrl) {
        transformedData.spousePhoto = createPhotoData(existingApplication.spousePhotoUrl)
      }

      // Add children photos if available
      if (existingApplication.children && existingApplication.children.length > 0) {
        const childrenPhotos: { [childIndex: number]: { file: File; preview: string; path?: string; signedUrl?: string } } = {}
        existingApplication.children.forEach((child, index) => {
          if (child.photoUrl) {
            childrenPhotos[index] = createPhotoData(child.photoUrl)
          }
        })
        if (Object.keys(childrenPhotos).length > 0) {
          transformedData.childrenPhotos = childrenPhotos
        }
      }

      console.log('Transformed form data:', transformedData)
      console.log('Setting formData.personal:', transformedData.personal)
      setFormData(transformedData)

      // Fetch signed URLs asynchronously after setting initial data
      const fetchSignedUrls = async () => {
        const updates: Partial<FormStepData> = {}

        // Fetch signed URL for main photo
        if (existingApplication.photoUrl && transformedData.photo?.path) {
          const signedUrl = await getSignedUrl(existingApplication.photoUrl)
          if (signedUrl) {
            updates.photo = {
              ...transformedData.photo,
              signedUrl,
              preview: signedUrl
            }
          }
        }

        // Fetch signed URL for spouse photo
        if (existingApplication.spousePhotoUrl && transformedData.spousePhoto?.path) {
          const signedUrl = await getSignedUrl(existingApplication.spousePhotoUrl)
          if (signedUrl) {
            updates.spousePhoto = {
              ...transformedData.spousePhoto,
              signedUrl,
              preview: signedUrl
            }
          }
        }

        // Fetch signed URLs for children photos
        if (existingApplication.children && transformedData.childrenPhotos) {
          const childrenPhotosUpdates: { [childIndex: number]: { file: File; preview: string; path?: string; signedUrl?: string } } = {}
          
          for (let index = 0; index < existingApplication.children.length; index++) {
            const child = existingApplication.children[index]
            if (child.photoUrl && transformedData.childrenPhotos[index]) {
              const signedUrl = await getSignedUrl(child.photoUrl)
              if (signedUrl) {
                childrenPhotosUpdates[index] = {
                  ...transformedData.childrenPhotos[index],
                  signedUrl,
                  preview: signedUrl
                }
              }
            }
          }
          
          if (Object.keys(childrenPhotosUpdates).length > 0) {
            updates.childrenPhotos = childrenPhotosUpdates
          }
        }

        // Update form data with signed URLs
        if (Object.keys(updates).length > 0) {
          setFormData(prev => ({
            ...prev,
            ...updates
          }))
        }
      }

      // Mark as fetched to prevent re-running
      signedUrlsFetched.current = true

      // Fetch signed URLs if we have photo paths
      const hasChildrenPhotos = existingApplication.children?.some(child => child.photoUrl)
      if (existingApplication.photoUrl || existingApplication.spousePhotoUrl || hasChildrenPhotos) {
        fetchSignedUrls()
      }
    }
  }, [existingApplication, getSignedUrl])

  /**
   * Reset signed URLs fetched flag when existing application changes
   */
  useEffect(() => {
    signedUrlsFetched.current = false
  }, [existingApplication?.id])

  /**
   * Update a specific step's data
   */
  const updateStepData = useCallback((step: FormStep, data: unknown) => {
    console.log(`Updating step ${step} with data:`, data)
    setFormData(prev => {
      const updated = {
        ...prev,
        [step]: data
      }
      console.log('Updated form data:', updated)
      return updated
    })
  }, [])

  /**
   * Reset form data
   */
  const resetFormData = useCallback(() => {
    setFormData({})
    signedUrlsFetched.current = false
  }, [])

  return {
    formData,
    setFormData,
    updateStepData,
    resetFormData
  }
}