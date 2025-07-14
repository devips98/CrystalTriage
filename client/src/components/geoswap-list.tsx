import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/use-location";
import { Package, MessageCircle, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { GeoSwap } from "@shared/schema";

interface GeoSwapListProps {
  onMessageUser?: (userId: string) => void;
}

export default function GeoSwapList({ onMessageUser }: GeoSwapListProps) {
  const { location } = useLocation();

  const { data: geoSwaps = [], isLoading } = useQuery({
    queryKey: ['/api/geoswaps/nearby', location?.latitude, location?.longitude],
    queryFn: () => {
      const params = new URLSearchParams({
        latitude: location!.latitude.toString(),
        longitude: location!.longitude.toString(),
        userId: 'user123', // TODO: Get from auth
        radius: '1000'
      });
      return fetch(`/api/geoswaps/nearby?${params}`).then(res => res.json());
    },
    enabled: !!location,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (geoSwaps.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Items Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No one in your area is currently offering items to swap.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Be the first to share something with your community!
        </p>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      books: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      electronics: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      clothing: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      sports: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      home: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      toys: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      art: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      food: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Package className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold">Local GeoSwaps</h2>
        <span className="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
          {geoSwaps.length} available
        </span>
      </div>

      {geoSwaps.map((swap: GeoSwap) => (
        <div key={swap.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
          <div className="flex space-x-4">
            {/* Item Image */}
            {swap.user1ImageUrl && (
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={swap.user1ImageUrl}
                  alt={swap.user1Item}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Item Details */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {swap.user1Item}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(swap.category)}`}>
                    {swap.category}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(swap.createdAt), { addSuffix: true })}</span>
                </div>
              </div>

              {swap.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {swap.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>Nearby</span>
                </div>

                {onMessageUser && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMessageUser(swap.user1Id)}
                    className="text-xs"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Contact
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}