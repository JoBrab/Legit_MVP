import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  role: 'Citizen' | 'Politician' | 'Press' | 'SocietyGroup' | 'Institution';
  organization?: string;
  isVerified: boolean;
}

interface NewConversationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateConversation: (userId: string, type: 'private' | 'thematic') => void;
}

const roleConfig: Record<string, { label: string; badgeStyle: string; avatarStyle: string }> = {
  Politician: { label: 'Politique', badgeStyle: 'bg-[#5400a8]/10 text-[#5400a8]', avatarStyle: 'bg-[#E91E63] text-white' },
  Citizen: { label: 'Citoyen', badgeStyle: 'bg-gray-100 text-gray-600', avatarStyle: 'bg-gray-200 text-gray-600' },
  Press: { label: 'Média', badgeStyle: 'bg-[#1E88E5]/10 text-[#1E88E5]', avatarStyle: 'bg-[#1E88E5] text-white' },
  SocietyGroup: { label: 'Société civile', badgeStyle: 'bg-gray-100 text-gray-600', avatarStyle: 'bg-gray-300 text-gray-700' },
  Institution: { label: 'Institution', badgeStyle: 'bg-[#43A047]/10 text-[#43A047]', avatarStyle: 'bg-[#43A047] text-white' },
};

const contacts: Contact[] = [];

const NewConversationDialog: React.FC<NewConversationDialogProps> = ({ open, onClose, onCreateConversation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Animation on open/close
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [open]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSelect = (contact: Contact) => {
    triggerHaptic('medium');
    handleClose();
    setTimeout(() => {
      onCreateConversation(contact.id, 'private');
    }, 150);
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.organization && c.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
    roleConfig[c.role]?.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!open && !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] w-full">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={cn('absolute inset-0 bg-black/60 transition-opacity duration-[300ms]', isVisible ? 'opacity-100' : 'opacity-0')}
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] transition-transform duration-[300ms] flex flex-col w-full shadow-2xl',
          isVisible ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ height: '70vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0 cursor-pointer active:opacity-50" onTouchStart={handleClose} onClick={handleClose}>
          <div className="w-[40px] h-[5px] bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-[16px] py-1 flex-shrink-0">
          <h2 className="text-[17px] font-semibold text-gray-900 text-center">Nouveau message</h2>
        </div>

        {/* Search */}
        <div className="px-[16px] py-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-[36px] pr-4 py-2 bg-[#F5F5F7] rounded-[12px] text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="overflow-y-auto flex-1 w-full pb-8">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Aucun contact trouvé</p>
          ) : (
            filtered.map((contact, index) => {
              const cfg = roleConfig[contact.role] || roleConfig.Citizen;
              return (
                <button
                  key={contact.id}
                  onClick={() => handleSelect(contact)}
                  className="w-full flex items-center px-[16px] min-h-[72px] gap-3 py-2 active:bg-gray-50 bg-white"
                  style={{ borderBottom: index < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                >
                  {/* Avatar and Role */}
                  <div className="flex flex-col items-center justify-center flex-shrink-0 w-[44px]">
                    <div className={cn('w-[44px] h-[44px] rounded-full flex items-center justify-center text-lg font-semibold mb-1', cfg.avatarStyle)}>
                      {contact.name.charAt(0)}
                    </div>
                    <span className={cn('text-[10px] whitespace-nowrap px-1.5 py-[1px] leading-tight rounded-full font-medium', cfg.badgeStyle)}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left flex flex-col justify-center py-1">
                    <span className="text-sm font-semibold text-gray-900 truncate mb-0.5">{contact.name}</span>
                    {contact.organization && (
                      <span className="text-xs text-gray-500 truncate">{contact.organization}</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NewConversationDialog;
