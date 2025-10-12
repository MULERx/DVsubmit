'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { mailingAddressSchema } from '@/lib/validations/application'
import { MailingAddress } from '@/lib/types/application'
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
import { useEffect } from 'react'

interface MailingAddressFormProps {
  initialData?: Partial<MailingAddress>
  onSubmit: (data: MailingAddress) => void
  onNext: () => void
  onPrevious: () => void
  isLoading?: boolean
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

export function MailingAddressForm({ 
  initialData, 
  onSubmit, 
  onNext, 
  onPrevious,
  isLoading = false 
}: MailingAddressFormProps) {
  const form = useForm<MailingAddress>({
    resolver: zodResolver(mailingAddressSchema),
    defaultValues: {
      inCareOf: initialData?.inCareOf || '',
      addressLine1: initialData?.addressLine1 || '',
      addressLine2: initialData?.addressLine2 || '',
      city: initialData?.city || '',
      stateProvince: initialData?.stateProvince || '',
      postalCode: initialData?.postalCode || '',
      country: initialData?.country || '',
      countryOfResidence: initialData?.countryOfResidence || '',
    },
  })

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        inCareOf: initialData.inCareOf || '',
        addressLine1: initialData.addressLine1 || '',
        addressLine2: initialData.addressLine2 || '',
        city: initialData.city || '',
        stateProvince: initialData.stateProvince || '',
        postalCode: initialData.postalCode || '',
        country: initialData.country || '',
        countryOfResidence: initialData.countryOfResidence || '',
      })
    }
  }, [initialData, form])

  const handleSubmit = (data: MailingAddress) => {
    onSubmit(data)
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mailing Address</h2>
        <p className="text-gray-600 mt-2">
          Please provide your current mailing address where you can receive correspondence.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="inCareOf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>In care of (optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter name if mail should be sent in care of someone else" 
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
            name="addressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1 *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your street address" 
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
            name="addressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2 (optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Apartment, suite, unit, building, floor, etc." 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City / Town *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your city/town" 
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
              name="stateProvince"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District / Province / State *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your state/province/district" 
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
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal / ZIP Code *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your postal/ZIP code" 
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
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
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

          <FormField
            control={form.control}
            name="countryOfResidence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country where you live today *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country where you currently live" />
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