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
    <section className="w-full overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex gap-3 pb-2 w-max">
        {categories.map((category) => {
          const isActive = selectedCategory === category

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-6 py-2 rounded-full font-semibold text-sm whitespace-nowrap shadow-sm 
                active:scale-95 transition-all
                ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest dark:bg-inverse-surface text-on-surface-variant dark:text-surface-variant border border-outline-variant dark:border-none hover:bg-surface-container-low'
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
