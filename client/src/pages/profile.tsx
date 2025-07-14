import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  MapPin, 
  Shield, 
  Eye, 
  Calendar, 
  Camera, 
  MessageSquare, 
  Trophy,
  Settings
} from "lucide-react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  
  // Mock user data - in real app, get from auth
  const currentUser = {
    id: "user123",
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex@example.com",
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    trustScore: 87,
    createdAt: new Date("2024-01-15"),
  };

  // Fetch user's posts
  const { data: userPosts = [] } = useQuery({
    queryKey: ['/api/posts/user', currentUser.id],
    enabled: !!currentUser.id,
  });

  // Fetch user stats
  const { data: userStats = { posts: 0, truthModePosts: 0, challenges: 0 } } = useQuery({
    queryKey: ['/api/users/stats', currentUser.id],
    enabled: !!currentUser.id,
  });

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatJoinDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile</h1>
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Profile Info */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={currentUser.profileImageUrl} />
            <AvatarFallback>
              {currentUser.firstName[0]}{currentUser.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {currentUser.firstName} {currentUser.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{currentUser.email}</p>
            
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center space-x-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Trust Score: {currentUser.trustScore}
                </span>
              </div>
              <div className={`w-2 h-2 rounded-full ${getTrustScoreColor(currentUser.trustScore)}`} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Camera className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {userStats.posts}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Posts</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {userStats.truthModePosts}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Truth Mode</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {userStats.challenges}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Challenges</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-center mt-4 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-1" />
          <span>Joined {formatJoinDate(currentUser.createdAt)}</span>
        </div>
      </div>

      {/* Content Tabs */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="p-4">
            {userPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {userPosts.map((post: any) => (
                  <div key={post.id} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start sharing your local experiences!
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="activity" className="p-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Posted in Truth Mode • 2 hours ago
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-secondary rounded-full" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Completed local challenge • 1 day ago
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Created GeoTime Capsule • 3 days ago
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="achievements" className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">Local Explorer</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Posted in 5+ locations</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Eye className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">Truth Seeker</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">10+ Truth Mode posts</p>
                </CardContent>
              </Card>
              
              <Card className="opacity-50">
                <CardContent className="p-4 text-center">
                  <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-500">Trusted Member</p>
                  <p className="text-xs text-gray-400">Reach 90+ trust score</p>
                </CardContent>
              </Card>
              
              <Card className="opacity-50">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-500">Community Builder</p>
                  <p className="text-xs text-gray-400">50+ interactions</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
}
