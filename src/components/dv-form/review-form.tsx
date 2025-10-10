'use client'

import { FormStepData } from '@/lib/types/application'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Edit, AlertTriangle } from 'lucide-react'
import { validateFormCompletion, getStepValidationStatus } from '@/lib/utils/form-validation'

interface ReviewFormProps {
  formData: FormStepData
  onSubmit: () => void
  onEdit: (step: string) => void
  onPrevious: () => void
  isLoading?: boolean
  hasValidationErrors?: boolean
}

export function ReviewForm({ 
  formData, 
  onSubmit, 
  onEdit, 
  onPrevious, 
  isLoading = false,
  hasValidationErrors = false
}: ReviewFormProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const validation = validateFormCompletion(formData)
  const stepValidation = getStepValidationStatus(formData)
  const isFormComplete = validation.isValid

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review Your Application</h2>
        <p className="text-gray-600 mt-2">
          Please review all information carefully before submitting your DV lottery application.
        </p>
      </div>

      {!isFormComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-800">Incomplete Application</h3>
            <p className="text-yellow-700 text-sm mt-1">
              Please complete all required sections before submitting your application.
            </p>
            {validation.missingFields.length > 0 && (
              <div className="mt-2">
                <p className="text-yellow-700 text-sm font-medium">Missing fields:</p>
                <ul className="text-yellow-700 text-sm list-disc list-inside mt-1">
                  {validation.missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              {stepValidation.personal ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              Personal Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit('personal')}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">First Name</span>
                <p className="text-gray-900">{formData.personal?.firstName || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Last Name</span>
                <p className="text-gray-900">{formData.personal?.lastName || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Date of Birth</span>
              <p className="text-gray-900">
                {formData.personal?.dateOfBirth ? formatDate(formData.personal.dateOfBirth) : 'Not provided'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Country of Birth</span>
                <p className="text-gray-900">{formData.personal?.countryOfBirth || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Country of Eligibility</span>
                <p className="text-gray-900">{formData.personal?.countryOfEligibility || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              {stepValidation.contact ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              Contact Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit('contact')}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="text-gray-900">{formData.contact?.email || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Phone</span>
                <p className="text-gray-900">{formData.contact?.phone || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Address</span>
              <div className="text-gray-900">
                {formData.contact?.address ? (
                  <>
                    <p>{formData.contact.address.street}</p>
                    <p>{formData.contact.address.city}, {formData.contact.address.state} {formData.contact.address.postalCode}</p>
                    <p>{formData.contact.address.country}</p>
                  </>
                ) : (
                  <p>Not provided</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education & Work */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              {stepValidation.education ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              Education & Occupation
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit('education')}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Education Level</span>
              <p className="text-gray-900">
                {formData.education?.education ? 
                  formData.education.education.charAt(0).toUpperCase() + formData.education.education.slice(1) : 
                  'Not provided'
                }
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Occupation</span>
              <p className="text-gray-900">{formData.education?.occupation || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Photo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              {stepValidation.photo ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              Photo
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit('photo')}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.photo ? (
              <div className="flex items-center gap-4">
                <img
                  src={formData.photo.preview}
                  alt="Uploaded photo"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <div>
                  <p className="text-gray-900 font-medium">{formData.photo.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(formData.photo.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <p className="text-sm text-green-600">✓ Photo meets DV requirements</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-900">Not provided</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Important Legal Disclaimer</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• This is NOT a government service. We are a private company providing assistance with DV lottery applications.</p>
          <p>• Submission of this application does NOT guarantee selection in the DV lottery.</p>
          <p>• The U.S. Department of State makes all final decisions regarding DV lottery selection.</p>
          <p>• By submitting this application, you acknowledge that you understand these terms.</p>
        </div>
      </div>

      {/* Submission Controls */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          disabled={isLoading}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-4">
          {hasValidationErrors && (
            <p className="text-sm text-red-600">Please fix validation errors before submitting</p>
          )}
          <Button 
            onClick={onSubmit}
            disabled={isLoading || !isFormComplete || hasValidationErrors}
            className="min-w-40"
            size="lg"
          >
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </div>
  )
}