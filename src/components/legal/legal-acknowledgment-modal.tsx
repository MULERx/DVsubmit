'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, AlertTriangle, Shield } from 'lucide-react'

interface LegalAcknowledgmentModalProps {
  isOpen: boolean
  onClose: () => void
  onAcknowledge: () => void
  title?: string
  variant?: 'first-visit' | 'registration' | 'pre-payment' | 'terms-update'
}

export function LegalAcknowledgmentModal({
  isOpen,
  onClose,
  onAcknowledge,
  title,
  variant = 'first-visit'
}: LegalAcknowledgmentModalProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [termsAcknowledged, setTermsAcknowledged] = useState(false)

  // Reset acknowledgment state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAcknowledged(false)
      setTermsAcknowledged(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const getModalContent = () => {
    switch (variant) {
      case 'first-visit':
        return {
          title: 'Welcome to DVSubmit',
          subtitle: 'Important Legal Information',
          content: (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800">Not a Government Service</h3>
                    <p className="text-red-700 text-sm mt-1">
                      DVSubmit is a private company. We are NOT affiliated with the U.S. Government 
                      or Department of State.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">No Selection Guarantee</h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      Using our service does NOT guarantee selection in the DV lottery. 
                      Selection is determined by the U.S. Department of State.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-700">
                <p>
                  We provide assistance with DV lottery applications for a service fee of 399 ETB. 
                  By continuing, you acknowledge that you understand these important disclaimers.
                </p>
              </div>
            </div>
          )
        }
      
      case 'registration':
        return {
          title: 'Terms and Conditions',
          subtitle: 'Please review and accept our terms',
          content: (
            <div className="space-y-4">
              <div className="text-sm text-gray-700 space-y-3">
                <p>By creating an account, you agree to the following:</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-800 mb-2">Service Agreement</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• This is a private service, not affiliated with any government</li>
                    <li>• Service fee is 399 ETB, non-refundable after submission</li>
                    <li>• You will provide accurate and truthful information</li>
                    <li>• Selection in DV lottery is not guaranteed</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-800 mb-2">Data Privacy</h4>
                  <p className="text-gray-700 text-sm">
                    Your personal information will be used solely for DV lottery application 
                    purposes and will be automatically deleted after the DV cycle ends.
                  </p>
                </div>
              </div>
            </div>
          )
        }
      
      case 'pre-payment':
        return {
          title: 'Final Confirmation',
          subtitle: 'Before proceeding with payment',
          content: (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">Final Reminder</h3>
                <div className="text-orange-700 text-sm space-y-2">
                  <p>Before paying the 399 ETB service fee, please confirm:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>You understand this is NOT a government service</li>
                    <li>Selection in the DV lottery is NOT guaranteed</li>
                    <li>The service fee is non-refundable after submission</li>
                    <li>All your information is accurate and complete</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-sm text-gray-700">
                <p>
                  Once you proceed with payment, your application will be submitted to the 
                  official DV lottery system on your behalf.
                </p>
              </div>
            </div>
          )
        }
      
      case 'terms-update':
        return {
          title: 'Updated Terms and Conditions',
          subtitle: 'Our terms have been updated',
          content: (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Terms Updated</h3>
                <p className="text-blue-700 text-sm">
                  We have updated our terms of service and legal disclaimers. Please review 
                  and acknowledge the updated terms to continue using our service.
                </p>
              </div>
              
              <div className="text-sm text-gray-700">
                <p>
                  The core principles remain the same: we are not a government service, 
                  selection is not guaranteed, and we provide assistance services for a fee.
                </p>
              </div>
            </div>
          )
        }
      
      default:
        return {
          title: 'Legal Acknowledgment',
          subtitle: 'Please review the following information',
          content: <div>Default content</div>
        }
    }
  }

  const modalContent = getModalContent()
  const requiresBothAcknowledgments = variant === 'registration' || variant === 'terms-update'

  const handleAcknowledge = () => {
    if (requiresBothAcknowledgments && (!acknowledged || !termsAcknowledged)) {
      return
    }
    if (!requiresBothAcknowledgments && !acknowledged) {
      return
    }
    
    onAcknowledge()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">{title || modalContent.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{modalContent.subtitle}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {modalContent.content}
          
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="legal-disclaimer-acknowledgment"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="legal-disclaimer-acknowledgment" className="text-sm text-gray-700 cursor-pointer">
                I have read and understand that this is not a government service and that 
                selection in the DV lottery is not guaranteed.
              </label>
            </div>
            
            {requiresBothAcknowledgments && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms-acknowledgment"
                  checked={termsAcknowledged}
                  onChange={(e) => setTermsAcknowledged(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="terms-acknowledgment" className="text-sm text-gray-700 cursor-pointer">
                  I agree to the terms of service and privacy policy.
                </label>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleAcknowledge}
                disabled={requiresBothAcknowledgments ? (!acknowledged || !termsAcknowledged) : !acknowledged}
              >
                I Acknowledge and Continue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}