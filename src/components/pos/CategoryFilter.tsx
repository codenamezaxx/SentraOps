'use client'

import { useState } from 'react'

/**
 * CategoryFilter Component (Client Component)
 * 
 * Horizontal scrollable category chips for filtering products
 * Mobile-optimized with overflow scroll
 * 
 * Requirements: 6.1 - Display products organized by category
 */
export function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua')

  const categories = ['Semua', 'Makanan', 'Minuman', 'Snack']

  return (
    <section className="w-full overflow-x-auto no-scrollbar">
      <div className="flex gap-2 pb-2 w-max">
        {categories.map((category) => {
          const isActive = selectedCategory === category

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap shadow-sm 
                active:scale-95 transition-all
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-container-low text-on-surface-variant border border-outline-variant hover:bg-surface-container'
                }
              `}
            >
              {category}
            </button>
          )
        })}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
