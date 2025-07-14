import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCamera } from "@/hooks/use-camera";
import { useLocation as useGeolocation } from "@/hooks/use-location";
import { apiRequest } from "@/lib/queryClient";
import { X, Camera, RotateCcw, Package, Send } from "lucide-react";

interface GeoSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwapCreated?: () => void;
}

const categories = [
  { value: "books", label: "Books & Magazines" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing & Fashion" },
  { value: "sports", label: "Sports & Outdoor" },
  { value: "home", label: "Home & Garden" },
  { value: "toys", label: "Toys & Games" },
  { value: "art", label: "Art & Crafts" },
  { value: "food", label: "Food & Drinks" },
  { value: "other", label: "Other" }
];

export default function GeoSwapModal({ isOpen, onClose, onSwapCreated }: GeoSwapModalProps) {
  const [step, setStep] = useState<'camera' | 'compose'>('camera');
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  
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

  const createGeoSwapMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest('POST', '/api/geoswaps', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/geoswaps/nearby'] });
      onSwapCreated?.();
      handleClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      setStep('camera');
      resetCapture();
      setItemName("");
      setDescription("");
      setCategory("");
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
    capturePhoto();
    setStep('compose');
  };

  const handleSubmit = async () => {
    if (!capturedImage || !location || !itemName || !category) return;

    const formData = new FormData();
    
    // Convert base64 to blob
    const response = await fetch(capturedImage);
    const blob = await response.blob();
    formData.append('media', blob, 'geoswap-item.jpg');
    
    formData.append('user1Item', itemName);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('latitude', location.latitude.toString());
    formData.append('longitude', location.longitude.toString());
    formData.append('userId', 'user123'); // TODO: Get from auth

    createGeoSwapMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 bg-black text-white border-0" aria-describedby="geoswap-modal-description">
        <DialogTitle className="sr-only">GeoSwap - Exchange Items Locally</DialogTitle>
        <div id="geoswap-modal-description" className="sr-only">
          Create a local item exchange by taking a photo of what you want to trade
        </div>
        
        {step === 'camera' ? (
          <div className="h-[80vh] flex flex-col">
            {/* Camera Header */}
            <div className="flex items-center justify-between p-4 relative z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="p-2 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-accent" />
                <span className="font-semibold">GeoSwap</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={switchCamera}
                className="p-2 text-white hover:bg-white/20"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
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
              
              {/* Info Overlay */}
              <div className="absolute top-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Package className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">GeoSwap</h3>
                    <p className="text-sm opacity-90">
                      Take a photo of an item you want to trade or give away. 
                      Other users nearby can see your listing and offer exchanges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Camera Controls */}
            <div className="p-6 flex items-center justify-center">
              <Button
                onClick={isStreaming ? handleCapture : startCamera}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
                size="icon"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold">Create GeoSwap</h2>
              </div>
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
                  alt="Item to swap"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Item Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="item-name">Item Name *</Label>
                <Input
                  id="item-name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="What are you offering?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item and what you're looking for in exchange..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h4 className="font-semibold text-accent mb-2">How GeoSwap Works:</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Your item appears to users within 1km radius</li>
                <li>• Others can message you to propose exchanges</li>
                <li>• Meet safely in public places to complete swaps</li>
                <li>• Help build a sharing economy in your neighborhood</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={createGeoSwapMutation.isPending || !location || !itemName || !category}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              {createGeoSwapMutation.isPending ? 'Creating...' : 'Create GeoSwap'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}