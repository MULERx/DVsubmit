'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { educationSchema } from '@/lib/validations/application'
import { Education } from '@/lib/types/application'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface EducationFormProps {
  initialData?: Partial<Education>
  onSubmit: (data: Education) => void
  onNext: () => void
  onPrevious: () => void
  isLoading?: boolean
}

const educationLevels = [
  { value: 'PRIMARY_SCHOOL_ONLY', label: 'Primary school only' },
  { value: 'SOME_HIGH_SCHOOL_NO_DIPLOMA', label: 'Some high school, no diploma' },
  { value: 'HIGH_SCHOOL_DIPLOMA', label: 'High school diploma' },
  { value: 'VOCATIONAL_SCHOOL', label: 'Vocational school' },
  { value: 'SOME_UNIVERSITY_COURSES', label: 'Some university courses' },
  { value: 'UNIVERSITY_DEGREE', label: 'University degree' },
  { value: 'SOME_GRADUATE_LEVEL_COURSES', label: 'Some graduate-level courses' },
  { value: 'MASTER_DEGREE', label: 'Master\'s degree' },
  { value: 'SOME_DOCTORAL_LEVEL_COURSES', label: 'Some doctoral-level courses' },
  { value: 'DOCTORATE', label: 'Doctorate' },
]

export function EducationForm({ 
  initialData, 
  onSubmit, 
  onNext, 
  onPrevious, 
  isLoading = false 
}: EducationFormProps) {
  const form = useForm<Education>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      educationLevel: initialData?.educationLevel || undefined,
    },
  })

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        educationLevel: initialData.educationLevel || undefined,
      })
    }
  }, [initialData, form])

  const handleSubmit = (data: Education) => {
    onSubmit(data)
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Education</h2>
        <p className="text-gray-600 mt-2">
          Please select your highest level of education achieved.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="educationLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Highest level of education achieved *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your highest education level" />
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