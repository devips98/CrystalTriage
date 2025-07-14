import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

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

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Visibility Radius
        </Label>
        <span className="text-sm text-accent font-semibold">
          {formatRadius(radius)}
        </span>
      </div>
      
      <Slider
        value={[radius]}
        onValueChange={handleRadiusChange}
        max={5000}
        min={50}
        step={50}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span>50m</span>
        <span>5km</span>
      </div>
    </div>
  );
}
