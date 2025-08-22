import { Search, Grid, List } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface SearchAndFiltersProps {
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
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showViewToggle?: boolean;

  // Results
  totalResults: number;
  filteredResults: number;
  resultsLabel?: string;

  // Styling
  className?: string;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterOptions,
  filterValue,
  onFilterChange,
  filterLabel = "All",
  sortOptions,
  sortValue,
  onSortChange,
  viewMode,
  onViewModeChange,
  showViewToggle = false,
  totalResults,
  filteredResults,
  resultsLabel = "items",
  className = ""
}) => {
  return (
    <section className={`mb-8 ${className}`} id="search-filters">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-[#20B2AA] focus:outline-none"
            />
          </div>

          {/* Filters and Controls */}
          <div className="flex items-center space-x-4">
            {/* Filter Dropdown */}
            {filterOptions && filterOptions.length > 0 && onFilterChange && (
              <select
                value={filterValue}
                onChange={(e) => onFilterChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:border-[#20B2AA] focus:outline-none"
              >
                <option value="all">{filterLabel}</option>
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Dropdown */}
            <select
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:border-[#20B2AA] focus:outline-none"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            {showViewToggle && viewMode && onViewModeChange && (
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-[#20B2AA] text-white' : 'bg-white text-gray-600'}`}
                  title="Grid view"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-[#20B2AA] text-white' : 'bg-white text-gray-600'}`}
                  title="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredResults.toLocaleString()} of {totalResults.toLocaleString()} {resultsLabel}
        </div>
      </div>
    </section>
  );
};

export default SearchAndFilters;
