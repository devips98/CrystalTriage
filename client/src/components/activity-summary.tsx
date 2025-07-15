import { Sparkles, TrendingUp, Users, MapPin, Clock } from "lucide-react";

interface ActivitySummaryProps {
  summary: string;
}

export default function ActivitySummary({ summary }: ActivitySummaryProps) {
  // Mock activity stats for enhanced display
  const stats = [
    { icon: TrendingUp, label: "Active Posts", value: "24", color: "text-green-500" },
    { icon: Users, label: "Nearby Users", value: "12", color: "text-blue-500" },
    { icon: MapPin, label: "Hot Spots", value: "3", color: "text-orange-500" },
    { icon: Clock, label: "Last Update", value: "2m", color: "text-purple-500" }
  ];

  return (
    <div className="mx-4 sm:mx-6 mb-6">
      <div className="glass-card rounded-2xl p-4 hover-lift">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold gradient-text text-lg">
              Local Activity Pulse
            </h3>
            <p className="text-sm text-muted-foreground">
              Real-time community insights
            </p>
          </div>
        </div>

        {/* Activity Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="glass-button p-3 rounded-xl text-center hover-lift">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <div className="text-lg font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* AI Summary */}
        <div className="glass-button p-4 rounded-xl border border-primary/20">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">✨</span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Today's Highlights</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {summary || "Your local community is buzzing with activity! Check out the latest posts and connect with nearby explorers."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
