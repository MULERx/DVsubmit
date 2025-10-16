'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactInfoSchema } from '@/lib/validations/application'
import { ContactInfo } from '@/lib/types/application'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

interface ContactInfoFormProps {
  initialData?: Partial<ContactInfo>
  onSubmit: (data: ContactInfo) => void
  onNext: () => void
  onPrevious: () => void
  isLoading?: boolean
}

export function ContactInfoForm({
  initialData,
  onSubmit,
  onNext,
  onPrevious,
  isLoading = false
}: ContactInfoFormProps) {
  const form = useForm<ContactInfo>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
    },
    mode: 'onChange', // Enable real-time validation
  })

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        phoneNumber: initialData.phoneNumber || '',
        email: initialData.email || '',
      })
    }
  }, [initialData, form])

  const handleSubmit = (data: ContactInfo) => {
    onSubmit(data)
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
        <p className="text-gray-600 mt-2">
          Please provide your contact information for correspondence.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number (include country code) *</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="e.g., +251 900-000-000"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
            >
              Previous
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
              className="min-w-32"
            >
              {isLoading ? 'Saving...' : 'Next Step'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}