import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import NotificationCenter from '../../pages/shared/NotificationCenter'

// Mock the API service
vi.mock('../../services/api', () => ({
  get: vi.fn(),
  put: vi.fn()
}))

const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('NotificationCenter', () => {
  let mockApi

  beforeEach(() => {
    mockApi = vi.hoisted(() => ({
      get: vi.fn(),
      put: vi.fn()
    }))

    // Mock notifications API response
    mockApi.get.mockImplementation((url) => {
      if (url.includes('/notifications')) {
        return Promise.resolve({
          data: {
            notifications: global.testHelpers.mockNotifications,
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              totalPages: 1
            }
          }
        })
      }
      return Promise.resolve({ data: {} })
    })

    mockApi.put.mockResolvedValue({ data: { success: true } })
  })

  it('should render notification center title', async () => {
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    expect(screen.getByText('Notification Center')).toBeInTheDocument()
  })

  it('should display notifications when loaded', async () => {
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('New Assignment')).toBeInTheDocument()
      expect(screen.getByText('Grade Posted')).toBeInTheDocument()
    })
  })

  it('should show loading state initially', () => {
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should filter notifications by type', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      const filterButton = screen.getByText(/filter/i)
      user.click(filterButton)
    })

    await waitFor(() => {
      const assignmentFilter = screen.getByText('Assignment')
      user.click(assignmentFilter)
    })

    // Verify API called with filter
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('type=assignment'))
  })

  it('should filter unread notifications', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      const unreadFilter = screen.getByText(/unread only/i)
      user.click(unreadFilter)
    })

    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('filter=unread'))
  })

  it('should mark notification as read when clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      const notification = screen.getByText('New Assignment')
      user.click(notification)
    })

    expect(mockApi.put).toHaveBeenCalledWith('/notifications/1/read')
  })

  it('should mark all notifications as read', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      const markAllButton = screen.getByText(/mark all as read/i)
      user.click(markAllButton)
    })

    expect(mockApi.put).toHaveBeenCalledWith('/notifications/mark-all-read')
  })

  it('should display notification badges correctly', async () => {
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      // Check for unread notification indicator
      const unreadIndicators = screen.getAllByTestId('unread-indicator')
      expect(unreadIndicators).toHaveLength(1) // Only one unread notification
    })
  })

  it('should show notification timestamps', async () => {
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      // Should display relative time (e.g., "2 hours ago")
      const timestamps = screen.getAllByText(/ago/)
      expect(timestamps.length).toBeGreaterThan(0)
    })
  })

  it('should handle pagination', async () => {
    const user = userEvent.setup()
    
    // Mock response with multiple pages
    mockApi.get.mockResolvedValueOnce({
      data: {
        notifications: global.testHelpers.mockNotifications,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3
        }
      }
    })

    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      const nextButton = screen.getByText(/next/i)
      user.click(nextButton)
    })

    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('page=2'))
  })

  it('should refresh notifications', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      user.click(refreshButton)
    })

    // Should call API again
    expect(mockApi.get).toHaveBeenCalledTimes(2)
  })

  it('should handle API errors gracefully', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('API Error'))

    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/error loading notifications/i)).toBeInTheDocument()
    })
  })

  it('should show empty state when no notifications', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        notifications: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }
    })

    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument()
    })
  })

  it('should search notifications', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search notifications/i)
      user.type(searchInput, 'assignment')
    })

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('search=assignment'))
    })
  })

  it('should group notifications by date', async () => {
    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    await waitFor(() => {
      // Should show date headers like "Today", "Yesterday"
      expect(screen.getByText(/today/i)).toBeInTheDocument()
    })
  })
})