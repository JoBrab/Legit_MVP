import React, { useState, useEffect } from 'react';
import { AgreementLevel } from '@/types';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/utils/haptics';

interface ReactionBarProps {
  reactions: Record<AgreementLevel, number>;
  userReaction?: AgreementLevel;
  onReact: (level: AgreementLevel) => void;
}

const ReactionBar: React.FC<ReactionBarProps> = React.memo(({ reactions, userReaction, onReact }) => {
  const [internalSelection, setInternalSelection] = useState<AgreementLevel | undefined>(userReaction);
  const [stats, setStats] = useState<number[] | null>(null);

  useEffect(() => {
    setInternalSelection(userReaction);
  }, [userReaction]);

  useEffect(() => {
    if (internalSelection && !stats) {
      let raw = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()];
      
      const userIndex = levels.indexOf(internalSelection);
      raw[userIndex] += 1.5;
      if (userIndex > 0) raw[userIndex - 1] += 0.8;
      if (userIndex < 4) raw[userIndex + 1] += 0.8;

      const sum = raw.reduce((a, b) => a + b, 0);
      let percentages = raw.map(v => Math.round((v / sum) * 100));
      
      const diff = 100 - percentages.reduce((a, b) => a + b, 0);
      percentages[0] += diff;

      setStats(percentages);
    }
  }, [internalSelection, stats]);

  // Left to right: D'accord (Green) -> Pas d'accord (Red)
  const levels: AgreementLevel[] = [5, 4, 3, 2, 1];
  const labels = ["D'accord", "Plutôt oui", 'Neutre', "Plutôt non", "Pas d'accord"];
  
  const colors = [
    '#43A047', // D'accord (Green)
    '#8BC34A', // Plutôt oui (Light Green)
    '#FFC107', // Neutre (Yellow)
    '#FB8C00', // Plutôt non (Orange)
    '#E53935'  // Pas d'accord (Red)
  ];

  const handleReact = (e: React.MouseEvent, level: AgreementLevel) => {
    e.preventDefault();
    e.stopPropagation();
    if (internalSelection !== level) {
      triggerHaptic('medium');
      setInternalSelection(level);
      onReact(level);
    }
  };

  return (
    <div 
      className="w-full flex flex-col justify-center select-none gap-3 outline-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full">
        {stats && (
          <div className="flex w-full justify-between px-1 mb-1 animate-in fade-in zoom-in duration-500">
            {stats.map((percent, index) => (
              <div 
                key={`text-${index}`} 
                className="flex-1 text-center text-[10px] sm:text-xs font-bold transition-all"
                style={{ color: colors[index] }}
              >
                {percent}%
              </div>
            ))}
          </div>
        )}

        <div className="w-full h-2.5 sm:h-3 rounded-full overflow-hidden flex shadow-inner border border-gray-100/50 bg-gray-100">
          {!stats ? (
            <div 
              className="w-full h-full"
              style={{
                background: `linear-gradient(90deg, ${colors.join(', ')})`
              }}
            />
          ) : (
            stats.map((percent, index) => (
              <div 
                key={`bar-${index}`}
                className="h-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${percent}%`, 
                  backgroundColor: colors[index]
                }}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex justify-between w-full gap-1.5 sm:gap-2 mt-1">
        {levels.map((level, index) => {
          const isSelected = internalSelection === level;
          
          return (
            <button
              key={level}
              onClick={(e) => handleReact(e, level)}
              className={cn(
                "glass-card flex-1 flex flex-col items-center justify-center p-1.5 sm:p-2 transition-all duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#E91E63]",
                isSelected ? "scale-105 shadow-md" : "hover:scale-[1.02] active:scale-95"
              )}
              style={isSelected ? { 
                border: `1.5px solid ${colors[index]}80`,
                background: `rgba(255, 255, 255, 0.95)`,
                boxShadow: `0 4px 12px ${colors[index]}20`
              } : {}}
            >
              <div 
                className={cn(
                  "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mb-1 sm:mb-1.5 transition-transform duration-300",
                  isSelected ? "scale-110 shadow-sm" : "opacity-80"
                )}
                style={{ backgroundColor: colors[index] }} 
              />
              
              <span className={cn(
                "text-[9px] sm:text-[10px] leading-[1.1] text-center font-medium",
                isSelected ? "text-gray-900 font-bold" : "text-gray-600"
              )}>
                {labels[index]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  );
});

export default ReactionBar;
