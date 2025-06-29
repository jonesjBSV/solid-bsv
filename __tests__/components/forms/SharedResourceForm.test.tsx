/**
 * SharedResourceForm Tests
 * Test the shared resource form component functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SharedResourceForm } from '@/components/forms/SharedResourceForm'
import type { SharedResourceFormData } from '@/components/forms/SharedResourceForm'

// Mock the form field components
jest.mock('@/components/forms/FormField', () => ({
  FormFields: {
    Select: ({ label, name, options, form }: any) => (
      <div>
        <label htmlFor={name}>{label}</label>
        <select
          id={name}
          {...form.register(name)}
          data-testid={`select-${name}`}
        >
          <option value="">Select...</option>
          {options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    ),
    Checkbox: ({ label, name, form }: any) => (
      <div>
        <label htmlFor={name}>
          <input
            id={name}
            type="checkbox"
            {...form.register(name)}
            data-testid={`checkbox-${name}`}
          />
          {label}
        </label>
      </div>
    ),
    Text: ({ label, name, type = 'text', form }: any) => (
      <div>
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          type={type}
          {...form.register(name)}
          data-testid={`input-${name}`}
        />
      </div>
    ),
    Textarea: ({ label, name, form }: any) => (
      <div>
        <label htmlFor={name}>{label}</label>
        <textarea
          id={name}
          {...form.register(name)}
          data-testid={`textarea-${name}`}
        />
      </div>
    )
  }
}))

describe('SharedResourceForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    availableResources: [
      { id: 1, resource_path: '/notes/test1' },
      { id: 2, resource_path: '/docs/test2' }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders create form correctly', () => {
    render(<SharedResourceForm {...defaultProps} mode="create" />)

    expect(screen.getByText('Share Resource')).toBeInTheDocument()
    expect(screen.getByTestId('select-resource_id')).toBeInTheDocument()
    expect(screen.getByTestId('checkbox-shared_with_public')).toBeInTheDocument()
    expect(screen.getByTestId('checkbox-requires_payment')).toBeInTheDocument()
  })

  it('renders edit form correctly', () => {
    const initialData = {
      resource_id: 1,
      shared_with_public: true,
      requires_payment: false,
      description: 'Test description'
    }

    render(
      <SharedResourceForm
        {...defaultProps}
        mode="edit"
        initialData={initialData}
      />
    )

    expect(screen.getByText('Edit Shared Resource')).toBeInTheDocument()
  })

  it('shows payment fields when requires_payment is checked', async () => {
    const user = userEvent.setup()
    render(<SharedResourceForm {...defaultProps} />)

    const requiresPaymentCheckbox = screen.getByTestId('checkbox-requires_payment')
    
    // Initially payment fields should not be visible
    expect(screen.queryByTestId('input-price_per_access')).not.toBeInTheDocument()

    // Check requires payment
    await user.click(requiresPaymentCheckbox)

    // Payment fields should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('input-price_per_access')).toBeInTheDocument()
      expect(screen.getByTestId('select-price_currency')).toBeInTheDocument()
    })
  })

  it('hides shared_with_user_id field when shared_with_public is checked', async () => {
    const user = userEvent.setup()
    render(<SharedResourceForm {...defaultProps} />)

    const sharedWithPublicCheckbox = screen.getByTestId('checkbox-shared_with_public')
    
    // Initially user ID field should be visible
    expect(screen.getByTestId('input-shared_with_user_id')).toBeInTheDocument()

    // Check shared with public
    await user.click(sharedWithPublicCheckbox)

    // User ID field should now be hidden
    await waitFor(() => {
      expect(screen.queryByTestId('input-shared_with_user_id')).not.toBeInTheDocument()
    })
  })

  it('submits form with correct data transformation', async () => {
    const user = userEvent.setup()
    render(<SharedResourceForm {...defaultProps} />)

    // Fill out the form
    const resourceSelect = screen.getByTestId('select-resource_id')
    const sharedWithPublicCheckbox = screen.getByTestId('checkbox-shared_with_public')
    const requiresPaymentCheckbox = screen.getByTestId('checkbox-requires_payment')
    const descriptionTextarea = screen.getByTestId('textarea-description')

    await user.selectOptions(resourceSelect, '1')
    await user.click(sharedWithPublicCheckbox)
    await user.click(requiresPaymentCheckbox)
    await user.type(descriptionTextarea, 'Test description')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /share resource/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          resource_id: 1, // Should be converted from string to number
          shared_with_public: true,
          requires_payment: true,
          description: 'Test description'
        })
      )
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<SharedResourceForm {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('disables form when loading', () => {
    render(<SharedResourceForm {...defaultProps} isLoading={true} />)

    const submitButton = screen.getByRole('button', { name: /share resource/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })

    expect(submitButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('handles empty string values correctly', async () => {
    const user = userEvent.setup()
    render(<SharedResourceForm {...defaultProps} />)

    // Submit form with empty values
    const submitButton = screen.getByRole('button', { name: /share resource/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          resource_id: '', // Empty string should remain as empty string
          shared_with_user_id: undefined, // Empty string should become undefined
          description: undefined // Empty string should become undefined
        })
      )
    })
  })
})