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
  Camera,
  Sparkles,
  Star
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
    const distances = ['25m away', '45m away', '78m away', '120m away', '200m away'];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  if (type === 'post') {
    const post = content as Post;
    return (
      <Card className="glass-card border-0 overflow-hidden hover-lift group">
        {/* Enhanced Post Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-12 h-12 ring-2 ring-white/50 dark:ring-gray-800/50">
                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" />
                <AvatarFallback className="gradient-primary text-white font-semibold">
                  {post.isAnonymous ? 'A' : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-bold text-foreground group-hover:gradient-text transition-all">
                {post.isAnonymous ? 'Anonymous Explorer' : 'Local Creator'}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-accent" />
                  <span>{getDistanceText()}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.createdAt ? formatTimeAgo(post.createdAt) : 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="trust-score-high px-3 py-1 text-xs font-semibold">
              <Shield className="w-3 h-3 mr-1" />
              85
            </Badge>
          </div>
        </div>

        {/* Enhanced Post Content */}
        {post.imageUrl && (
          <div className="relative overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt="Post content" 
              className="w-full h-64 lg:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            
            <div className="absolute top-3 right-3 glass-button px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Camera className="w-3 h-3" />
              <span className="hidden sm:inline text-white">Live Photo</span>
            </div>

            <div className="absolute bottom-3 left-3 glass-button px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Eye className="w-3 h-3 text-white" />
              <span className="text-white">42 views</span>
            </div>
          </div>
        )}
        
        <CardContent className="p-4">
          {post.content && (
            <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>
          )}
          
          {post.isTruthMode && (
            <div className="flex items-center justify-between mb-4 p-3 glass-card rounded-xl border border-accent/20">
              <div className="flex items-center space-x-2">
                <Badge className="bg-gradient-to-r from-accent to-green-400 text-white border-0">
                  <Eye className="w-3 h-3 mr-1" />
                  Truth Mode
                </Badge>
                <span className="text-xs text-muted-foreground">• Verified Live</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>5 nearby viewers</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => likeMutation.mutate()}
                className={`flex items-center space-x-2 rounded-full px-4 py-2 transition-all duration-300 ${
                  isLiked 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground'
                }`}
              >
                <Heart className={`w-4 h-4 transition-all duration-300 ${isLiked ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                <span className="text-sm font-medium">{likes || 12}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 rounded-full px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-muted-foreground hover:text-blue-500 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">3</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-muted-foreground hover:text-green-500 transition-all duration-300"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
            
            {post.expiresAt && (
              <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                <Timer className="w-3 h-3 text-amber-600" />
                <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">25m left</span>
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
      <Card className="glass-card border-0 overflow-hidden hover-lift group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-2xl"></div>
        <div className="relative glass-card rounded-2xl m-1">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 gradient-warm rounded-full flex items-center justify-center text-white font-bold">
                💭
              </div>
              <div>
                <h3 className="font-bold text-foreground">Anonymous Confession</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3 text-purple-500" />
                  <span>{getDistanceText()}</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{confession.createdAt ? formatTimeAgo(confession.createdAt) : 'Unknown'}</span>
                </div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Confession
            </Badge>
          </div>
          
          <CardContent className="p-4 pt-0">
            <p className="text-foreground leading-relaxed italic mb-4">
              "{confession.content}"
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 rounded-full px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-muted-foreground hover:text-purple-500 transition-all duration-300"
                >
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">Support</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 rounded-full px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-muted-foreground hover:text-blue-500 transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Reply</span>
                </Button>
              </div>
              
              <div className="flex items-center space-x-1 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                <Eye className="w-3 h-3 text-purple-600" />
                <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Anonymous</span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  if (type === 'challenge') {
    const challenge = content as Challenge;
    return (
      <Card className="glass-card border-0 overflow-hidden hover-lift group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-yellow-500/20 to-red-500/20 rounded-2xl"></div>
        <div className="relative glass-card rounded-2xl m-1">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 gradient-warm rounded-full flex items-center justify-center text-white">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{challenge.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3 text-orange-500" />
                  <span>{getDistanceText()}</span>
                  <span>•</span>
                  <Timer className="w-3 h-3" />
                  <span>2h left</span>
                </div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <Star className="w-3 h-3 mr-1" />
              Challenge
            </Badge>
          </div>
          
          <CardContent className="p-4 pt-0">
            <p className="text-foreground leading-relaxed mb-4">
              {challenge.description}
            </p>
            
            <div className="flex items-center justify-between mb-4 p-3 glass-card rounded-xl">
              <div className="text-center">
                <div className="text-lg font-bold text-orange-500">12</div>
                <div className="text-xs text-muted-foreground">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-500">5★</div>
                <div className="text-xs text-muted-foreground">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-500">🏆</div>
                <div className="text-xs text-muted-foreground">Reward</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                onClick={() => challengeParticipateMutation.mutate()}
                className="gradient-warm text-white font-semibold px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Join Challenge
              </Button>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-muted-foreground hover:text-orange-500 transition-all duration-300"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-muted-foreground hover:text-blue-500 transition-all duration-300"
                >
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  if (type === 'geotimecapsule') {
    const capsule = content as GeoTimeCapsule;
    return (
      <Card className="glass-card border-0 overflow-hidden hover-lift group relative pulse-glow">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl animate-pulse"></div>
        <div className="relative glass-card rounded-2xl m-1">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 gradient-cool rounded-full flex items-center justify-center text-white animate-pulse">
                ⏰
              </div>
              <div>
                <h3 className="font-bold gradient-text">GeoTime Capsule</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  <span>{getDistanceText()}</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>Opens in 2 days</span>
                </div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              Capsule
            </Badge>
          </div>
          
          <CardContent className="p-4 pt-0">
            <p className="text-muted-foreground leading-relaxed mb-4 italic">
              "A message from the past awaits discovery..."
            </p>
            
            <div className="flex items-center justify-between mb-4 p-3 glass-card rounded-xl border border-blue-500/20">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-500">📅</div>
                <div className="text-xs text-muted-foreground">Jan 15, 2023</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-500">🗝️</div>
                <div className="text-xs text-muted-foreground">Unlock Soon</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-500">👤</div>
                <div className="text-xs text-muted-foreground">Mystery</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                className="gradient-cool text-white font-semibold px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300"
                disabled
              >
                ⏳ Waiting to Unlock
              </Button>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-muted-foreground hover:text-blue-500 transition-all duration-300"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return null;
}
