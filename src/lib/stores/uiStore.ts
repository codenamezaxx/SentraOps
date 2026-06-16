import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
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
      // Sidebar visibility state (primarily for mobile drawer)
      sidebarOpen: true,

      // Toggle sidebar visibility
      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),

      // Explicitly set sidebar visibility
      setSidebarOpen: (open: boolean) =>
        set(() => ({
          sidebarOpen: open,
        })),

      // Sidebar collapse state for desktop
      isSidebarCollapsed: false,

      // Toggle sidebar collapse
      toggleSidebarCollapsed: () =>
        set((state) => ({
          isSidebarCollapsed: !state.isSidebarCollapsed,
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
        // Persist sidebar preferences
        sidebarOpen: state.sidebarOpen,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
