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
import { 
  Camera, 
  MapPin, 
  Settings, 
  Users, 
  Moon, 
  Sun, 
  Package,
  Sparkles,
  Zap,
  Heart,
  TrendingUp
} from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md modern-card animate-bounce-in">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto gradient-primary rounded-full flex items-center justify-center pulse-glow">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-white text-sm">!</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-3">
            Location Access Required
          </h1>
          <p className="text-muted-foreground mb-6 text-balance">
            This app requires location access to show you nearby content and connect you with your local community.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full gradient-primary hover:shadow-lg transition-all duration-300 text-white font-semibold py-3"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Enhanced Top Navigation */}
      <header className="glass-card border-0 px-4 sm:px-6 py-4 sticky top-0 z-40 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="flex items-center space-x-2 glass-button px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium gradient-text hidden sm:inline">
                  {location ? 'Live Location' : 'Searching...'}
                </span>
                <span className="text-sm font-medium gradient-text sm:hidden">
                  {location ? 'Live' : '...'}
                </span>
                <span className="text-xs text-muted-foreground bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full">
                  {formatRadius(radius)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="glass-button px-3 py-2 rounded-full flex items-center space-x-2">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold">{nearbyUsers}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">online</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="glass-button p-2 rounded-full hover:scale-110 transition-transform"
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="glass-button p-2 rounded-full hover:scale-110 transition-transform"
            >
              {theme === 'dark' ? 
                <Sun className="w-5 h-5 text-yellow-500" /> : 
                <Moon className="w-5 h-5 text-purple-600" />
              }
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:gap-8">
            {/* Main Feed Area */}
            <div className="flex-1 max-w-2xl mx-auto lg:max-w-none">
              
              {/* Enhanced Radius Control */}
              <div className="mb-6">
                <RadiusControl radius={radius} onRadiusChange={setRadius} />
              </div>

              {/* Activity Summary with Enhanced Design */}
              {summaryData && (
                <div className="mb-6">
                  <ActivitySummary summary={summaryData.summary} />
                </div>
              )}

              {/* Stunning Tab Navigation */}
              <div className="mb-8">
                <div className="glass-card p-2 rounded-2xl max-w-md mx-auto">
                  <div className="flex relative">
                    <div 
                      className={`absolute top-1 bottom-1 left-1 right-1 gradient-primary rounded-xl transition-all duration-300 ease-out ${
                        activeTab === 'posts' ? 'translate-x-0' : 'translate-x-full'
                      }`}
                      style={{ width: 'calc(50% - 4px)' }}
                    />
                    <Button
                      variant="ghost"
                      onClick={() => setActiveTab('posts')}
                      className={`flex-1 py-3 rounded-xl relative z-10 transition-colors ${
                        activeTab === 'posts' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      <span className="font-semibold">Feed</span>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setActiveTab('geoswap')}
                      className={`flex-1 py-3 rounded-xl relative z-10 transition-colors ${
                        activeTab === 'geoswap' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      <span className="font-semibold">GeoSwap</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Spectacular Photo Post Button */}
              {activeTab === 'posts' && (
                <div className="mb-8">
                  <Button
                    onClick={() => setCameraOpen(true)}
                    className="w-full gradient-animated text-white py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-4 group relative overflow-hidden border-0"
                  >
                    {/* Animated background overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    
                    <div className="flex items-center justify-center w-14 h-14 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 relative z-10">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col items-start relative z-10">
                      <span className="font-bold text-xl">Share Your Moment</span>
                      <span className="text-sm opacity-90">Capture what's happening around you ✨</span>
                    </div>
                    <div className="text-3xl group-hover:scale-125 transition-transform relative z-10">📸</div>
                  </Button>
                </div>
              )}

              {/* Enhanced Content Feed */}
              <div className="space-y-6">
                {activeTab === 'posts' ? (
                  postsLoading ? (
                    <div className="space-y-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full shimmer" />
                            <div className="space-y-2 flex-1">
                              <div className="w-24 h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded shimmer" />
                              <div className="w-16 h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded shimmer" />
                            </div>
                          </div>
                          <div className="w-full h-64 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl mb-4 shimmer" />
                          <div className="space-y-2">
                            <div className="w-3/4 h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded shimmer" />
                            <div className="w-1/2 h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded shimmer" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : allContent.length > 0 ? (
                    <div className="grid gap-6 lg:grid-cols-1">
                      {allContent.map((item: any, index) => (
                        <div 
                          key={`${item.type}-${item.id}`}
                          className="animate-scale-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <PostCard
                            content={item}
                            type={item.type}
                            onRefresh={refetchPosts}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="relative mb-6">
                        <div className="w-24 h-24 mx-auto gradient-primary rounded-full flex items-center justify-center pulse-glow float-animation">
                          <Camera className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-8 animate-bounce">
                          <Sparkles className="w-8 h-8 text-yellow-400" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold gradient-text mb-3">
                        Be the first to explore! 🌟
                      </h3>
                      <p className="text-muted-foreground mb-8 text-balance max-w-md mx-auto">
                        No content nearby yet. Share your moment and start building your local community.
                      </p>
                      <div className="space-y-4">
                        <Button 
                          onClick={() => setCameraOpen(true)} 
                          className="gradient-primary text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Capture Your First Moment
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Share what's happening around you ✨
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="animate-fade-in">
                    <GeoSwapList />
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Desktop Sidebar */}
            <div className="hidden lg:block lg:w-80 lg:ml-8">
              <div className="sticky top-24 space-y-6">
                {/* Live Activity Card */}
                <div className="glass-card rounded-2xl p-6 hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg gradient-text">Live Activity</h3>
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Posts nearby</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xl">{posts.length}</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Active users</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xl text-accent">{nearbyUsers}</span>
                        <Users className="w-4 h-4 text-accent" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Current radius</span>
                      <span className="font-bold bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {formatRadius(radius)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions Card */}
                <div className="glass-card rounded-2xl p-6 hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg gradient-text">Quick Actions</h3>
                    <Zap className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setCameraOpen(true)}
                      className="w-full gradient-primary text-white hover:shadow-lg transition-all duration-300 py-3 rounded-xl font-semibold"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Share Moment
                    </Button>
                    <Button
                      onClick={() => setGeoSwapOpen(true)}
                      className="w-full glass-button border-2 border-secondary/20 hover:border-secondary/40 transition-all duration-300 py-3 rounded-xl font-semibold"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Create GeoSwap
                    </Button>
                  </div>
                </div>

                {/* Connection Status Card */}
                <div className="glass-card rounded-2xl p-4 hover-lift">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} ${isConnected ? 'animate-pulse' : ''}`}></div>
                      <span className="text-sm font-medium">
                        {isConnected ? 'Connected' : 'Reconnecting...'}
                      </span>
                    </div>
                    <Heart className="w-4 h-4 text-red-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Floating Action Buttons - Mobile Only */}
      <div className="fixed bottom-24 right-6 flex flex-col space-y-3 z-40 lg:hidden">
        <Button
          onClick={() => setGeoSwapOpen(true)}
          className="w-14 h-14 gradient-warm rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
          size="icon"
        >
          <Package className="w-6 h-6 text-white" />
        </Button>
        <Button
          onClick={() => setCameraOpen(true)}
          className="w-16 h-16 gradient-primary rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 pulse-glow"
          size="icon"
        >
          <Camera className="w-7 h-7 text-white" />
        </Button>
      </div>

      {/* Enhanced Bottom Navigation */}
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

      {/* Enhanced Connection Status */}
      {!isConnected && (
        <div className="fixed top-24 left-4 right-4 glass-card border-amber-400/50 p-3 rounded-xl text-center z-40 animate-slide-up">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Reconnecting to live updates...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
