import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserButton } from '../UserButton'
import { AuthContext } from '../../contexts/AuthContext'
import { AppContext } from '../../context/AppContext'

// Mock the contexts
const mockAuthContextValue = {
  user: null,
  session: null,
  loading: false,
  signOut: jest.fn(),
  forceRefresh: jest.fn(),
}

const mockAppContextValue = {
  state: {
    user: null,
    cart: { items: [], total: 0 },
    loading: false,
  },
  dispatch: jest.fn(),
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
  updateQuantity: jest.fn(),
}

const renderWithProviders = (component: React.ReactElement, authValue = mockAuthContextValue, appValue = mockAppContextValue) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <AppContext.Provider value={appValue}>
        {component}
      </AppContext.Provider>
    </AuthContext.Provider>
  )
}

describe('UserButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login button when user is not authenticated', () => {
    renderWithProviders(<UserButton />)
    
    expect(screen.getByText(/connexion/i)).toBeInTheDocument()
  })

  it('should render user menu when user is authenticated', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    }

    const authValueWithUser = {
      ...mockAuthContextValue,
      user: mockUser,
      loading: false,
    }

    renderWithProviders(<UserButton />, authValueWithUser)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    const authValueLoading = {
      ...mockAuthContextValue,
      loading: true,
    }

    renderWithProviders(<UserButton />, authValueLoading)
    
    expect(screen.getByTestId('user-button-loading')).toBeInTheDocument()
  })

  it('should call signOut when logout is clicked', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    }

    const mockSignOut = jest.fn()
    const authValueWithUser = {
      ...mockAuthContextValue,
      user: mockUser,
      signOut: mockSignOut,
    }

    renderWithProviders(<UserButton />, authValueWithUser)
    
    // Click on user menu to open dropdown
    fireEvent.click(screen.getByText('Test User'))
    
    // Click on logout option
    const logoutButton = screen.getByText(/déconnexion/i)
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  it('should handle user without full_name gracefully', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {}
    }

    const authValueWithUser = {
      ...mockAuthContextValue,
      user: mockUser,
    }

    renderWithProviders(<UserButton />, authValueWithUser)
    
    // Should fallback to email or default text
    expect(screen.getByText(/test@example.com|compte/i)).toBeInTheDocument()
  })
})
