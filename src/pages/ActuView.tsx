import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import FeedCluster from '@/components/Publication/FeedCluster';
import CreatePublicationModal from '@/components/Publication/CreatePublicationModal';
import PageHeader from '@/components/Layout/PageHeader';
import PostSkeleton from '@/components/ui/PostSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import DebateStoryBar from '@/components/Debate/DebateStoryBar';
import { Plus } from 'lucide-react';
import { usePublications } from '@/hooks/usePublications';

const ActuView: React.FC = () => {
  const { user } = useAuth();
  const [showPublishModal, setShowPublishModal] = React.useState(false);

  const {
    publications,
    loadingNews,
    activeFilter,
    setActiveFilter,
    getClusteredFeed,
    addPublication,
    handleSupport,
    handleReaction,
    trendingTopics,
  } = usePublications();

  const clusters = getClusteredFeed();

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader showSearch searchPlaceholder="Rechercher..." />

      {/* Tendances Section with Debate Stories */}
      <div className="px-4 pt-3 pb-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Tendances en Belgique
        </h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 items-center" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Debate Story Bubbles — at left */}
          <DebateStoryBar />

          {/* Hashtag filters */}
          {trendingTopics.map((topic) => (
            <Badge
              key={topic}
              variant="outline"
              className={`text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out whitespace-nowrap flex-shrink-0 min-h-[44px] flex items-center rounded-xl ${activeFilter === topic
                ? 'bg-gradient-legit text-white border-transparent'
                : 'text-primary border-primary/30 bg-background hover:bg-primary/10'
                }`}
              onClick={() => setActiveFilter(activeFilter === topic ? null : topic)}
              aria-label={`Filtrer par ${topic}`}
            >
              #{topic}
            </Badge>
          ))}
          <div className="w-4 flex-shrink-0" />
        </div>
      </div>

      {/* Continuous Clustered Feed */}
      <div className="px-4 pt-2 pb-4">
        <div className="space-y-1">
          {clusters.map((cluster, idx) => (
            <div key={cluster.tag}>
              <FeedCluster
                tag={cluster.tag}
                publications={cluster.publications}
                news={cluster.news}
                tweets={cluster.tweets}
                events={cluster.events}
                isTrending={cluster.isTrending}
                isFavorite={cluster.isFavorite}
                onSupport={handleSupport}
                onReaction={handleReaction}
                isLast={idx === clusters.length - 1}
                isFiltered={!!activeFilter && idx === 0}
              />
            </div>
          ))}

          {loadingNews && (
            <PostSkeleton count={3} />
          )}

          {!loadingNews && publications.length === 0 && (
            <EmptyState type="feed" />
          )}
        </div>
      </div>

      {/* FAB - Floating Action Button */}
      <button
        onClick={() => setShowPublishModal(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-legit text-white shadow-civic-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all duration-200 ease-in-out"
        aria-label="Créer une nouvelle publication"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Publish Modal */}
      <CreatePublicationModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        onPublish={addPublication}
      />
    </div>
  );
};

export default ActuView;
