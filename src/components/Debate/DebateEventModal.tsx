import React from 'react';
import { DebateEvent } from '@/data/mockDebateEvents';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import DebateEventCard from '@/components/Publication/DebateEventCard';

interface DebateEventModalProps {
    debate: DebateEvent | null;
    onClose: () => void;
}

const DebateEventModal: React.FC<DebateEventModalProps> = ({ debate, onClose }) => {
    if (!debate) return null;

    return (
        <Drawer open={!!debate} onClose={onClose}>
            {/* 
                We remove the default padding and background from DrawerContent 
                so the DebateEventCard stands out gorgeously on its own.
            */}
            <DrawerContent className="p-4 border-none bg-zinc-950">
                <div className="mx-auto w-full max-w-md mt-6 mb-4">
                    <DebateEventCard event={debate} />
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default DebateEventModal;
