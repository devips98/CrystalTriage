import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Radar, MapPin, Eye } from "lucide-react";

interface RadiusControlProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
}

export default function RadiusControl({ radius, onRadiusChange }: RadiusControlProps) {
  const formatRadius = (value: number) => {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${value}m`;
  };

  const handleRadiusChange = (values: number[]) => {
    onRadiusChange(values[0]);
  };

  const getRadiusCategory = () => {
    if (radius <= 200) return { label: "Intimate", icon: "👥", color: "text-green-500" };
    if (radius <= 1000) return { label: "Neighborhood", icon: "🏘️", color: "text-blue-500" };
    if (radius <= 3000) return { label: "District", icon: "🌆", color: "text-purple-500" };
    return { label: "City Wide", icon: "🌍", color: "text-orange-500" };
  };

  const category = getRadiusCategory();

  return (
    <div className="mx-4 sm:mx-6 mb-6">
      <div className="glass-card rounded-2xl p-4 hover-lift">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
              <Radar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-foreground">
                Discovery Radius
              </Label>
              <p className="text-xs text-muted-foreground">
                {category.icon} {category.label} view
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold gradient-text">
              {formatRadius(radius)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span>Live range</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Slider */}
        <div className="space-y-3">
          <Slider
            value={[radius]}
            onValueChange={handleRadiusChange}
            max={5000}
            min={50}
            step={50}
            className="w-full"
          />
          
          {/* Radius markers */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="flex flex-col items-center">
              <span className="font-medium">50m</span>
              <span className="text-green-500">👥</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-medium">1km</span>
              <span className="text-blue-500">🏘️</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-medium">3km</span>
              <span className="text-purple-500">🌆</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-medium">5km</span>
              <span className="text-orange-500">🌍</span>
            </div>
          </div>

          {/* Visual range indicator */}
          <div className="flex items-center justify-center space-x-2 p-2 glass-button rounded-xl">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">
              Discovering content within <span className={`font-semibold ${category.color}`}>{formatRadius(radius)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
