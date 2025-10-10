'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { educationWorkSchema } from '@/lib/validations/application'
import { EducationWork } from '@/lib/types/application'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

interface EducationWorkFormProps {
  initialData?: Partial<EducationWork>
  onSubmit: (data: EducationWork) => void
  onNext: () => void
  onPrevious: () => void
  isLoading?: boolean
}

const educationLevels = [
  { value: 'primary', label: 'Primary School Only' },
  { value: 'secondary', label: 'High School Diploma' },
  { value: 'vocational', label: 'Vocational/Technical Training' },
  { value: 'university', label: 'University Degree (Bachelor\'s)' },
  { value: 'graduate', label: 'Graduate Degree (Master\'s/PhD)' },
]

export function EducationWorkForm({ 
  initialData, 
  onSubmit, 
  onNext, 
  onPrevious, 
  isLoading = false 
}: EducationWorkFormProps) {
  const form = useForm<EducationWork>({
    resolver: zodResolver(educationWorkSchema),
    defaultValues: {
      education: initialData?.education || undefined,
      occupation: initialData?.occupation || '',
    },
  })

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.education || data.occupation) {
        const validData = educationWorkSchema.safeParse(data)
        if (validData.success) {
          onSubmit(validData.data)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onSubmit])

  const handleSubmit = (data: EducationWork) => {
    onSubmit(data)
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Education & Occupation</h2>
        <p className="text-gray-600 mt-2">
          Please provide information about your education and current occupation.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Highest Level of Education *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your highest level of education" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the highest level of education you have completed. This must match your supporting documents.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Occupation *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your current occupation or job title" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Provide your current job title or occupation. If unemployed, enter "Unemployed" or "Student" as appropriate.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You must have at least a high school education OR two years of work experience in an occupation requiring at least two years of training or experience.</li>
              <li>• Your education and work experience will be verified during the visa interview process.</li>
              <li>• Ensure all information matches your supporting documents exactly.</li>
            </ul>
          </div>

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