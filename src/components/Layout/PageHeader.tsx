import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';
import legitIcon from '@/assets/legit-g-icon.png';

interface PageHeaderProps {
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  title?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  showSearch = false,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  title,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative shadow-civic">
      <div className="flex items-center gap-3 px-4 py-2 bg-card/95 backdrop-blur-sm">
        {/* New G icon logo — rounded, tight */}
        <img src={legitIcon} alt="Legit" className="h-8 w-8 rounded-lg flex-shrink-0" />

        {/* Always show search bar between logo and profile */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={title ? `${title}...` : searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9 h-9 bg-background/80 border-border/50 focus:border-primary/40"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 hover:bg-primary/10 transition-all duration-200 ease-in-out"
          onClick={() => navigate('/menu')}
          aria-label="Profil et paramètres"
        >
          <User className="w-5 h-5" />
        </Button>
      </div>
      {/* Gradient accent line */}
      <div className="h-[2px] bg-gradient-legit opacity-60" />
    </div>
  );
};

export default PageHeader;
