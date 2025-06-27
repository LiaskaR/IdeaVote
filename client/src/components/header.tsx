import { Search, Bell, Plus, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  onCreateClick: () => void;
}

export default function Header({ onCreateClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-yellow-400 p-2 rounded-lg">
              <Lightbulb className="text-white text-lg w-5 h-5" />
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900">IdeaHub</span>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400 w-4 h-4" />
              </div>
              <Input
                type="text"
                placeholder="Search ideas..."
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
            </Button>
            <Button onClick={onCreateClick} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Idea
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=32&h=32&fit=crop&crop=face" />
                <AvatarFallback>AZ</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">Andrey Zakharov</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
