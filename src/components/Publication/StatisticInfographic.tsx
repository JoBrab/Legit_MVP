import React from 'react';
import { Card } from '@/components/ui/card';

interface StatisticInfographicProps {
  percentage: number;
  label: string;
  source?: string;
  sourceUrl?: string;
}

const StatisticInfographic: React.FC<StatisticInfographicProps> = ({
  percentage,
  label,
  source,
  sourceUrl,
}) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="space-y-4">
        {/* Large percentage display */}
        <div className="text-center">
          <div className="text-6xl font-bold text-primary mb-2">
            {percentage}%
          </div>
          <div className="text-lg font-medium text-foreground">
            {label}
          </div>
        </div>

        {/* Visual bar */}
        <div className="relative h-8 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Source */}
        {source && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
            Source: {sourceUrl ? (
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline font-medium"
              >
                {source}
              </a>
            ) : (
              <span className="font-medium">{source}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatisticInfographic;
