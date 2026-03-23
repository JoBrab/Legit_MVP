import React from 'react';
import { DebateEvent } from '@/data/mockDebateEvents';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { triggerHaptic } from '@/utils/haptics';

interface Props {
  event: DebateEvent;
}

const DebateEventCard: React.FC<Props> = ({ event }) => {
  const dateStr = event.date.toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="relative w-full rounded-[24px] overflow-hidden shadow-sm border border-border/10 bg-black aspect-[4/5] flex flex-col justify-end group cursor-pointer active:scale-[0.98] transition-all duration-300">
      {/* Background Image */}
      <img src={event.imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col p-5 h-full justify-between">
        
        {/* Top elements */}
        <div className="flex justify-between items-start">
          <Badge className="bg-white/20 text-white border-0 backdrop-blur-md px-2.5 py-1 text-xs font-semibold">
            Événement • {event.theme}
          </Badge>
          <div className="bg-white/20 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Bottom content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md">
            {event.title}
          </h3>
          
          <div className="space-y-2">
            {/* Speakers */}
            <div className="flex items-start gap-2 text-white/90">
              <Users className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/70" />
              <div className="flex flex-col gap-0.5">
                {event.speakers.map((speaker, idx) => (
                  <span key={idx} className="text-xs font-medium">{speaker}</span>
                ))}
              </div>
            </div>
            
            {/* Details row */}
            <div className="flex items-center gap-4 text-white/80 mt-1">
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {dateStr}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[150px]">{event.location}</span>
              </div>
            </div>
          </div>
          
          {/* CTA Tile */}
          <button 
            onClick={(e) => { e.stopPropagation(); triggerHaptic('medium'); }}
            className="w-full mt-2 bg-white text-black py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            S'inscrire au débat
            <ChevronRight className="w-4 h-4 text-black/60" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebateEventCard;
