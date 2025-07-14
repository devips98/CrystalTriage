import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeftRight, MessageSquare, User } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Feed" },
    { path: "/geoswap", icon: ArrowLeftRight, label: "GeoSwap" },
    { path: "/messages", icon: MessageSquare, label: "Messages", badge: true },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            onClick={() => setLocation(item.path)}
            className={`flex flex-col items-center space-y-1 p-2 relative ${
              location === item.path
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-primary"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
            {item.badge && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full" />
            )}
          </Button>
        ))}
      </div>
    </nav>
  );
}
