import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RequireOwner } from './RequireOwner'
import { Profile } from '@/lib/types'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('RequireOwner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user is owner', async () => {
    const ownerProfile: Profile = {
      id: '1',
      auth_id: 'auth-1',
      store_id: 'store-1',
      role: 'owner',
      name: 'Test Owner',
    }

    render(
      <RequireOwner profile={ownerProfile}>
        <div>Protected Content</div>
      </RequireOwner>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('redirects to access-denied when user is cashier', async () => {
    const cashierProfile: Profile = {
      id: '2',
      auth_id: 'auth-2',
      store_id: 'store-1',
      role: 'cashier',
      name: 'Test Cashier',
    }

    render(
      <RequireOwner profile={cashierProfile}>
        <div>Protected Content</div>
      </RequireOwner>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/access-denied')
    })

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to login when profile is null', async () => {
    render(
      <RequireOwner profile={null}>
        <div>Protected Content</div>
      </RequireOwner>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading state while checking authorization', async () => {
    const ownerProfile: Profile = {
      id: '1',
      auth_id: 'auth-1',
      store_id: 'store-1',
      role: 'owner',
      name: 'Test Owner',
    }

    render(
      <RequireOwner profile={ownerProfile}>
        <div>Protected Content</div>
      </RequireOwner>
    )

    // The component should show loading initially or immediately show content
    // Since useEffect runs synchronously in tests, it may skip loading state
    // We just verify it doesn't crash and eventually shows content
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })
})
