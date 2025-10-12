import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
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

interface FormSelectFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  placeholder: string
  options: Array<{ value: string; label: string }>
  disabled?: boolean
  required?: boolean
}

/**
 * Reusable Select field component for forms
 */
export function FormSelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  disabled = false,
  required = false
}: FormSelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label} {required && '*'}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}