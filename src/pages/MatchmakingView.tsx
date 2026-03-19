import React, { useState } from 'react';
import PageHeader from '@/components/Layout/PageHeader';
import CommunityTab from '@/components/Participation/CommunityTab';
import DemocracyTab from '@/components/Participation/DemocracyTab';

type TabType = 'communaute' | 'democratie';

const MatchmakingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('communaute');

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Participation" />

      <div className="max-w-2xl mx-auto px-4 pt-2 space-y-3">
        {/* Tabs */}
        <div className="flex border-b-2 border-border">
          <button
            className={`flex-1 pb-3 text-sm font-bold transition-all duration-200 relative min-h-[48px] ${activeTab === 'communaute' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            onClick={() => setActiveTab('communaute')}
          >
            👥 Communauté
            {activeTab === 'communaute' && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-legit rounded-full transition-all duration-300" />}
          </button>
          <button
            className={`flex-1 pb-3 text-sm font-bold transition-all duration-200 relative min-h-[48px] ${activeTab === 'democratie' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            onClick={() => setActiveTab('democratie')}
          >
            🗳️ Démocratie
            {activeTab === 'democratie' && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-legit rounded-full transition-all duration-300" />}
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'communaute' ? <CommunityTab /> : <DemocracyTab />}
      </div>
    </div>
  );
};

export default MatchmakingView;
