import React from "react";
import { X, Home, Users, FileText, Calendar, Settings, BarChart3, Target, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import logoPath from "@assets/4 оп_1751020306764.png";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "Ideas", href: "/" },
  { icon: Users, label: "Clients", href: "/clients" },
  { icon: FileText, label: "Pipeline", href: "/pipeline" },
  { icon: Users, label: "Contacts", href: "/contacts" },
  { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
  { icon: Target, label: "Recommendations", href: "/recommendations" },
  { icon: FileText, label: "Products", href: "/products" },
  { icon: Target, label: "Tasks", href: "/tasks" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: BarChart3, label: "Rates", href: "/rates" },
  { icon: Calculator, label: "Calculator", href: "/calculator" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0 border-0">
        <div className="h-full bg-gray-900 text-white">
          <SheetHeader className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={logoPath} 
                  alt="IdeaHub" 
                  className="w-10 h-10 rounded-lg bg-yellow-400 p-1"
                />
                <div>
                  <SheetTitle className="text-white text-lg font-bold">IdeaHub</SheetTitle>
                  <SheetDescription className="text-gray-400 text-sm">
                    Navigate through idea management system
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>
          
          <nav className="flex-1 py-6">
            <ul className="space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-none"
                      onClick={onClose}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          <div className="p-6 border-t border-gray-700">
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-white mb-2">
                Mobile Version
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Manage ideas anywhere
              </p>
              <Button 
                size="sm"
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Try Now
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>RU</span>
              <span>EN</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}