'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { childrenSchema } from '@/lib/validations/application'
import { Children } from '@/lib/types/application'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { PersonalPhotoUpload } from './personal-photo-upload'
import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface ChildrenFormProps {
  initialData?: Partial<Children>
  onSubmit: (data: Children & { childrenPhotos?: { [childIndex: number]: { file: File; preview: string; path?: string; signedUrl?: string } } }) => void
  onNext: () => void
  onPrevious: () => void
  isLoading?: boolean
  applicationId?: string
  initialChildrenPhotos?: { [childIndex: number]: { file: File; preview: string; path?: string; signedUrl?: string } }
}

// Common countries
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas',
  'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize',
  'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
  'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China',
  'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba',
  'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
  'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
  'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia',
  'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali',
  'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
  'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay',
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
  'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
  'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka',
  'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
]

export function ChildrenForm({ 
  initialData, 
  onSubmit, 
  onNext, 
  onPrevious, 
  isLoading = false,
  applicationId,
  initialChildrenPhotos
}: ChildrenFormProps) {
  const [childrenPhotos, setChildrenPhotos] = useState<{ [childIndex: number]: { file: File; preview: string; path?: string; signedUrl?: string } }>(
    initialChildrenPhotos || {}
  )

  // Debug logging
  useEffect(() => {
    console.log('ChildrenForm - initialChildrenPhotos:', initialChildrenPhotos)
    console.log('ChildrenForm - childrenPhotos state:', childrenPhotos)
  }, [initialChildrenPhotos, childrenPhotos])

  const form = useForm<Children>({
    resolver: zodResolver(childrenSchema),
    defaultValues: {
      children: initialData?.children || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'children',
  })

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        children: initialData.children || [],
      })
    }
  }, [initialData, form])

  // Update children photos when initialChildrenPhotos changes
  useEffect(() => {
    if (initialChildrenPhotos && Object.keys(initialChildrenPhotos).length > 0) {
      console.log('Updating childrenPhotos state with:', initialChildrenPhotos)
      setChildrenPhotos(initialChildrenPhotos)
    }
  }, [initialChildrenPhotos])

  const handleSubmit = (data: Children) => {
    const submitData = { ...data }
    if (Object.keys(childrenPhotos).length > 0) {
      onSubmit({ ...submitData, childrenPhotos })
    } else {
      onSubmit(submitData)
    }
    onNext()
  }

  const handleChildPhotoChange = (childIndex: number, photoData: { file: File; preview: string; path?: string; signedUrl?: string } | null) => {
    setChildrenPhotos(prev => {
      const updated = { ...prev }
      if (photoData) {
        updated[childIndex] = photoData
      } else {
        delete updated[childIndex]
      }
      return updated
    })
  }

  const addChild = () => {
    append({
      familyName: '',
      givenName: '',
      middleName: '',
      gender: 'MALE',
      dateOfBirth: '',
      cityOfBirth: '',
      countryOfBirth: '',
    })
  }

  const removeChild = (index: number) => {
    remove(index)
    // Also remove the photo for this child
    setChildrenPhotos(prev => {
      const updated = { ...prev }
      delete updated[index]
      // Reindex remaining photos
      const reindexed: typeof updated = {}
      Object.keys(updated).forEach(key => {
        const oldIndex = parseInt(key)
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = updated[oldIndex]
        } else {
          reindexed[oldIndex] = updated[oldIndex]
        }
      })
      return reindexed
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Children</h2>
        <p className="text-gray-600 mt-2">
          List ALL living, unmarried children under 21 at time of entry (include natural, adopted, step-children).
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {fields.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">No children added yet</p>
              <Button type="button" onClick={addChild} disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Add Child
              </Button>
            </div>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-6 space-y-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Child {index + 1}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeChild(index)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={`children.${index}.familyName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family / Last Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter child's family/last name" 
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
                  name={`children.${index}.givenName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Given / First Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter child's given/first name" 
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
                  name={`children.${index}.middleName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter child's middle name (optional)" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`children.${index}.gender`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select child's gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`children.${index}.dateOfBirth`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`children.${index}.cityOfBirth`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City / Town of Birth *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter child's city/town of birth" 
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
                  name={`children.${index}.countryOfBirth`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country of Birth *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select child's country of birth" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Child Photo Upload */}
              <div className="mt-4">
                <PersonalPhotoUpload
                  onPhotoChange={(photoData) => handleChildPhotoChange(index, photoData)}
                  initialData={childrenPhotos[index]}
                  applicationId={applicationId}
                  label={`Child ${index + 1} Photo`}
                  description="Upload a recent passport-style photo of this child that meets DV lottery requirements."
                  required={true}
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}

          {fields.length > 0 && fields.length < 10 && (
            <div className="text-center">
              <Button type="button" variant="outline" onClick={addChild} disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Add Another Child
              </Button>
            </div>
          )}

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
              disabled={isLoading}
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