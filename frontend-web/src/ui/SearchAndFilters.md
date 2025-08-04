# SearchAndFilters Component Usage Guide

The `SearchAndFilters` component is a reusable UI component located in `src/ui/SearchAndFilters.tsx` that provides consistent search, filtering, sorting, and view mode functionality across different pages.

## Features

- **Search**: Text input with search icon
- **Filtering**: Dropdown filter with customizable options
- **Sorting**: Dropdown sort with customizable options
- **View Toggle**: Grid/List view mode toggle
- **Results Counter**: Shows filtered vs total results
- **Responsive Design**: Mobile-friendly layout
- **Consistent Styling**: Matches app's emerald theme

## Props Interface

```typescript
interface SearchAndFiltersProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;

  // Filters
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: string;

  // Sort
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;

  // View mode
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  showViewToggle?: boolean;

  // Results
  totalResults: number;
  filteredResults: number;
  resultsLabel?: string;

  // Styling
  className?: string;
}
```

## Usage Examples

### 1. PartnerBikesPage (Current Implementation)

```tsx
import { SearchAndFilters } from "../ui";

// In component:
<SearchAndFilters
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Search bikes..."
  filterOptions={bikeTypes.map((type) => ({ value: type, label: type }))}
  filterValue={filterType}
  onFilterChange={setFilterType}
  filterLabel="All Types"
  sortOptions={[
    { value: "name", label: "Sort by Name" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Rating" },
  ]}
  sortValue={sortBy}
  onSortChange={(value) =>
    setSortBy(value as "name" | "price-low" | "price-high" | "rating")
  }
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  showViewToggle={true}
  totalResults={bikes.length}
  filteredResults={filteredAndSortedBikes.length}
  resultsLabel="bikes"
  className="mb-8"
/>;
```

### 2. Potential LocationsPage Usage

```tsx
import { SearchAndFilters } from "../ui";

// Replace the existing LocationsPage SearchAndFilters with:
<SearchAndFilters
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Search locations..."
  filterOptions={[
    { value: "city", label: "City" },
    { value: "suburb", label: "Suburb" },
    { value: "tourist", label: "Tourist Area" },
  ]}
  filterValue={locationType}
  onFilterChange={setLocationType}
  filterLabel="All Areas"
  sortOptions={[
    { value: "name", label: "Name" },
    { value: "popularity", label: "Popularity" },
    { value: "bikes-count", label: "Most Bikes" },
  ]}
  sortValue={sortBy}
  onSortChange={setSortBy}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  showViewToggle={true}
  totalResults={allLocations.length}
  filteredResults={filteredLocations.length}
  resultsLabel="locations"
/>;
```

### 3. Simple Search-Only Usage

```tsx
// For pages that only need search functionality:
<SearchAndFilters
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Search partners..."
  sortOptions={[
    { value: "name", label: "Name" },
    { value: "rating", label: "Rating" },
  ]}
  sortValue={sortBy}
  onSortChange={setSortBy}
  totalResults={partners.length}
  filteredResults={filteredPartners.length}
  resultsLabel="partners"
/>
```

### 4. Advanced Usage with Custom Styling

```tsx
<SearchAndFilters
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Search products..."
  filterOptions={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
  filterValue={selectedCategory}
  onFilterChange={setSelectedCategory}
  filterLabel="All Categories"
  sortOptions={[
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
  ]}
  sortValue={sortBy}
  onSortChange={setSortBy}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  showViewToggle={true}
  totalResults={allItems.length}
  filteredResults={filteredItems.length}
  resultsLabel="items"
  className="mb-6 border-2 border-emerald-200"
/>
```

## Benefits

1. **Consistency**: Same look and feel across all pages
2. **Maintainability**: Single component to update for design changes
3. **Flexibility**: Highly configurable with optional props
4. **Accessibility**: Built-in ARIA labels and keyboard navigation
5. **Responsive**: Mobile-first design approach
6. **Performance**: Optimized re-rendering with proper prop types

## Migration Strategy

To replace existing search/filter components:

1. Import the new `SearchAndFilters` component
2. Replace existing search/filter JSX with the new component
3. Map existing state and handlers to component props
4. Remove old component-specific search/filter code
5. Test functionality and styling

## Custom Styling

The component accepts a `className` prop for additional styling:

```tsx
<SearchAndFilters
  className="mb-8 border-l-4 border-emerald-500"
  // ... other props
/>
```

## Future Enhancements

Potential features to add:

- Date range filtering
- Multi-select filters
- Saved search preferences
- Export functionality
- Advanced search modal
- Filter badges/chips
