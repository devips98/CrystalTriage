import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, MapPin, Bell, User, Download, LogOut } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    shareLocation: true,
    anonymousMode: false,
    nearbyActivity: true,
    geoTimeCapsules: true,
    proximityAlerts: true,
    truthModeNotifications: false,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // TODO: Save settings to backend/localStorage
  };

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log("Export data requested");
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log("Logout requested");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Settings
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Privacy Settings */}
          <div>
            <h3 className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              <MapPin className="w-4 h-4 mr-2" />
              Privacy
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="share-location" className="text-sm text-gray-700 dark:text-gray-300">
                  Share location
                </Label>
                <Switch
                  id="share-location"
                  checked={settings.shareLocation}
                  onCheckedChange={(value) => updateSetting('shareLocation', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="anonymous-mode" className="text-sm text-gray-700 dark:text-gray-300">
                  Anonymous mode
                </Label>
                <Switch
                  id="anonymous-mode"
                  checked={settings.anonymousMode}
                  onCheckedChange={(value) => updateSetting('anonymousMode', value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Settings */}
          <div>
            <h3 className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="nearby-activity" className="text-sm text-gray-700 dark:text-gray-300">
                  Nearby activity
                </Label>
                <Switch
                  id="nearby-activity"
                  checked={settings.nearbyActivity}
                  onCheckedChange={(value) => updateSetting('nearbyActivity', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="geotimecapsules" className="text-sm text-gray-700 dark:text-gray-300">
                  GeoTime Capsules
                </Label>
                <Switch
                  id="geotimecapsules"
                  checked={settings.geoTimeCapsules}
                  onCheckedChange={(value) => updateSetting('geoTimeCapsules', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="proximity-alerts" className="text-sm text-gray-700 dark:text-gray-300">
                  Proximity alerts
                </Label>
                <Switch
                  id="proximity-alerts"
                  checked={settings.proximityAlerts}
                  onCheckedChange={(value) => updateSetting('proximityAlerts', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="truth-mode" className="text-sm text-gray-700 dark:text-gray-300">
                  Truth Mode updates
                </Label>
                <Switch
                  id="truth-mode"
                  checked={settings.truthModeNotifications}
                  onCheckedChange={(value) => updateSetting('truthModeNotifications', value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Settings */}
          <div>
            <h3 className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              <User className="w-4 h-4 mr-2" />
              Account
            </h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-gray-700 dark:text-gray-300 h-10"
                onClick={() => {/* TODO: Navigate to profile edit */}}
              >
                Edit Profile
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-gray-700 dark:text-gray-300 h-10"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-red-600 dark:text-red-400 h-10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* App Info */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>HyperLocal v1.0.0</p>
              <p>Location-based social networking</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
