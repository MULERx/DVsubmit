'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { maritalStatusSchema } from '@/lib/validations/application'
import { MaritalStatusInfo } from '@/lib/types/application'
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

interface MaritalStatusFormProps {
  initialData?: Partial<MaritalStatusInfo>
  onSubmit: (data: MaritalStatusInfo & { spousePhoto?: { file: File; preview: string; path?: string; signedUrl?: string } }) => void
  onNext: () => void
  onPrevious: () => void
  isLoading?: boolean
  applicationId?: string
  initialSpousePhoto?: { file: File; preview: string; path?: string; signedUrl?: string }
}

const maritalStatuses = [
  { value: 'UNMARRIED', label: 'Unmarried' },
  { value: 'MARRIED_SPOUSE_NOT_US_CITIZEN_LPR', label: 'Married — my spouse is NOT a U.S. citizen or U.S. LPR' },
  { value: 'MARRIED_SPOUSE_IS_US_CITIZEN_LPR', label: 'Married — my spouse IS a U.S. citizen or U.S. LPR' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
  { value: 'LEGALLY_SEPARATED', label: 'Legally separated' },
]

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

export function MaritalStatusForm({ 
  initialData, 
  onSubmit, 
  onNext, 
  onPrevious, 
  isLoading = false,
  applicationId,
  initialSpousePhoto
}: MaritalStatusFormProps) {
  const [spousePhoto, setSpousePhoto] = useState<{ file: File; preview: string; path?: string; signedUrl?: string } | null>(
    initialSpousePhoto || null
  )

  const form = useForm<MaritalStatusInfo>({
    resolver: zodResolver(maritalStatusSchema),
    defaultValues: {
      maritalStatus: initialData?.maritalStatus || undefined,
      spouseFamilyName: initialData?.spouseFamilyName || '',
      spouseGivenName: initialData?.spouseGivenName || '',
      spouseMiddleName: initialData?.spouseMiddleName || '',
      spouseGender: initialData?.spouseGender || undefined,
      spouseDateOfBirth: initialData?.spouseDateOfBirth || '',
      spouseCityOfBirth: initialData?.spouseCityOfBirth || '',
      spouseCountryOfBirth: initialData?.spouseCountryOfBirth || '',
    },
  })

  const maritalStatus = form.watch('maritalStatus')
  const showSpouseDetails = maritalStatus === 'MARRIED_SPOUSE_NOT_US_CITIZEN_LPR'

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        maritalStatus: initialData.maritalStatus || undefined,
        spouseFamilyName: initialData.spouseFamilyName || '',
        spouseGivenName: initialData.spouseGivenName || '',
        spouseMiddleName: initialData.spouseMiddleName || '',
        spouseGender: initialData.spouseGender || undefined,
        spouseDateOfBirth: initialData.spouseDateOfBirth || '',
        spouseCityOfBirth: initialData.spouseCityOfBirth || '',
        spouseCountryOfBirth: initialData.spouseCountryOfBirth || '',
      })
    }
  }, [initialData, form])

  const handleSubmit = (data: MaritalStatusInfo) => {
    const submitData = { ...data }
    if (showSpouseDetails && spousePhoto) {
      onSubmit({ ...submitData, spousePhoto })
    } else {
      onSubmit(submitData)
    }
    onNext()
  }

  const handleSpousePhotoChange = (photoData: { file: File; preview: string; path?: string; signedUrl?: string } | null) => {
    setSpousePhoto(photoData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Marital Status</h2>
        <p className="text-gray-600 mt-2">
          Please provide your current marital status and spouse details if applicable.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="maritalStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current marital status *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your marital status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {maritalStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {showSpouseDetails && (
            <div className="space-y-6 border-t pt-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Spouse Details</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Required when married to someone who is NOT a U.S. citizen or U.S. LPR
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="spouseFamilyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Family / Last Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter spouse's family/last name" 
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
                  name="spouseGivenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Given / First Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter spouse's given/first name" 
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
                  name="spouseMiddleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Middle Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter spouse's middle name (optional)" 
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
                <FormField
                  control={form.control}
                  name="spouseGender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Gender *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select spouse's gender" />
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
                  name="spouseDateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Date of Birth *</FormLabel>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="spouseCityOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse City / Town of Birth *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter spouse's city/town of birth" 
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
                  name="spouseCountryOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Country of Birth *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select spouse's country of birth" />
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

              {/* Spouse Photo Upload */}
              <div className="mt-6">
                <PersonalPhotoUpload
                  onPhotoChange={handleSpousePhotoChange}
                  initialData={initialSpousePhoto}
                  applicationId={applicationId}
                  label="Spouse Photo"
                  description="Upload a recent passport-style photo of your spouse that meets DV lottery requirements."
                  required={true}
                  disabled={isLoading}
                />
              </div>
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