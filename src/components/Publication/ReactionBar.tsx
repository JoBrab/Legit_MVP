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
  // We manage an internal state to ensure instant UI feedback and avoid parent render delays if any,
  // though the userReaction prop will eventually sync it.
  const [internalSelection, setInternalSelection] = useState<AgreementLevel | undefined>(userReaction);

  useEffect(() => {
    setInternalSelection(userReaction);
  }, [userReaction]);

  const levels: AgreementLevel[] = [1, 2, 3, 4, 5]; // Note: Left to right: Pas d'accord -> D'accord
  const labels = ["Pas d'accord", "Plutôt non", 'Neutre', "Plutôt oui", "D'accord"];

  const handleReact = (e: React.MouseEvent, level: AgreementLevel) => {
    e.preventDefault();
    e.stopPropagation();
    if (internalSelection !== level) {
      triggerHaptic('medium');
      setInternalSelection(level);
      onReact(level);
    }
  };

  // Calculate cursor position (percentage)
  const getCursorLeftPosition = () => {
    if (!internalSelection) return null;
    const index = levels.indexOf(internalSelection);
    return `${(index / 4) * 100}%`;
  };

  return (
    <div className="w-full flex flex-col justify-center h-[60px] select-none" onClick={(e) => e.stopPropagation()}>
      {/* Container for the gradient bar and cursor */}
      <div className="relative w-full h-2 mb-3">
        {/* Gradient Background Bar */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #E53935 0%, #FB8C00 25%, #9E9E9E 50%, #66BB6A 75%, #43A047 100%)'
          }}
        />

        {/* Clickable Overlay Segments */}
        <div className="absolute inset-x-[-10px] inset-y-[-16px] flex z-10">
          {levels.map((level) => (
            <button
              key={level}
              className="flex-1 h-full cursor-pointer focus:outline-none"
              onClick={(e) => handleReact(e, level)}
              aria-label={labels[levels.indexOf(level)]}
            />
          ))}
        </div>

        {/* Selected Cursor */}
        {internalSelection && (
          <div 
            className="absolute top-1/2 -ml-[10px] w-[20px] h-[20px] bg-white rounded-full shadow-md z-20 pointer-events-none"
            style={{
              left: getCursorLeftPosition() || '50%',
              marginTop: '-10px',
              transition: 'left 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          />
        )}
      </div>

      {/* Labels */}
      <div className="flex justify-between w-full px-1">
        {labels.map((label, index) => (
          <div 
            key={index} 
            className="flex-1 text-center"
            style={{
              // Align first to left, last to right, others center approx
              textAlign: index === 0 ? 'left' : index === 4 ? 'right' : 'center',
            }}
          >
            <span className={cn(
              "text-xs transition-colors duration-200",
              internalSelection === levels[index] ? "font-semibold text-[#1a1a1a]" : "text-[#888888] font-medium"
            )}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ReactionBar;
