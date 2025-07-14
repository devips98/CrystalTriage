import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCamera } from "@/hooks/use-camera";
import { useLocation as useGeolocation } from "@/hooks/use-location";
import { apiRequest } from "@/lib/queryClient";
import { X, Camera, RotateCcw, Eye, Video, MapPin, Send } from "lucide-react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export default function CameraModal({ isOpen, onClose, onPostCreated }: CameraModalProps) {
  const [step, setStep] = useState<'camera' | 'compose'>('camera');
  const [isTruthMode, setIsTruthMode] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [visibilityRadius, setVisibilityRadius] = useState(500);
  
  const {
    videoRef,
    canvasRef,
    isStreaming,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    capturedImage,
    resetCapture,
  } = useCamera();

  const { location } = useGeolocation();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest('POST', '/api/posts', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/nearby'] });
      onPostCreated?.();
      handleClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setStep('camera');
      resetCapture();
      setPostContent("");
      setIsAnonymous(false);
      setIsTruthMode(false);
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const handleClose = () => {
    stopCamera();
    resetCapture();
    setStep('camera');
    onClose();
  };

  const handleCapture = () => {
    if (isVideoMode) {
      // TODO: Implement video recording
      console.log('Video recording not implemented yet');
    } else {
      capturePhoto();
      setStep('compose');
    }
  };

  const handlePost = async () => {
    if (!capturedImage || !location) return;

    const formData = new FormData();
    
    // Convert base64 to blob
    const response = await fetch(capturedImage);
    const blob = await response.blob();
    formData.append('media', blob, 'photo.jpg');
    
    formData.append('content', postContent);
    formData.append('latitude', location.latitude.toString());
    formData.append('longitude', location.longitude.toString());
    formData.append('visibilityRadius', visibilityRadius.toString());
    formData.append('isTruthMode', isTruthMode.toString());
    formData.append('isAnonymous', isAnonymous.toString());
    formData.append('userId', 'user123'); // TODO: Get from auth

    createPostMutation.mutate(formData);
  };

  const formatRadius = (value: number) => {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${value}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md lg:max-w-lg p-0 bg-black text-white border-0 m-0 sm:m-4" aria-describedby="camera-modal-description">
        <div id="camera-modal-description" className="sr-only">
          Camera interface for capturing and posting photos with location-based sharing options
        </div>
        {step === 'camera' ? (
          <div className="h-[100vh] sm:h-[80vh] flex flex-col">
            {/* Camera Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 relative z-10 camera-safe-top">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="p-2 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
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
              
              <canvas ref={canvasRef} className="hidden" />
              
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
            </div>
            
            {/* Camera Controls */}
            <div className="p-4 sm:p-6 flex items-center justify-center space-x-6 sm:space-x-8 camera-safe-bottom">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-500 rounded-lg opacity-50 flex items-center justify-center">
                <span className="text-xs text-gray-500">No Gallery</span>
              </div>
              
              <Button
                onClick={isStreaming ? handleCapture : startCamera}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 touch-target"
                size="icon"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center">
                  {isVideoMode ? (
                    <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </div>
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setIsVideoMode(!isVideoMode)}
                className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white rounded-lg text-white hover:bg-white/20 touch-target"
                size="icon"
              >
                {isVideoMode ? <Camera className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Post</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('camera')}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Preview Image */}
            {capturedImage && (
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Post Content */}
            <Textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's happening in your area?"
              className="resize-none"
              rows={3}
            />

            {/* Location Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 text-accent" />
              <span>Current Location</span>
            </div>

            {/* Settings */}
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="visibility-radius">Visibility Radius</Label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatRadius(visibilityRadius)}
                </span>
              </div>
              <Input
                id="visibility-radius"
                type="range"
                min="50"
                max="5000"
                step="50"
                value={visibilityRadius}
                onChange={(e) => setVisibilityRadius(parseInt(e.target.value))}
                className="accent-accent"
              />

              <div className="flex items-center justify-between">
                <Label htmlFor="truth-mode">Truth Mode</Label>
                <Switch
                  id="truth-mode"
                  checked={isTruthMode}
                  onCheckedChange={setIsTruthMode}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="anonymous">Post Anonymously</Label>
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>
            </div>

            {/* Post Button */}
            <Button
              onClick={handlePost}
              disabled={createPostMutation.isPending || !location}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              {createPostMutation.isPending ? 'Posting...' : 'Share Post'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
