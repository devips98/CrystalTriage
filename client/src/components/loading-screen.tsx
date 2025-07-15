import { Sparkles, MapPin, Camera, Users } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-animated opacity-20"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>
        📸
      </div>
      <div className="absolute top-32 right-16 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>
        🌟
      </div>
      <div className="absolute bottom-32 left-20 text-3xl animate-bounce" style={{ animationDelay: '1s' }}>
        🗺️
      </div>
      <div className="absolute bottom-20 right-12 text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>
        👥
      </div>

      {/* Main loading content */}
      <div className="text-center z-10 max-w-md mx-auto px-6">
        {/* Logo area */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto gradient-primary rounded-full flex items-center justify-center pulse-glow float-animation">
            <div className="text-white text-3xl font-bold">CT</div>
          </div>
          <div className="absolute -top-3 -right-3 w-8 h-8 gradient-secondary rounded-full flex items-center justify-center animate-spin">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* App title */}
        <h1 className="text-4xl font-bold gradient-text mb-3 animate-scale-in">
          Crystal Triage
        </h1>
        <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Discover your local world in real-time
        </p>

        {/* Loading indicators */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <MapPin className="w-5 h-5 text-accent animate-pulse" />
            <span className="text-sm text-muted-foreground">Finding your location...</span>
          </div>
          <div className="flex items-center justify-center space-x-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Camera className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Preparing camera...</span>
          </div>
          <div className="flex items-center justify-center space-x-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <Users className="w-5 h-5 text-secondary animate-pulse" />
            <span className="text-sm text-muted-foreground">Connecting to community...</span>
          </div>
        </div>

        {/* Loading progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-4 overflow-hidden animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="h-full gradient-primary rounded-full animate-slide-in" style={{ width: '60%' }}></div>
        </div>

        {/* Fun fact */}
        <p className="text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '1.2s' }}>
          💡 Tip: Your posts disappear after 24 hours, encouraging authentic moments
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-secondary rounded-full animate-ping" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
}
