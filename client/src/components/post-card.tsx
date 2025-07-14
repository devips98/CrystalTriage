import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MapPin, 
  Eye, 
  Clock, 
  Shield, 
  Trophy, 
  Timer,
  Users,
  Camera
} from "lucide-react";
import type { Post, Confession, Challenge, GeoTimeCapsule } from "@shared/schema";

interface PostCardProps {
  content: Post | Confession | Challenge | GeoTimeCapsule;
  type: 'post' | 'confession' | 'challenge' | 'geotimecapsule';
  onRefresh?: () => void;
}

export default function PostCard({ content, type, onRefresh }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (type === 'post') {
        return apiRequest('POST', `/api/posts/${content.id}/like`, { userId: 'user123' });
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
    },
  });

  const challengeParticipateMutation = useMutation({
    mutationFn: async () => {
      // TODO: Implement challenge participation
      return apiRequest('POST', `/api/challenges/${content.id}/participate`, { userId: 'user123' });
    },
    onSuccess: () => {
      onRefresh?.();
    },
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getDistanceText = () => {
    // Mock distance calculation
    const distances = ['25m away', '45m away', '78m away', '120m away', '200m away'];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  if (type === 'post') {
    const post = content as Post;
    return (
      <Card className="bg-white dark:bg-gray-800 overflow-hidden">
        {/* Post Header */}
        <div className="p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
              <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">
                {post.isAnonymous ? 'Anonymous' : 'local_user'}
              </h3>
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3 text-accent" />
                <span>{getDistanceText()}</span>
                <span>•</span>
                <span>{post.createdAt ? formatTimeAgo(post.createdAt) : 'Unknown'}</span>
                <div className="flex items-center space-x-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3 text-amber-600" />
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-200">85</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Post Content */}
        {post.imageUrl && (
          <div className="relative">
            <img 
              src={post.imageUrl} 
              alt="Post content" 
              className="w-full h-48 sm:h-64 lg:h-72 object-cover"
            />
            {/* Photo indicator badge */}
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Camera className="w-3 h-3" />
              <span className="hidden sm:inline">Photo</span>
            </div>
          </div>
        )}
        
        {/* Post Text */}
        <CardContent className="p-3 sm:p-4">
          {post.content && (
            <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 mb-3">{post.content}</p>
          )}
          
          {/* Truth Mode Indicator */}
          {post.isTruthMode && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  <Eye className="w-3 h-3 mr-1" />
                  Truth Mode
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">• Verified Live</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <Users className="w-3 h-3" />
                <span>5 nearby viewers</span>
              </div>
            </div>
          )}
          
          {/* Post Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => likeMutation.mutate()}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-secondary"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-secondary text-secondary' : ''}`} />
                <span className="text-sm">{likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">3</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-400 hover:text-accent"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Disappearing Timer */}
            {post.expiresAt && (
              <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
                <Clock className="w-3 h-3" />
                <span>25m left</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'confession') {
    const confession = content as Confession;
    return (
      <Card className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gray-600 dark:bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">?</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">Anonymous Confession</span>
            <Badge variant="outline" className="text-xs">
              200m radius
            </Badge>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-3 italic">
            "{confession.content}"
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-xl hover:scale-110 transition-transform">❤️</Button>
              <Button variant="ghost" size="sm" className="text-xl hover:scale-110 transition-transform">🫂</Button>
              <Button variant="ghost" size="sm" className="text-xl hover:scale-110 transition-transform">💪</Button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Object.values(confession.reactions || {}).reduce((a, b) => a + b, 0)} reactions
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Anonymous</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'challenge') {
    const challenge = content as Challenge;
    return (
      <Card className="bg-gradient-to-r from-accent/10 to-blue-500/10 dark:from-accent/20 dark:to-blue-500/20 border border-accent/30 dark:border-accent/40">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Trophy className="w-5 h-5 text-accent" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">Local Challenge</span>
            <Badge className="bg-accent/20 text-accent">Active</Badge>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">
            📸 {challenge.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>7 participants</span>
            </div>
            <Button
              onClick={() => challengeParticipateMutation.mutate()}
              className="bg-accent text-white hover:bg-accent/90"
              size="sm"
            >
              Accept Challenge
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'geotimecapsule') {
    const capsule = content as GeoTimeCapsule;
    const isAvailable = new Date(capsule.scheduledFor) <= new Date();
    
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Timer className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-800 dark:text-purple-200">GeoTime Capsule</span>
            <Badge className={`${isAvailable ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
              {isAvailable ? 'Available' : 'Opening Soon'}
            </Badge>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {isAvailable ? capsule.content : "A message from the past will appear here..."}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span>Location</span>
            </div>
            {isAvailable ? (
              <Button size="sm" variant="outline">View Capsule</Button>
            ) : (
              <span>Opens in 14h 23m</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
