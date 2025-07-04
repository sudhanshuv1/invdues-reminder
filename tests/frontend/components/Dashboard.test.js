// tests/frontend/components/Dashboard.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { vi } from 'vitest'

// Import from frontend
import Dashboard from '../../../frontend/src/pages/Dashboard'
import { apiSlice } from '../../../frontend/src/features/apiSlice'
import authReducer from '../../../frontend/src/features/authSlice'

// Mock the API hook
vi.mock('../../../frontend/src/features/apiSlice', () => ({
  apiSlice: {
    reducer: vi.fn(),
    middleware: vi.fn(() => []),
    reducerPath: 'api'
  },
  useGetInvoicesQuery: vi.fn(() => ({
    data: [
      {
        _id: '1',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        amount: 1000,
        dueDate: '2024-01-15',
        status: 'unpaid'
      }
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn()
  }))
}))

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: { id: '1', email: 'test@example.com' },
        accessToken: 'fake-token',
        isAuthenticated: true,
        ...initialState.auth
      }
    },
  })
}

const renderWithProviders = (component, initialState = {}) => {
  const store = createMockStore(initialState)
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  )
}

describe('Dashboard', () => {
  it('renders dashboard heading', () => {
    renderWithProviders(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('displays search input', () => {
    renderWithProviders(<Dashboard />)
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
  })

  it('displays filter buttons when invoices are loaded', async () => {
    renderWithProviders(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/All \(1\)/)).toBeInTheDocument()
      expect(screen.getByText(/Unpaid \(1\)/)).toBeInTheDocument()
    })
  })
})