import { Search, Bell, Plus } from "lucide-react";
import logoPath from "@assets/4 оп_1751020306764.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {}

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={logoPath} 
              alt="IdeaHub Logo" 
              className="w-10 h-10 rounded-lg"
            />

          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400 w-4 h-4" />
              </div>
              <Input
                type="text"
                placeholder="Поиск задач..."
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
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
