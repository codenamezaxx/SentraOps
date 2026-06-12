import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;
}

/**
 * UI Store for managing sidebar and UI preferences
 * Validates: Requirement 13.4 (Desktop sidebar navigation)
 * State management strategy as per design document
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar state for desktop navigation (Requirement 13.4)
      sidebarOpen: true,

      // Toggle sidebar open/closed state
      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),

      // Explicitly set sidebar state
      setSidebarOpen: (open: boolean) =>
        set(() => ({
          sidebarOpen: open,
        })),

      // Track mobile viewport state
      isMobile: false,

      // Update mobile state based on viewport
      setIsMobile: (mobile: boolean) =>
        set(() => ({
          isMobile: mobile,
        })),
    }),
    {
      name: 'sentraops-ui-storage', // localStorage key
      partialize: (state) => ({
        // Only persist sidebar preference, not mobile state
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
