import React, { useState } from 'react';
import { AgreementLevel } from '@/types';
import { cn } from '@/lib/utils';

interface ReactionBarProps {
  reactions: Record<AgreementLevel, number>;
  userReaction?: AgreementLevel;
  onReact: (level: AgreementLevel) => void;
}

const ReactionBar: React.FC<ReactionBarProps> = ({ reactions, userReaction, onReact }) => {
  const [showGauge, setShowGauge] = useState(false);
  
  // Reversed: 5 is now "d'accord" (left), 1 is "pas d'accord" (right)
  const levels: AgreementLevel[] = [5, 4, 3, 2, 1];
  const labels = ["D'accord", "Plutôt oui", 'Neutre', "Plutôt non", "Pas d'accord"];
  const shortLabels = ["👍", "✓", "~", "✗", "👎"];
  
  const borderColors = [
    'border-[hsl(142,76%,36%)] text-[hsl(142,76%,36%)]',
    'border-[hsl(142,71%,45%)] text-[hsl(142,71%,45%)]',
    'border-[hsl(45,93%,47%)] text-[hsl(45,93%,47%)]',
    'border-[hsl(25,95%,53%)] text-[hsl(25,95%,53%)]',
    'border-[hsl(0,84%,60%)] text-[hsl(0,84%,60%)]',
  ];
  
  const activeBorderColors = [
    'border-[hsl(142,76%,36%)] text-white bg-[hsl(142,76%,36%)]',
    'border-[hsl(142,71%,45%)] text-white bg-[hsl(142,71%,45%)]',
    'border-[hsl(45,93%,47%)] text-white bg-[hsl(45,93%,47%)]',
    'border-[hsl(25,95%,53%)] text-white bg-[hsl(25,95%,53%)]',
    'border-[hsl(0,84%,60%)] text-white bg-[hsl(0,84%,60%)]',
  ];
  
  const gaugeColors = [
    'hsl(142,76%,36%)',
    'hsl(142,71%,45%)',
    'hsl(45,93%,47%)',
    'hsl(25,95%,53%)',
    'hsl(0,84%,60%)',
  ];

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  const [animating, setAnimating] = useState<AgreementLevel | null>(null);

  const handleReact = (level: AgreementLevel) => {
    setAnimating(level);
    setTimeout(() => setAnimating(null), 300);
    onReact(level);
    setShowGauge(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {levels.map((level, index) => (
          <button
            key={level}
            onClick={() => handleReact(level)}
            className={cn(
            'flex-1 py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all duration-200 ease-in-out bg-background border-2 min-h-[44px]',
              userReaction === level ? activeBorderColors[index] : borderColors[index],
              userReaction === level && 'scale-105 font-semibold shadow-md',
              animating === level && 'scale-[1.2]',
              'hover:scale-105 active:scale-95'
            )}
            title={labels[index]}
          >
            <span className="hidden sm:inline">{labels[index]}</span>
            <span className="sm:hidden">{shortLabels[index]}</span>
          </button>
        ))}
      </div>
      
      {showGauge && totalReactions > 0 && (
        <div className="h-1.5 rounded-full overflow-hidden flex bg-muted/30">
          {levels.map((level, index) => {
            const count = reactions[level] || 0;
            const percentage = totalReactions > 0 ? (count / totalReactions) * 100 : 0;
            
            if (percentage === 0) return null;
            
            return (
              <div
                key={level}
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: gaugeColors[index]
                }}
                title={`${labels[index]}: ${count} (${percentage.toFixed(0)}%)`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReactionBar;
