import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Button } from "./button";
import { Grid3X3, List } from "lucide-react";

const sortOptions = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "discussed", label: "Most Discussed" },
];

interface FiltersBarProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  viewMode: 'card' | 'list';
  onViewModeChange: (viewMode: 'card' | 'list') => void;
}

export default function FiltersBar({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: FiltersBarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('card')}
          className={`p-2 ${viewMode === 'card' ? 'bg-[#fee600] hover:bg-[#fee600]' : 'hover:bg-gray-100'}`}
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('list')}
          className={`p-2 ${viewMode === 'list' ? 'bg-[#fee600] hover:bg-[#fee600]' : 'hover:bg-gray-100'}`}
        >
          <List className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-40">
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
  );
}
