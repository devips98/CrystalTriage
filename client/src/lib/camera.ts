export interface CameraConstraints {
  facingMode: 'user' | 'environment';
  width?: number;
  height?: number;
  frameRate?: number;
}

export interface CameraCapabilities {
  facingModes: string[];
  resolutions: { width: number; height: number }[];
  hasFlash: boolean;
  canSwitchCamera: boolean;
}

export class CameraService {
  private static instance: CameraService;
  private stream: MediaStream | null = null;
  private capabilities: CameraCapabilities | null = null;

  static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  async isSupported(): Promise<boolean> {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async getDevices(): Promise<MediaDeviceInfo[]> {
    if (!await this.isSupported()) {
      throw new Error('Camera is not supported');
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  }

  async getCameraCapabilities(): Promise<CameraCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    const devices = await this.getDevices();
    const facingModes: string[] = [];
    
    // Try to determine available facing modes
    for (const device of devices) {
      if (device.label.toLowerCase().includes('front') || device.label.toLowerCase().includes('user')) {
        facingModes.push('user');
      } else if (device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('environment')) {
        facingModes.push('environment');
      }
    }

    // If we can't determine from labels, assume both are available if multiple cameras exist
    if (facingModes.length === 0 && devices.length > 1) {
      facingModes.push('user', 'environment');
    } else if (facingModes.length === 0) {
      facingModes.push('environment'); // Default to back camera
    }

    this.capabilities = {
      facingModes: Array.from(new Set(facingModes)),
      resolutions: [
        { width: 640, height: 480 },
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
      ],
      hasFlash: false, // Flash detection would require additional API calls
      canSwitchCamera: facingModes.length > 1,
    };

    return this.capabilities;
  }

  async startCamera(constraints: CameraConstraints): Promise<MediaStream> {
    if (!await this.isSupported()) {
      throw new Error('Camera is not supported');
    }

    // Stop existing stream
    this.stopCamera();

    try {
      const mediaConstraints: MediaStreamConstraints = {
        video: {
          facingMode: constraints.facingMode,
          width: { ideal: constraints.width || 1280 },
          height: { ideal: constraints.height || 720 },
          frameRate: { ideal: constraints.frameRate || 30 },
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      return this.stream;
    } catch (error) {
      console.error('Error starting camera:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Camera access denied. Please allow camera permissions.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No camera found on this device.');
        } else if (error.name === 'NotReadableError') {
          throw new Error('Camera is already in use by another application.');
        }
      }
      
      throw new Error('Failed to access camera. Please check your permissions and try again.');
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }
  }

  capturePhoto(videoElement: HTMLVideoElement, quality: number = 0.8): string {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    // Set canvas dimensions to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert to base64 image
    return canvas.toDataURL('image/jpeg', quality);
  }

  async capturePhotoAsBlob(videoElement: HTMLVideoElement, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/jpeg', quality);
    });
  }

  getCurrentStream(): MediaStream | null {
    return this.stream;
  }

  isStreaming(): boolean {
    return this.stream !== null && this.stream.active;
  }
}

export const cameraService = CameraService.getInstance();
