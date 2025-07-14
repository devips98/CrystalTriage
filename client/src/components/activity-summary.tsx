import { Sparkles } from "lucide-react";

interface ActivitySummaryProps {
  summary: string;
}

export default function ActivitySummary({ summary }: ActivitySummaryProps) {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 m-4 p-4 rounded-xl border border-primary/20 dark:border-primary/30">
      <div className="flex items-center space-x-2 mb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          Today's Local Activity
        </span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {summary}
      </p>
    </div>
  );
}
