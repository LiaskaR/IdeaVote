import React from "react";
import { FormattedMessage, useIntl } from 'react-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Grid3X3, List } from "lucide-react";

const sortOptions = [
  { value: "popular", labelId: "filters.popular", defaultLabel: "Popular" },
  { value: "newest", labelId: "filters.newest", defaultLabel: "Newest" },
  { value: "oldest", labelId: "filters.oldest", defaultLabel: "Oldest" },
  { value: "discussed", labelId: "filters.mostDiscussed", defaultLabel: "Most Discussed" },
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
  const intl = useIntl();
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('card')}
          className={`p-2 ${viewMode === 'card' ? 'bg-[#fee600] hover:bg-[#fee600]' : 'hover:bg-gray-100'}`}
          title={intl.formatMessage({ id: 'filters.cardView', defaultMessage: 'Card View' })}
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('list')}
          className={`p-2 ${viewMode === 'list' ? 'bg-[#fee600] hover:bg-[#fee600]' : 'hover:bg-gray-100'}`}
          title={intl.formatMessage({ id: 'filters.listView', defaultMessage: 'List View' })}
        >
          <List className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">
          <FormattedMessage id="filters.sortBy" defaultMessage="Sort by:" />
        </span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <FormattedMessage id={option.labelId} defaultMessage={option.defaultLabel} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
