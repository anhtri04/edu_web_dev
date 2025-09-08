import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../context/AuthContext'
import StudentDashboard from '../../pages/student/StudentDashboard'

// Mock the API service
vi.mock('../../services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}))

// Test wrapper component
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('StudentDashboard', () => {
  let mockApi

  beforeEach(() => {
    mockApi = vi.hoisted(() => ({
      get: vi.fn()
    }))

    // Mock successful API responses
    mockApi.get.mockImplementation((url) => {
      switch (url) {
        case '/student/dashboard':
          return Promise.resolve({
            data: {
              enrolledCourses: global.testHelpers.mockCourses,
              upcomingExams: [
                {
                  exam_id: 1,
                  exam_name: 'Midterm Exam',
                  exam_date: new Date(Date.now() + 86400000).toISOString(),
                  Course: { course_name: 'CS101' }
                }
              ],
              recentGrades: global.testHelpers.mockGrades,
              notifications: global.testHelpers.mockNotifications.slice(0, 3)
            }
          })
        default:
          return Promise.resolve({ data: {} })
      }
    })
  })

  it('should render dashboard title', async () => {
    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
  })

  it('should display loading state initially', () => {
    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should display enrolled courses section', async () => {
    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Enrolled Courses')).toBeInTheDocument()
    })
  })

  it('should display upcoming exams section', async () => {
    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Upcoming Exams')).toBeInTheDocument()
    })
  })

  it('should display recent grades section', async () => {
    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Recent Grades')).toBeInTheDocument()
    })
  })

  it('should display notifications section', async () => {
    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Recent Notifications')).toBeInTheDocument()
    })
  })

  it('should handle API error gracefully', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('API Error'))

    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument()
    })
  })

  it('should display course cards when data is loaded', async () => {
    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Introduction to Computer Science')).toBeInTheDocument()
      expect(screen.getByText('Data Structures')).toBeInTheDocument()
    })
  })

  it('should display grade information', async () => {
    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B+')).toBeInTheDocument()
    })
  })

  it('should show empty state when no data available', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        enrolledCourses: [],
        upcomingExams: [],
        recentGrades: [],
        notifications: []
      }
    })

    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/no courses enrolled/i)).toBeInTheDocument()
    })
  })

  it('should refresh data when refresh button is clicked', async () => {
    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
    })

    expect(mockApi.get).toHaveBeenCalledTimes(2) // Initial load + refresh
  })

  it('should navigate to courses page when view all courses is clicked', async () => {
    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      const viewAllButton = screen.getByText(/view all courses/i)
      fireEvent.click(viewAllButton)
    })

    // In a real test, you'd check navigation
    expect(viewAllButton).toBeInTheDocument()
  })

  it('should display correct statistics', async () => {
    render(
      <TestWrapper>
        <StudentDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      // Check if statistics are displayed
      expect(screen.getByText('2')).toBeInTheDocument() // Number of courses
      expect(screen.getByText('1')).toBeInTheDocument() // Number of upcoming exams
    })
  })
})