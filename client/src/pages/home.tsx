import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import PostCard from "@/components/post-card";
import CameraModal from "@/components/camera-modal";
import GeoSwapModal from "@/components/geoswap-modal";
import GeoSwapList from "@/components/geoswap-list";
import SettingsModal from "@/components/settings-modal";
import RadiusControl from "@/components/radius-control";
import ActivitySummary from "@/components/activity-summary";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/use-location";
import { useWebSocket } from "@/hooks/use-websocket";
import { Camera, MapPin, Settings, Users, Moon, Sun, Package } from "lucide-react";
import { useTheme } from "next-themes";
import type { Post, Confession, Challenge, GeoTimeCapsule } from "@shared/schema";

export default function Home() {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [geoSwapOpen, setGeoSwapOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'geoswap'>('posts');
  const [radius, setRadius] = useState(500);
  const [nearbyUsers, setNearbyUsers] = useState(3);
  
  const { location, error: locationError } = useLocation();
  const { theme, setTheme } = useTheme();
  const { isConnected } = useWebSocket();

  // Fetch nearby posts
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery<Post[]>({
    queryKey: ['/api/posts/nearby', location?.latitude, location?.longitude, radius],
    enabled: !!location,
  });

  // Fetch nearby confessions
  const { data: confessions = [] } = useQuery<Confession[]>({
    queryKey: ['/api/confessions/nearby', location?.latitude, location?.longitude, 200],
    enabled: !!location,
  });

  // Fetch nearby challenges
  const { data: challenges = [] } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges/nearby', location?.latitude, location?.longitude, 1000],
    enabled: !!location,
  });

  // Fetch available geo time capsules
  const { data: geoTimeCapsules = [] } = useQuery<GeoTimeCapsule[]>({
    queryKey: ['/api/geotimecapsules/available', location?.latitude, location?.longitude],
    enabled: !!location,
  });

  // Fetch daily summary
  const { data: summaryData } = useQuery<{ summary: any }>({
    queryKey: ['/api/summary/daily', location?.latitude, location?.longitude, radius],
    enabled: !!location,
  });

  const formatRadius = (value: number) => {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${value}m`;
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Combine all content types into a single feed
  const allContent = [
    ...posts.map((post: Post) => ({ ...post, type: 'post' })),
    ...confessions.map((confession: Confession) => ({ ...confession, type: 'confession' })),
    ...challenges.map((challenge: Challenge) => ({ ...challenge, type: 'challenge' })),
    ...geoTimeCapsules.map((capsule: GeoTimeCapsule) => ({ ...capsule, type: 'geotimecapsule' })),
  ].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  if (locationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Location Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This app requires location access to show you nearby content and connect you with your local community.
          </p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between relative z-50">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1 sm:space-x-2 bg-accent/10 dark:bg-accent/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
              {location ? 'Current Location' : 'Loading...'}
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">
              {location ? 'Here' : 'Loading...'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatRadius(radius)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
            <span>{nearbyUsers}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 sm:pb-20">
        <div className="lg:flex lg:max-w-7xl lg:mx-auto">
          {/* Main Feed Area */}
          <div className="flex-1 max-w-4xl mx-auto lg:max-w-none">
            <RadiusControl radius={radius} onRadiusChange={setRadius} />
          
          {summaryData && (
            <ActivitySummary summary={summaryData.summary} />
          )}

          {/* Tab Navigation */}
          <div className="px-3 sm:px-4 lg:px-6 mb-4 sm:mb-6">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg max-w-md mx-auto sm:max-w-none">
              <Button
                variant={activeTab === 'posts' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('posts')}
                className="flex-1 py-2 sm:py-3 text-sm sm:text-base"
              >
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Feed</span>
                <span className="sm:hidden">Posts</span>
              </Button>
              <Button
                variant={activeTab === 'geoswap' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('geoswap')}
                className="flex-1 py-2 sm:py-3 text-sm sm:text-base"
              >
                <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">GeoSwap</span>
                <span className="sm:hidden">Swap</span>
              </Button>
            </div>
          </div>          {/* Photo Post Button */}
          {activeTab === 'posts' && (
            <div className="px-3 sm:px-4 lg:px-6 mb-4 sm:mb-6">
              <Button
                onClick={() => setCameraOpen(true)}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-4 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3 sm:space-x-4 group relative overflow-hidden"
              >
                {/* Subtle shine animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors relative z-10">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col items-start relative z-10">
                  <span className="font-semibold text-base sm:text-lg">Share a Photo</span>
                  <span className="text-xs sm:text-sm opacity-90">Capture what's happening around you</span>
                </div>
                <div className="text-xl sm:text-2xl group-hover:scale-110 transition-transform relative z-10">📸</div>
              </Button>
            </div>
          )}

          {/* Content Feed */}
          <div className="space-y-3 sm:space-y-4 px-3 sm:px-4 lg:px-6">
            {/* Desktop: Create a grid layout for larger screens */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-3 sm:space-y-4 lg:space-y-0">
              {activeTab === 'posts' ? (
            postsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
                      <div className="space-y-2">
                        <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                        <div className="w-16 h-3 bg-gray-300 dark:bg-gray-600 rounded" />
                      </div>
                    </div>
                    <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 rounded-lg mb-3" />
                    <div className="space-y-2">
                      <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                      <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : allContent.length > 0 ? (
              allContent.map((item: any) => (
                <PostCard
                  key={`${item.type}-${item.id}`}
                  content={item}
                  type={item.type}
                  onRefresh={refetchPosts}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No content nearby yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Be the first to share something in your area!
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setCameraOpen(true)} 
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Take a Photo
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Share what's happening around you 📸
                  </p>
                </div>
              </div>
            )            ) : (
              <GeoSwapList />              )}
            </div>
          </div>
          
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-80 lg:ml-6">
            <div className="sticky top-6 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Local Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Posts nearby</span>
                    <span className="font-medium">{posts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Active users</span>
                    <span className="font-medium">{nearbyUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current radius</span>
                    <span className="font-medium">{formatRadius(radius)}</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => setCameraOpen(true)}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button
                    onClick={() => setGeoSwapOpen(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Create GeoSwap
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </main>

      {/* Floating Action Buttons - Mobile Only */}
      <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 flex flex-col space-y-2 sm:space-y-3 z-40 lg:hidden">
        <Button
          onClick={() => setGeoSwapOpen(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg hover:scale-110 transition-transform touch-target"
          size="icon"
        >
          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </Button>
        <Button
          onClick={() => setCameraOpen(true)}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg hover:scale-110 transition-transform touch-target"
          size="icon"
        >
          <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Modals */}
      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onPostCreated={refetchPosts}
      />
      
      <GeoSwapModal
        isOpen={geoSwapOpen}
        onClose={() => setGeoSwapOpen(false)}
      />
      
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Connection Status */}
      {!isConnected && (
        <div className="fixed top-20 left-4 right-4 bg-amber-500 text-white p-2 rounded-lg text-sm text-center z-40">
          Reconnecting to live updates...
        </div>
      )}
    </div>
  );
}
