import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";
import { ArrowLeft, Camera, RotateCcw, Eye, Video } from "lucide-react";

export default function CameraPage() {
  const [, setLocation] = useLocation();
  const [isTruthMode, setIsTruthMode] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  
  const {
    videoRef,
    canvasRef,
    isStreaming,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    capturedImage,
  } = useCamera();

  const handleCapture = () => {
    if (isVideoMode) {
      // TODO: Implement video recording
      console.log('Video recording not implemented yet');
    } else {
      capturePhoto();
    }
  };

  const handleBack = () => {
    stopCamera();
    setLocation('/');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera Header */}
      <div className="flex items-center justify-between p-4 text-white relative z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="p-2 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsTruthMode(!isTruthMode)}
            className={`p-2 ${isTruthMode ? 'text-accent bg-accent/20' : 'text-white hover:bg-white/20'}`}
          >
            <Eye className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={switchCamera}
            className="p-2 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {/* Location Indicator */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-sm">Current Location</span>
        </div>
        
        {/* Truth Mode Overlay */}
        {isTruthMode && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white">
              <Eye className="w-12 h-12 text-accent mb-4 mx-auto" />
              <p className="text-lg font-semibold mb-2">Truth Mode Verification</p>
              <p className="text-sm opacity-75">Take a 3-second selfie to verify authenticity</p>
              <div className="mt-4">
                <div className="w-16 h-16 border-4 border-accent rounded-full mx-auto animate-pulse" />
              </div>
            </div>
          </div>
        )}
        
        {/* Captured Image Preview */}
        {capturedImage && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <img src={capturedImage} alt="Captured" className="max-w-full max-h-full object-contain" />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                Retake
              </Button>
              <Button
                onClick={() => setLocation('/')}
                className="bg-primary hover:bg-primary/90"
              >
                Use Photo
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Camera Controls */}
      {!capturedImage && (
        <div className="p-6 flex items-center justify-center space-x-8">
          {/* Gallery Button (Disabled) */}
          <div className="w-12 h-12 border-2 border-gray-500 rounded-lg opacity-50 flex items-center justify-center">
            <div className="text-xs text-gray-500">No Gallery</div>
          </div>
          
          {/* Capture Button */}
          <Button
            onClick={handleCapture}
            disabled={!isStreaming}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 disabled:opacity-50"
            size="icon"
          >
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              {isVideoMode ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </div>
          </Button>
          
          {/* Mode Toggle */}
          <Button
            variant="ghost"
            onClick={() => setIsVideoMode(!isVideoMode)}
            className="w-12 h-12 border-2 border-white rounded-lg text-white hover:bg-white/20"
            size="icon"
          >
            {isVideoMode ? <Camera className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>
        </div>
      )}
      
      {/* Start Camera Button */}
      {!isStreaming && !capturedImage && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <Button
            onClick={startCamera}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
          >
            <Camera className="w-6 h-6 mr-2" />
            Start Camera
          </Button>
        </div>
      )}
    </div>
  );
}
