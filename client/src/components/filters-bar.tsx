import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Filter, Plus } from "lucide-react";

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
    <div className="flex items-center justify-between mb-6">
      {/* Left Side - Toggle and Filters */}
      <div className="flex items-center space-x-4">
        {/* Show Completed Toggle */}
        <div className="flex items-center space-x-2">
          <Switch id="show-completed" />
          <label htmlFor="show-completed" className="text-sm font-medium text-gray-700">
            Показывать выполненные
          </label>
        </div>

        {/* Create Filter Button */}
        <Button 
          variant="outline" 
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Создать свой фильтр
        </Button>
      </div>

      {/* Right Side - Filter Actions */}
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          className="text-gray-600 border-gray-200 hover:bg-gray-50"
        >
          <Filter className="w-4 h-4 mr-2" />
          Фильтры
        </Button>
      </div>
    </div>
  );
}
