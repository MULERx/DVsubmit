'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormStepData } from '@/lib/types/application'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Check, Edit, AlertTriangle, CreditCard } from 'lucide-react'
import { validateFormCompletion, getStepValidationStatus } from '@/lib/utils/form-validation'

// Transaction number validation schema
const transactionSchema = z.object({
  transactionNumber: z.string()
    .min(10, 'Transaction number must be at least 10 characters')
    .max(50, 'Transaction number must be less than 50 characters')
    .regex(/^[A-Z0-9]+$/, 'Transaction number must contain only uppercase letters and numbers'),
})

interface ReviewFormProps {
  formData: FormStepData
  onSubmit: (transactionNumber: string) => void
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<{ transactionNumber: string }>({
    resolver: zodResolver(transactionSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      transactionNumber: '',
    },
  })

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

  const isTransactionValid = form.formState.isValid

  const handleSubmit = async (data: { transactionNumber: string }) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data.transactionNumber)
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Family Name</span>
                <p className="text-gray-900">{formData.personal?.familyName || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Given Name</span>
                <p className="text-gray-900">{formData.personal?.givenName || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Middle Name</span>
                <p className="text-gray-900">{formData.personal?.middleName || 'Not provided'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Gender</span>
                <p className="text-gray-900">{formData.personal?.gender || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Date of Birth</span>
                <p className="text-gray-900">
                  {formData.personal?.dateOfBirth ? formatDate(formData.personal.dateOfBirth) : 'Not provided'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">City of Birth</span>
                <p className="text-gray-900">{formData.personal?.cityOfBirth || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Country of Birth</span>
                <p className="text-gray-900">{formData.personal?.countryOfBirth || 'Not provided'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Country of Eligibility</span>
                <p className="text-gray-900">{formData.personal?.countryOfEligibility || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Eligibility Claim Type</span>
                <p className="text-gray-900">{formData.personal?.eligibilityClaimType || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mailing Address */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              {stepValidation.address ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              Mailing Address
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit('address')}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.address?.inCareOf && (
              <div>
                <span className="text-sm font-medium text-gray-500">In Care Of</span>
                <p className="text-gray-900">{formData.address.inCareOf}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-500">Address</span>
              <div className="text-gray-900">
                <p>{formData.address?.addressLine1 || 'Not provided'}</p>
                {formData.address?.addressLine2 && <p>{formData.address.addressLine2}</p>}
                <p>{formData.address?.city || 'Not provided'}, {formData.address?.stateProvince || 'Not provided'} {formData.address?.postalCode || 'Not provided'}</p>
                <p>{formData.address?.country || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Country of Residence</span>
              <p className="text-gray-900">{formData.address?.countryOfResidence || 'Not provided'}</p>
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
                <span className="text-sm font-medium text-gray-500">Phone Number</span>
                <p className="text-gray-900">{formData.contact?.phoneNumber || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              {stepValidation.education ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              Education
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
                {formData.education?.educationLevel ?
                  formData.education.educationLevel.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) :
                  'Not provided'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Marital Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              {stepValidation.marital ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              Marital Status
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit('marital')}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Marital Status</span>
              <p className="text-gray-900">
                {formData.marital?.maritalStatus ?
                  formData.marital.maritalStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) :
                  'Not provided'
                }
              </p>
            </div>
            {formData.marital?.maritalStatus === 'MARRIED_SPOUSE_NOT_US_CITIZEN_LPR' && (
              <div className="border-t pt-3">
                <h4 className="font-medium text-gray-900 mb-2">Spouse Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Spouse Name</span>
                    <p className="text-gray-900">
                      {formData.marital?.spouseGivenName && formData.marital?.spouseFamilyName
                        ? `${formData.marital.spouseGivenName} ${formData.marital.spouseFamilyName}`
                        : 'Not provided'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Spouse Gender</span>
                    <p className="text-gray-900">{formData.marital?.spouseGender || 'Not provided'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Spouse Date of Birth</span>
                    <p className="text-gray-900">
                      {formData.marital?.spouseDateOfBirth ? formatDate(formData.marital.spouseDateOfBirth) : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Spouse Country of Birth</span>
                    <p className="text-gray-900">{formData.marital?.spouseCountryOfBirth || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Children */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              {stepValidation.children ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              Children
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit('children')}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.children?.children && formData.children.children.length > 0 ? (
              <div className="space-y-4">
                {formData.children.children.map((child, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">Child {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Name</span>
                        <p className="text-gray-900">
                          {child.givenName && child.familyName
                            ? `${child.givenName} ${child.familyName}`
                            : 'Not provided'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Gender</span>
                        <p className="text-gray-900">{child.gender || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Date of Birth</span>
                        <p className="text-gray-900">
                          {child.dateOfBirth ? formatDate(child.dateOfBirth) : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Country of Birth</span>
                        <p className="text-gray-900">{child.countryOfBirth || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-900">No children listed</p>
            )}
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

      {/* Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment & Transaction Number
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Fee Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-blue-900">DV Submission Service Fee</span>
              <span className="text-2xl font-bold text-blue-600">399 ETB</span>
            </div>
            <p className="text-blue-700 text-sm">
              This fee covers professional DV lottery form completion, photo validation,
              and official submission to the U.S. State Department on your behalf.
            </p>
          </div>

          {/* Payment Instructions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Payment Instructions:</h4>
            <div className="grid gap-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <p className="text-sm">Open your Telebirr app and send <strong>399 ETB</strong> to merchant account: <strong>DVSubmit Service</strong></p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <p className="text-sm">After successful payment, copy the transaction reference number</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <p className="text-sm">Enter the transaction number below and submit your application</p>
              </div>
            </div>
          </div>

          {/* Transaction Number Form */}
          <Form {...form}>
            <FormField
              control={form.control}
              name="transactionNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telebirr Transaction Number *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your Telebirr transaction reference"
                      disabled={isLoading || isSubmitting}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    The transaction number should be 10-50 characters long and contain only uppercase letters and numbers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Enhanced Legal Disclaimer */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Final Legal Confirmation Required
        </h3>
        <div className="text-sm text-red-800 space-y-3">
          <div className="bg-white border border-red-200 rounded p-3">
            <h4 className="font-semibold mb-2">Government Non-Affiliation</h4>
            <p>This is NOT a government service. We are a private company providing assistance with DV lottery applications. We are not affiliated with the U.S. Department of State or any government agency.</p>
          </div>

          <div className="bg-white border border-red-200 rounded p-3">
            <h4 className="font-semibold mb-2">No Selection Guarantee</h4>
            <p>Submission of this application does NOT guarantee selection in the DV lottery. The U.S. Department of State makes all final decisions regarding DV lottery selection through a random process.</p>
          </div>

          <div className="bg-white border border-red-200 rounded p-3">
            <h4 className="font-semibold mb-2">Service Fee</h4>
            <p>The 399 ETB service fee is for our assistance services only and is non-refundable once your application is submitted to the official DV system.</p>
          </div>

          <div className="bg-white border border-red-200 rounded p-3">
            <h4 className="font-semibold mb-2">Your Responsibility</h4>
            <p>You confirm that all information provided is accurate and truthful. False information may result in disqualification by the U.S. Department of State.</p>
          </div>

          <p className="font-semibold text-center pt-2">
            By submitting this application, you acknowledge that you understand and agree to these terms.
          </p>
        </div>
      </div>

      {/* Submission Controls */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading || isSubmitting}
            >
              Previous
            </Button>

            <div className="flex items-center gap-4">
              {hasValidationErrors && (
                <p className="text-sm text-red-600">Please fix validation errors before submitting</p>
              )}
              {!isFormComplete && (
                <p className="text-sm text-red-600">Please complete all required sections</p>
              )}
              <Button
                type="submit"
                disabled={isLoading || isSubmitting || !isFormComplete || hasValidationErrors || !isTransactionValid}
                className="min-w-40"
                size="lg"
                title={!isTransactionValid ? 'Please enter a valid transaction number' : !isFormComplete ? 'Please complete all required sections' : ''}
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              </Button>


            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}