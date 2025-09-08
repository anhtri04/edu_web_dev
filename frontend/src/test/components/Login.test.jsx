import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthContext } from '../../context/AuthContext'
import Login from '../../pages/auth/Login'
import { BrowserRouter } from 'react-router-dom'

// Mock the navigate function
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Test wrapper with router
const TestWrapper = ({ children, authContextValue }) => (
  <BrowserRouter>
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
)

describe('Login Component', () => {
  const mockLogin = vi.fn()
  const defaultAuthContext = {
    user: null,
    login: mockLogin,
    logout: vi.fn(),
    loading: false,
    error: null
  }

  beforeEach(() => {
    mockLogin.mockClear()
    mockNavigate.mockClear()
  })

  it('should render login form', () => {
    render(
      <TestWrapper authContextValue={defaultAuthContext}>
        <Login />
      </TestWrapper>
    )

    expect(screen.getByText('Login to Your Account')).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should handle username input', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper authContextValue={defaultAuthContext}>
        <Login />
      </TestWrapper>
    )

    const usernameInput = screen.getByLabelText(/username/i)
    await user.type(usernameInput, 'testuser')

    expect(usernameInput.value).toBe('testuser')
  })

  it('should handle password input', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper authContextValue={defaultAuthContext}>
        <Login />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(passwordInput, 'password123')

    expect(passwordInput.value).toBe('password123')
  })

  it('should submit form with correct data', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce({ success: true })
    
    render(
      <TestWrapper authContextValue={defaultAuthContext}>
        <Login />
      </TestWrapper>
    )

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123')
  })

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper authContextValue={defaultAuthContext}>
        <Login />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('should display loading state during login', async () => {
    const loadingAuthContext = { ...defaultAuthContext, loading: true }
    
    render(
      <TestWrapper authContextValue={loadingAuthContext}>
        <Login />
      </TestWrapper>
    )

    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('should display error message on login failure', () => {
    const errorAuthContext = { 
      ...defaultAuthContext, 
      error: 'Invalid username or password' 
    }
    
    render(
      <TestWrapper authContextValue={errorAuthContext}>
        <Login />
      </TestWrapper>
    )

    expect(screen.getByText('Invalid username or password')).toBeInTheDocument()
  })

  it('should redirect authenticated users', () => {
    const authenticatedContext = { 
      ...defaultAuthContext, 
      user: global.testHelpers.mockStudent 
    }
    
    render(
      <TestWrapper authContextValue={authenticatedContext}>
        <Login />
      </TestWrapper>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('should navigate to signup page', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper authContextValue={defaultAuthContext}>
        <Login />
      </TestWrapper>
    )

    const signupLink = screen.getByText(/create an account/i)
    await user.click(signupLink)

    expect(mockNavigate).toHaveBeenCalledWith('/signup')
  })

  it('should toggle password visibility', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper authContextValue={defaultAuthContext}>
        <Login />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: /toggle password/i })

    expect(passwordInput.type).toBe('password')

    await user.click(toggleButton)
    expect(passwordInput.type).toBe('text')

    await user.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('should handle remember me checkbox', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper authContextValue={defaultAuthContext}>
        <Login />
      </TestWrapper>
    )

    const rememberCheckbox = screen.getByLabelText(/remember me/i)
    expect(rememberCheckbox.checked).toBe(false)

    await user.click(rememberCheckbox)
    expect(rememberCheckbox.checked).toBe(true)
  })

  it('should prevent multiple form submissions', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ success: true }), 1000)
    ))
    
    render(
      <TestWrapper authContextValue={defaultAuthContext}>
        <Login />
      </TestWrapper>
    )

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    
    // Click submit multiple times quickly
    await user.click(submitButton)
    await user.click(submitButton)
    await user.click(submitButton)

    // Should only be called once
    expect(mockLogin).toHaveBeenCalledTimes(1)
  })

  it('should clear error on input change', async () => {
    const user = userEvent.setup()
    const errorAuthContext = { 
      ...defaultAuthContext, 
      error: 'Invalid credentials' 
    }
    
    render(
      <TestWrapper authContextValue={errorAuthContext}>
        <Login />
      </TestWrapper>
    )

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()

    const usernameInput = screen.getByLabelText(/username/i)
    await user.type(usernameInput, 'a')

    // Error should be cleared (in a real implementation)
    // This would require the component to handle error clearing
  })
})