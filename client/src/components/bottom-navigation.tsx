import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeftRight, MessageSquare, User, Circle } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Feed", color: "text-blue-500" },
    { path: "/geoswap", icon: ArrowLeftRight, label: "GeoSwap", color: "text-orange-500" },
    { path: "/messages", icon: MessageSquare, label: "Messages", badge: true, color: "text-green-500" },
    { path: "/profile", icon: User, label: "Profile", color: "text-purple-500" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bottom-nav z-50 bottom-nav-safe">
      <div className="flex items-center justify-around max-w-md mx-auto px-2 py-3 sm:max-w-none">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center space-y-1 p-3 relative touch-target min-w-0 transition-all duration-300 rounded-2xl ${
                isActive
                  ? "text-white bg-gradient-to-br from-primary to-secondary shadow-lg scale-110"
                  : "text-muted-foreground hover:text-foreground glass-button"
              }`}
            >
              {/* Background glow for active item */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-md opacity-50 scale-150 -z-10"></div>
              )}
              
              <div className="relative">
                <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110' : ''}`} />
                
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2">
                    <Circle className="w-2 h-2 fill-white text-white animate-pulse" />
                  </div>
                )}

                {/* Message badge */}
                {item.badge && !isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-red-400 to-red-600 rounded-full border-2 border-white dark:border-gray-900 animate-bounce">
                    <div className="w-full h-full bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              
              <span className={`text-xs font-medium truncate transition-all duration-300 ${
                isActive ? 'text-white font-semibold' : ''
              }`}>
                {item.label}
              </span>
              
              {/* Active item underline */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
              )}
            </Button>
          );
        })}
      </div>
      
      {/* Background blur enhancement */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/90 to-white/80 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/80 backdrop-blur-xl -z-10"></div>
    </nav>
  );
}
