/**
 * ContextEntryForm Tests
 * Test the context entry form component functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContextEntryForm, validateContextEntryForm } from '@/components/forms/ContextEntryForm'

// Mock the form field components
jest.mock('@/components/forms/FormField', () => ({
  FormFields: {
    Text: ({ label, name, form, required }: any) => (
      <div>
        <label htmlFor={name}>{label} {required && '*'}</label>
        <input
          id={name}
          {...form.register(name)}
          data-testid={`input-${name}`}
        />
      </div>
    ),
    Select: ({ label, name, options, form, required }: any) => (
      <div>
        <label htmlFor={name}>{label} {required && '*'}</label>
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
    Textarea: ({ label, name, form, required }: any) => (
      <div>
        <label htmlFor={name}>{label} {required && '*'}</label>
        <textarea
          id={name}
          {...form.register(name)}
          data-testid={`textarea-${name}`}
        />
      </div>
    ),
    Tags: ({ label, name, form }: any) => (
      <div>
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          placeholder="Type tags..."
          data-testid={`tags-${name}`}
        />
      </div>
    )
  }
}))

describe('ContextEntryForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    availablePodResources: [
      { id: 1, resource_path: '/notes/resource1' },
      { id: 2, resource_path: '/docs/resource2' }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders create form correctly', () => {
    render(<ContextEntryForm {...defaultProps} mode="create" />)

    expect(screen.getByText('Add Context Entry')).toBeInTheDocument()
    expect(screen.getByTestId('input-title')).toBeInTheDocument()
    expect(screen.getByTestId('textarea-content')).toBeInTheDocument()
    expect(screen.getByTestId('select-content_type')).toBeInTheDocument()
    expect(screen.getByTestId('tags-tags')).toBeInTheDocument()
  })

  it('renders edit form correctly', () => {
    const initialData = {
      title: 'Test Entry',
      content: 'Test content',
      content_type: 'markdown',
      tags: ['test', 'example']
    }

    render(
      <ContextEntryForm
        {...defaultProps}
        mode="edit"
        initialData={initialData}
      />
    )

    expect(screen.getByText('Edit Context Entry')).toBeInTheDocument()
  })

  it('shows pod resource linking when available', () => {
    render(<ContextEntryForm {...defaultProps} />)

    expect(screen.getByTestId('select-pod_resource_id')).toBeInTheDocument()
    expect(screen.getByText('Linked Pod Resource')).toBeInTheDocument()
  })

  it('hides pod resource linking when no resources available', () => {
    render(<ContextEntryForm {...defaultProps} availablePodResources={[]} />)

    expect(screen.queryByTestId('select-pod_resource_id')).not.toBeInTheDocument()
  })

  it('submits form with correct data', async () => {
    const user = userEvent.setup()
    render(<ContextEntryForm {...defaultProps} />)

    // Fill out the form
    await user.type(screen.getByTestId('input-title'), 'Test Entry')
    await user.type(screen.getByTestId('textarea-content'), 'This is test content')
    await user.selectOptions(screen.getByTestId('select-content_type'), 'markdown')
    await user.selectOptions(screen.getByTestId('select-pod_resource_id'), '1')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create entry/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Entry',
          content: 'This is test content',
          content_type: 'markdown',
          pod_resource_id: 1 // Should be converted from string to number
        })
      )
    })
  })

  it('converts empty pod_resource_id to undefined', async () => {
    const user = userEvent.setup()
    render(<ContextEntryForm {...defaultProps} />)

    await user.type(screen.getByTestId('input-title'), 'Test Entry')
    await user.type(screen.getByTestId('textarea-content'), 'Test content')

    const submitButton = screen.getByRole('button', { name: /create entry/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          pod_resource_id: undefined // Empty string should become undefined
        })
      )
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<ContextEntryForm {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('disables form when loading', () => {
    render(<ContextEntryForm {...defaultProps} isLoading={true} />)

    const submitButton = screen.getByRole('button', { name: /create entry/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })

    expect(submitButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('resets form after successful create', async () => {
    const user = userEvent.setup()
    render(<ContextEntryForm {...defaultProps} mode="create" />)

    // Fill out and submit form
    await user.type(screen.getByTestId('input-title'), 'Test Entry')
    await user.type(screen.getByTestId('textarea-content'), 'Test content')

    const submitButton = screen.getByRole('button', { name: /create entry/i })
    await user.click(submitButton)

    // Form should reset after successful submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })
})

describe('validateContextEntryForm', () => {
  it('validates correct form data', () => {
    const validData = {
      title: 'Test Entry',
      content: 'This is test content',
      content_type: 'text'
    }

    expect(validateContextEntryForm(validData)).toBe(true)
  })

  it('rejects invalid form data', () => {
    const invalidData = {
      title: '', // Required field empty
      content: 'Content without title'
    }

    expect(validateContextEntryForm(invalidData)).toBe(false)
  })

  it('rejects data with invalid content type', () => {
    const invalidData = {
      title: 'Test',
      content: 'Content',
      content_type: 'invalid-type' // Not in allowed enum
    }

    expect(validateContextEntryForm(invalidData)).toBe(false)
  })
})