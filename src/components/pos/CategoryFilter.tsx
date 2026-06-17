'use client'

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

/**
 * CategoryFilter Component (Client Component)
 * 
 * Dropdown selector for filtering products by category
 * 
 * Requirements: 6.1 - Display products organized by category
 */
export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="w-full md:w-64 mb-4">
      <label htmlFor="category-select" className="sr-only">
        Filter Kategori
      </label>
      <div className="relative">
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface text-sm font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'Semua' ? 'Semua Kategori' : category}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className="material-symbols-outlined text-on-surface-variant">
            expand_more
          </span>
        </div>
      </div>
    </div>
  )
}
