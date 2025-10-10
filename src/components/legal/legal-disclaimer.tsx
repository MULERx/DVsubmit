'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Shield, Info } from 'lucide-react'

interface LegalDisclaimerProps {
  variant?: 'full' | 'compact' | 'banner'
  showAcknowledgment?: boolean
  onAcknowledge?: (acknowledged: boolean) => void
  className?: string
}

export function LegalDisclaimer({ 
  variant = 'full',
  showAcknowledgment = false,
  onAcknowledge,
  className = ''
}: LegalDisclaimerProps) {
  const [acknowledged, setAcknowledged] = useState(false)

  const handleAcknowledge = () => {
    setAcknowledged(true)
    onAcknowledge?.(true)
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800">Important Notice</h3>
            <p className="text-yellow-700 text-sm mt-1">
              This is not a government service. Selection in the DV lottery is not guaranteed.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 space-y-2">
            <p>• This is NOT a government service. We are a private company providing DV lottery assistance.</p>
            <p>• Submission does NOT guarantee selection in the DV lottery.</p>
            <p>• The U.S. Department of State makes all final selection decisions.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <Shield className="h-5 w-5" />
          Legal Disclaimer & Terms of Service
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Government Non-Affiliation */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Not a Government Service</h3>
          <div className="text-sm text-red-700 space-y-2">
            <p>
              <strong>IMPORTANT:</strong> DVSubmit is a private company and is NOT affiliated with, 
              endorsed by, or connected to the U.S. Department of State, U.S. Government, or any 
              government agency.
            </p>
            <p>
              We provide assistance services for DV lottery applications but we are not a government entity.
            </p>
          </div>
        </div>

        {/* Selection Not Guaranteed */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">No Guarantee of Selection</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>
              Submission of your DV lottery application through our service does NOT guarantee 
              selection in the Diversity Visa lottery program.
            </p>
            <p>
              The U.S. Department of State conducts a random selection process, and selection 
              is based solely on chance and eligibility requirements set by the U.S. Government.
            </p>
            <p>
              We cannot influence, predict, or guarantee the outcome of your application.
            </p>
          </div>
        </div>

        {/* Service Terms */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Terms of Service</h3>
          <div className="text-sm text-gray-700 space-y-3">
            <div>
              <h4 className="font-medium text-gray-800">Service Description</h4>
              <p>
                We provide assistance with completing and submitting DV lottery applications. 
                Our service includes form completion assistance, photo validation, and submission 
                to the official U.S. DV lottery system on your behalf.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800">Fees</h4>
              <p>
                Our service fee is 399 ETB, payable via Telebirr. This fee is for our assistance 
                services only and is separate from any government fees. Service fees are 
                non-refundable once your application has been submitted to the DV system.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800">Data Privacy</h4>
              <p>
                We collect and process your personal information solely for the purpose of 
                assisting with your DV lottery application. Your data is protected and will 
                be automatically deleted according to our retention policies after the DV cycle ends.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800">Accuracy Responsibility</h4>
              <p>
                You are responsible for providing accurate and truthful information. Any false 
                or misleading information may result in disqualification from the DV lottery 
                by the U.S. Department of State.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800">Limitation of Liability</h4>
              <p>
                Our liability is limited to the service fee paid. We are not responsible for 
                any consequences resulting from DV lottery outcomes, application processing 
                delays, or technical issues beyond our control.
              </p>
            </div>
          </div>
        </div>

        {/* Final Warnings */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Important Reminders</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>• Only apply if you meet all DV lottery eligibility requirements</p>
            <p>• Ensure all information provided is accurate and complete</p>
            <p>• Keep your confirmation number safe for future reference</p>
            <p>• Check official DV lottery results only on the U.S. Department of State website</p>
            <p>• Beware of scams claiming to guarantee DV lottery selection</p>
          </div>
        </div>

        {showAcknowledgment && (
          <div className="border-t pt-6">
            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                id="legal-acknowledgment"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="legal-acknowledgment" className="text-sm text-gray-700 cursor-pointer">
                I have read and understand the above legal disclaimer and terms of service. 
                I acknowledge that this is not a government service and that selection in 
                the DV lottery is not guaranteed.
              </label>
            </div>
            
            <Button 
              onClick={handleAcknowledge}
              disabled={!acknowledged}
              className="w-full"
            >
              I Acknowledge and Agree
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}