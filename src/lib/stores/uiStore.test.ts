import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUIStore } from './uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useUIStore());
    act(() => {
      result.current.setSidebarOpen(true);
      result.current.setIsMobile(false);
    });
  });

  describe('Sidebar State Management', () => {
    it('initializes with sidebar open by default', () => {
      const { result } = renderHook(() => useUIStore());
      expect(result.current.sidebarOpen).toBe(true);
    });

    it('toggles sidebar from open to closed', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.toggleSidebar();
      });
      
      expect(result.current.sidebarOpen).toBe(false);
    });

    it('toggles sidebar from closed to open', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setSidebarOpen(false);
      });
      
      expect(result.current.sidebarOpen).toBe(false);
      
      act(() => {
        result.current.toggleSidebar();
      });
      
      expect(result.current.sidebarOpen).toBe(true);
    });

    it('explicitly sets sidebar to open', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setSidebarOpen(false);
      });
      
      expect(result.current.sidebarOpen).toBe(false);
      
      act(() => {
        result.current.setSidebarOpen(true);
      });
      
      expect(result.current.sidebarOpen).toBe(true);
    });

    it('explicitly sets sidebar to closed', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setSidebarOpen(false);
      });
      
      expect(result.current.sidebarOpen).toBe(false);
    });

    it('toggles sidebar multiple times correctly', () => {
      const { result } = renderHook(() => useUIStore());
      
      const initialState = result.current.sidebarOpen;
      
      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.sidebarOpen).toBe(!initialState);
      
      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.sidebarOpen).toBe(initialState);
      
      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.sidebarOpen).toBe(!initialState);
    });
  });

  describe('Mobile State Management', () => {
    it('initializes with isMobile as false', () => {
      const { result } = renderHook(() => useUIStore());
      expect(result.current.isMobile).toBe(false);
    });

    it('sets mobile state to true', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setIsMobile(true);
      });
      
      expect(result.current.isMobile).toBe(true);
    });

    it('sets mobile state to false', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setIsMobile(true);
      });
      
      expect(result.current.isMobile).toBe(true);
      
      act(() => {
        result.current.setIsMobile(false);
      });
      
      expect(result.current.isMobile).toBe(false);
    });

    it('updates mobile state independently of sidebar state', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setSidebarOpen(false);
        result.current.setIsMobile(true);
      });
      
      expect(result.current.sidebarOpen).toBe(false);
      expect(result.current.isMobile).toBe(true);
      
      act(() => {
        result.current.setSidebarOpen(true);
      });
      
      expect(result.current.sidebarOpen).toBe(true);
      expect(result.current.isMobile).toBe(true);
    });
  });

  describe('State Persistence', () => {
    it('maintains state consistency across multiple operations', () => {
      const { result } = renderHook(() => useUIStore());
      
      // Perform multiple operations
      act(() => {
        result.current.toggleSidebar(); // closed
        result.current.setIsMobile(true);
        result.current.toggleSidebar(); // open
        result.current.setIsMobile(false);
        result.current.setSidebarOpen(false);
      });
      
      expect(result.current.sidebarOpen).toBe(false);
      expect(result.current.isMobile).toBe(false);
    });
  });

  describe('Requirement Validation', () => {
    it('validates Requirement 13.4: Desktop sidebar navigation support', () => {
      const { result } = renderHook(() => useUIStore());
      
      // Sidebar should be controllable for desktop layouts
      expect(typeof result.current.sidebarOpen).toBe('boolean');
      expect(typeof result.current.toggleSidebar).toBe('function');
      expect(typeof result.current.setSidebarOpen).toBe('function');
    });

    it('supports responsive behavior with mobile state tracking', () => {
      const { result } = renderHook(() => useUIStore());
      
      // Store should track mobile viewport state (Requirement 13.1, 13.2)
      expect(typeof result.current.isMobile).toBe('boolean');
      expect(typeof result.current.setIsMobile).toBe('function');
    });
  });
});
