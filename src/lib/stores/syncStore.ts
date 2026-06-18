import { create } from 'zustand'

interface SyncState {
  productVersion: number
  bumpProductVersion: () => void
}

export const useSyncStore = create<SyncState>((set) => ({
  productVersion: 0,
  bumpProductVersion: () => set((state) => ({ productVersion: state.productVersion + 1 })),
}))
