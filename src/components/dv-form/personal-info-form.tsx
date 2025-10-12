'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personalInfoSchema } from '@/lib/validations/application'
import { PersonalInfo } from '@/lib/types/application'
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
import { FormStepWrapper } from './form-step-wrapper'
import { FormSelectField } from './form-select-field'
import { GENDER_OPTIONS, COUNTRY_OPTIONS } from '@/lib/constants/form-options'

interface PersonalInfoFormProps {
  initialData?: Partial<PersonalInfo>
  onSubmit: (data: PersonalInfo) => void
  onNext: () => void
  isLoading?: boolean
}

export function PersonalInfoForm({
  initialData,
  onSubmit,
  onNext,
  isLoading = false
}: PersonalInfoFormProps) {
  const form = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onChange', // Enable validation on change
    defaultValues: {
      familyName: '',
      givenName: '',
      middleName: '',
      gender: undefined,
      dateOfBirth: '',
      cityOfBirth: '',
      countryOfBirth: '',
      countryOfEligibility: '',
      eligibilityClaimType: '',
    },
  })

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('PersonalInfoForm: Resetting form with initialData:', initialData)
      const resetData = {
        familyName: initialData.familyName || '',
        givenName: initialData.givenName || '',
        middleName: initialData.middleName || '',
        gender: initialData.gender || undefined,
        dateOfBirth: initialData.dateOfBirth || '',
        cityOfBirth: initialData.cityOfBirth || '',
        countryOfBirth: initialData.countryOfBirth || '',
        countryOfEligibility: initialData.countryOfEligibility || '',
        eligibilityClaimType: initialData.eligibilityClaimType || '',
      }
      console.log('PersonalInfoForm: Reset data:', resetData)
      
      // Use setTimeout to ensure the form reset happens after the component is fully rendered
      setTimeout(() => {
        form.reset(resetData)
      }, 0)
    }
  }, [initialData, form])

  const handleSubmit = (data: PersonalInfo) => {
    onSubmit(data)
    onNext()
  }

  return (
    <FormStepWrapper
      title="Personal Information"
      description="Please provide your personal information exactly as it appears on your passport."
    >

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="familyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family / Last Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your family/last name"
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
              name="givenName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Given / First Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your given/first name"
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
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your middle name (optional)"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelectField
              control={form.control}
              name="gender"
              label="Gender"
              placeholder="Select gender"
              options={GENDER_OPTIONS}
              disabled={isLoading}
              required
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth (Day/Month/Year) *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      disabled={isLoading}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="cityOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City / Town of Birth *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your city/town of birth"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSelectField
              control={form.control}
              name="countryOfBirth"
              label="Country of Birth"
              placeholder="Select country of birth"
              options={COUNTRY_OPTIONS}
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelectField
              control={form.control}
              name="countryOfEligibility"
              label="Country of Eligibility (Chargeability) for DV"
              placeholder="Select country of eligibility"
              options={COUNTRY_OPTIONS}
              disabled={isLoading}
              required
            />

            <FormField
              control={form.control}
              name="eligibilityClaimType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>If claiming spouse's or parent's country, indicate which</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 'spouse' or 'parent' (optional)"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
              className="min-w-32"
              title={!form.formState.isValid ? 'Please fill all required fields correctly' : ''}
            >
              {isLoading ? 'Saving...' : 'Next Step'}
            </Button>
          </div>


        </form>
      </Form>
    </FormStepWrapper>
  )
}