'use client'

/**
 * Reusable Form Field Component
 * Integrates react-hook-form with shadcn/ui components and zod validation
 */

import React from 'react'
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface BaseFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>
  name: FieldPath<T>
  label?: string
  description?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

// Text Input Field
interface TextFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  type?: 'text' | 'email' | 'password' | 'url' | 'number'
}

export function TextField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  type = 'text'
}: TextFieldProps<T>) {
  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Textarea Field
interface TextareaFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  rows?: number
  maxLength?: number
}

export function TextareaField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  rows = 4,
  maxLength
}: TextareaFieldProps<T>) {
  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          {maxLength && (
            <FormDescription>
              {field.value?.length || 0} / {maxLength} characters
            </FormDescription>
          )}
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Select Field
interface SelectFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  options: Array<{ value: string; label: string }>
}

export function SelectField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  options
}: SelectFieldProps<T>) {
  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
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
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Checkbox Field
interface CheckboxFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  checkboxLabel?: string
}

export function CheckboxField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  disabled = false,
  checkboxLabel
}: CheckboxFieldProps<T>) {
  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {(label || checkboxLabel) && (
              <FormLabel>
                {label || checkboxLabel}
              </FormLabel>
            )}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Tags Field (for arrays of strings)
interface TagsFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  maxTags?: number
  tagValidator?: (tag: string) => string | null // Return error message or null
}

export function TagsField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
  maxTags = 20,
  tagValidator
}: TagsFieldProps<T>) {
  const [inputValue, setInputValue] = React.useState('')

  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const tags: string[] = field.value || []

        const addTag = (tag: string) => {
          const trimmedTag = tag.trim()
          if (!trimmedTag) return

          // Validate tag
          if (tagValidator) {
            const error = tagValidator(trimmedTag)
            if (error) {
              // You could show an error toast here
              console.error('Tag validation error:', error)
              return
            }
          }

          if (tags.includes(trimmedTag)) return
          if (tags.length >= maxTags) return

          const newTags = [...tags, trimmedTag]
          field.onChange(newTags)
          setInputValue('')
        }

        const removeTag = (tagToRemove: string) => {
          const newTags = tags.filter(tag => tag !== tagToRemove)
          field.onChange(newTags)
        }

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTag(inputValue)
          }
        }

        return (
          <FormItem>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div className="space-y-2">
                <Input
                  placeholder={placeholder}
                  disabled={disabled}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => addTag(inputValue)}
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {tag}
                        {!disabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-auto p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            {description && (
              <FormDescription>
                {description}
                {maxTags && ` (${tags.length}/${maxTags} tags)`}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// File Upload Field (basic implementation)
interface FileFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
}

export function FileField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  disabled = false,
  required = false,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024 // 10MB default
}: FileFieldProps<T>) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field: { onChange, value, ...field } }) => {
        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const files = e.target.files
          if (!files) return

          // Validate file size
          for (const file of Array.from(files)) {
            if (file.size > maxSize) {
              console.error(`File ${file.name} is too large. Max size: ${maxSize / 1024 / 1024}MB`)
              return
            }
          }

          if (multiple) {
            onChange(Array.from(files))
          } else {
            onChange(files[0] || null)
          }
        }

        return (
          <FormItem>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <Input
                {...field}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// Export all field types
export const FormFields = {
  Text: TextField,
  Textarea: TextareaField,
  Select: SelectField,
  Checkbox: CheckboxField,
  Tags: TagsField,
  File: FileField
}