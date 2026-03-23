import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
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

const roleConfig: Record<string, { label: string; bg: string; text: string; avatarBg: string }> = {
  Politician: { label: 'Politique', bg: 'bg-blue-100', text: 'text-blue-700', avatarBg: 'bg-blue-50 text-blue-600' },
  Citizen: { label: 'Citoyen', bg: 'bg-[hsl(330,85%,93%)]', text: 'text-[hsl(330,85%,40%)]', avatarBg: 'bg-[hsl(330,85%,95%)] text-[hsl(330,85%,50%)]' },
  Press: { label: 'Média', bg: 'bg-orange-100', text: 'text-orange-700', avatarBg: 'bg-orange-50 text-orange-600' },
  SocietyGroup: { label: 'Société civile', bg: 'bg-violet-100', text: 'text-violet-700', avatarBg: 'bg-violet-50 text-violet-600' },
  Institution: { label: 'Institution', bg: 'bg-emerald-100', text: 'text-emerald-700', avatarBg: 'bg-emerald-50 text-emerald-600' },
};

const contacts: Contact[] = [
  { id: 'bouchez', name: 'Georges-Louis Bouchez', role: 'Politician', organization: 'MR', isVerified: true },
  { id: 'magnette', name: 'Paul Magnette', role: 'Politician', organization: 'PS', isVerified: true },
  { id: 'maouane', name: 'Rajae Maouane', role: 'Politician', organization: 'Ecolo', isVerified: true },
  { id: 'sarah-d', name: 'Sarah D.', role: 'Citizen', isVerified: false },
  { id: 'thomas-v', name: 'Thomas V.', role: 'Citizen', isVerified: false },
  { id: 'yasmine-b', name: 'Yasmine B.', role: 'Citizen', isVerified: false },
  { id: 'rtbf', name: 'RTBF Info', role: 'Press', organization: 'RTBF', isVerified: true },
  { id: 'lesoir', name: 'Le Soir', role: 'Press', organization: 'Rossel', isVerified: true },
  { id: 'oxfam', name: 'Oxfam Belgique', role: 'SocietyGroup', organization: 'ONG', isVerified: true },
  { id: 'habitat', name: 'Habitat & Humanisme', role: 'SocietyGroup', organization: 'Association', isVerified: true },
];

const NewConversationDialog: React.FC<NewConversationDialogProps> = ({ open, onClose, onCreateConversation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Animation on open/close
  useEffect(() => {
    if (open) {
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
    onCreateConversation(contact.id, 'private');
    handleClose();
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.organization && c.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
    roleConfig[c.role]?.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!open && !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={cn('absolute inset-0 bg-black/40 transition-opacity duration-300', isVisible ? 'opacity-100' : 'opacity-0')}
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl transition-transform duration-300 ease-out',
          isVisible ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ maxHeight: '85vh', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-lg font-semibold text-gray-900">Nouvelle conversation</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou rôle..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63]/40 transition-all"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="overflow-y-auto px-2" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Aucun contact trouvé</p>
          ) : (
            filtered.map(contact => {
              const cfg = roleConfig[contact.role] || roleConfig.Citizen;
              return (
                <button
                  key={contact.id}
                  onClick={() => handleSelect(contact)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[56px]"
                >
                  {/* Avatar */}
                  <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0', cfg.avatarBg)}>
                    {contact.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-medium text-gray-900 truncate">{contact.name}</span>
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0', cfg.bg, cfg.text)}>
                        {cfg.label}
                      </span>
                    </div>
                    {contact.organization && (
                      <p className="text-xs text-gray-400 truncate">{contact.organization}</p>
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
