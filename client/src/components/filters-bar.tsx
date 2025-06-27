import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const sortOptions = [
  { value: "popular", label: "Популярные" },
  { value: "newest", label: "Новые" },
  { value: "oldest", label: "Старые" },
  { value: "discussed", label: "Обсуждаемые" },
];

interface FiltersBarProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export default function FiltersBar({
  sortBy,
  onSortChange,
}: FiltersBarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-2">
        <Switch id="show-completed" />
        <label htmlFor="show-completed" className="text-sm font-medium text-gray-700">
          Показывать выполненные
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Сортировка:</span>
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
