import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = [
  { value: "all", label: "All Ideas" },
  { value: "product", label: "Product" },
  { value: "process", label: "Process" },
  { value: "culture", label: "Culture" },
  { value: "innovation", label: "Innovation" },
];

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "discussed", label: "Most Discussed" },
];

interface FiltersBarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export default function FiltersBar({
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: FiltersBarProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "secondary"}
              size="sm"
              onClick={() => onCategoryChange(category.value)}
              className={selectedCategory === category.value 
                ? "bg-primary text-white hover:bg-primary/90" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            >
              {category.label}
            </Button>
          ))}
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
