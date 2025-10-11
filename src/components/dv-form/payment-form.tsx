'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Payment } from '@/lib/types/application'
import { paymentSchema } from '@/lib/validations/application'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface PaymentFormProps {
  initialData?: Payment
  onSubmit: (data: Payment) => void
  onNext: () => void
  onPrevious?: () => void
  isLoading?: boolean
  paymentStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REFUNDED'
}

export function PaymentForm({
  initialData,
  onSubmit,
  onNext,
  onPrevious,
  isLoading = false,
  paymentStatus = 'PENDING'
}: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<Payment>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData || {
      paymentReference: '',
    },
  })

  const handleSubmit = async (data: Payment) => {
    setIsSubmitting(true)
    try {
      onSubmit(data)
      // Don't automatically go to next step - wait for payment verification
    } catch (error) {
      console.error('Payment submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'VERIFIED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'REJECTED':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'VERIFIED':
        return {
          title: 'Payment Verified',
          description: 'Your payment has been verified successfully. You can now proceed to review your application.',
          variant: 'success' as const
        }
      case 'REJECTED':
        return {
          title: 'Payment Rejected',
          description: 'Your payment could not be verified. Please check your payment reference and try again.',
          variant: 'error' as const
        }
      default:
        return {
          title: 'Payment Pending Verification',
          description: 'Your payment reference has been submitted and is pending admin verification.',
          variant: 'warning' as const
        }
    }
  }

  const statusMessage = getStatusMessage()
  const canProceed = paymentStatus === 'VERIFIED'
  const canModify = paymentStatus !== 'VERIFIED'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
        <p className="text-gray-600 mt-2">
          Complete payment for the DV submission service using Telebirr.
        </p>
      </div>

      {/* Payment Status Card */}
      {initialData?.paymentReference && (
        <Card className={`border-l-4 ${
          statusMessage.variant === 'success' ? 'border-l-green-500 bg-green-50' :
          statusMessage.variant === 'error' ? 'border-l-red-500 bg-red-50' :
          'border-l-yellow-500 bg-yellow-50'
        }`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getStatusIcon()}
              {statusMessage.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {statusMessage.description}
            </CardDescription>
          </CardHeader>
          {initialData.paymentReference && (
            <CardContent className="pt-0">
              <div className="text-sm">
                <span className="font-medium">Payment Reference:</span> {initialData.paymentReference}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Pre-Payment Legal Disclaimer */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-orange-800 mb-2">Important: Before Payment</h3>
            <div className="text-orange-700 text-sm space-y-2">
              <p>Please confirm before proceeding with payment:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>This is NOT a government service - we are a private company</li>
                <li>Selection in the DV lottery is NOT guaranteed</li>
                <li>The 399 ETB service fee is non-refundable after submission</li>
                <li>All your information is accurate and complete</li>
              </ul>
              <p className="font-medium">
                By proceeding with payment, you acknowledge these terms and our 
                <a href="/terms" target="_blank" className="underline ml-1">Terms of Service</a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Fee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Service Fee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>DV Submission Service</span>
              <span className="text-2xl text-blue-600">399 ETB</span>
            </div>
            <div className="text-sm text-gray-600">
              This fee covers professional DV lottery form completion, photo validation, 
              and official submission to the U.S. State Department on your behalf.
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 text-sm font-medium">
                ⚠️ Non-refundable: This fee cannot be refunded once your application is submitted to the DV system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Telebirr Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Instructions</CardTitle>
          <CardDescription>
            Follow these steps to complete your payment via Telebirr
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Open Telebirr App</p>
                  <p className="text-sm text-gray-600">Launch the Telebirr mobile application on your phone</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Send Money</p>
                  <p className="text-sm text-gray-600">
                    Send <strong>399 ETB</strong> to merchant account: <strong>DVSubmit Service</strong>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Get Transaction Reference</p>
                  <p className="text-sm text-gray-600">
                    After successful payment, you'll receive a transaction reference number
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <p className="font-medium">Enter Reference Below</p>
                  <p className="text-sm text-gray-600">
                    Copy and paste the transaction reference in the form below
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Reference Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Reference</CardTitle>
          <CardDescription>
            Enter your Telebirr transaction reference number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="paymentReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Reference</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your Telebirr transaction reference"
                        disabled={isLoading || isSubmitting || !canModify}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      The reference should be 10-50 characters long and contain only uppercase letters and numbers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {canModify && (
                <Button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Payment Reference'}
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        {onPrevious ? (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isLoading || isSubmitting}
          >
            Previous
          </Button>
        ) : (
          <div></div>
        )}
        
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isLoading}
        >
          {canProceed ? 'Complete Application' : 'Waiting for Payment Verification'}
        </Button>
      </div>
    </div>
  )
}