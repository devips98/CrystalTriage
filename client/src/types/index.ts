export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ProximityEvent {
  type: 'user_entered' | 'user_left' | 'user_active';
  userId: string;
  distance: number;
  timestamp: number;
}

export interface RealtimeMessage {
  type: 'new_post' | 'new_message' | 'proximity_alert' | 'geotimecapsule_opened' | 'challenge_completed';
  data: any;
  timestamp: number;
}

export interface CameraSettings {
  facingMode: 'user' | 'environment';
  resolution: {
    width: number;
    height: number;
  };
  quality: number;
}

export interface AppSettings {
  shareLocation: boolean;
  anonymousMode: boolean;
  notifications: {
    nearbyActivity: boolean;
    geoTimeCapsules: boolean;
    proximityAlerts: boolean;
    truthModeUpdates: boolean;
  };
  privacy: {
    showInNearbyUsers: boolean;
    allowDirectMessages: boolean;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultRadius: number;
  cameraSettings: CameraSettings;
  appSettings: AppSettings;
}

export interface GeofenceEvent {
  type: 'enter' | 'exit';
  latitude: number;
  longitude: number;
  radius: number;
  timestamp: number;
}

export interface ContentInteraction {
  type: 'like' | 'comment' | 'share' | 'react';
  contentId: string;
  contentType: 'post' | 'confession' | 'challenge' | 'geotimecapsule';
  userId: string;
  timestamp: number;
}

export interface LocalActivity {
  postsCount: number;
  activeUsers: number;
  challengesActive: number;
  geoTimeCapsules: number;
  confessionsCount: number;
  truthModePosts: number;
  timeframe: 'hour' | 'day' | 'week';
}

export interface TrustScoreUpdate {
  userId: string;
  previousScore: number;
  newScore: number;
  reason: string;
  timestamp: number;
}

export interface OfflineContent {
  id: string;
  type: 'post' | 'confession';
  content: string;
  mediaUrl?: string;
  triggerLocation: LocationCoordinates;
  triggerRadius: number;
  isTriggered: boolean;
  createdAt: Date;
}
