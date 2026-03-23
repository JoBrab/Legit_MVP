import React, { useState } from 'react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ThumbsUp, Reply, Send } from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';
import { Publication, UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  author: { displayName: string; avatar?: string; role: UserRole; isVerified: boolean };
  content: string;
  createdAt: Date;
  upvotes: number;
  userUpvoted: boolean;
  replies: Comment[];
}

interface CommentsDrawerProps {
  open: boolean;
  onClose: () => void;
  publication: Publication;
}

const MOCK_COMMENTS: Comment[] = [];

const formatTime = (date: Date) => {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}j`;
};

const CommentItem: React.FC<{
  comment: Comment;
  depth: number;
  onUpvote: (id: string) => void;
  onReply: (id: string) => void;
  replyingTo: string | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: (parentId: string) => void;
}> = ({ comment, depth, onUpvote, onReply, replyingTo, replyText, onReplyTextChange, onSubmitReply }) => {
  const maxDepth = 3;

  return (
    <div className={cn(depth > 0 && 'ml-5 border-l-2 border-border pl-3')}>
      <div className="py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {comment.author.avatar ? (
              <img src={comment.author.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <span className="text-[10px] font-semibold text-foreground">{comment.author.displayName.charAt(0)}</span>
            )}
          </div>
          <span className="text-sm font-semibold text-foreground">{comment.author.displayName}</span>
          <RoleBadge role={comment.author.role} isVerified={comment.author.isVerified} size="sm" />
          <span className="text-xs text-muted-foreground ml-auto">{formatTime(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed ml-8">{comment.content}</p>
        <div className="flex items-center gap-3 ml-8 mt-1.5">
          <button
            onClick={() => onUpvote(comment.id)}
            className={cn(
              'flex items-center gap-1 text-xs transition-colors min-h-[32px] px-1',
              comment.userUpvoted ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'
            )}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            {comment.upvotes}
          </button>
          {depth < maxDepth - 1 && (
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors min-h-[32px] px-1"
            >
              <Reply className="w-3.5 h-3.5" />
              Répondre
            </button>
          )}
        </div>

        {replyingTo === comment.id && (
          <div className="ml-8 mt-2 flex gap-2">
            <Textarea
              placeholder="Votre réponse..."
              value={replyText}
              onChange={(e) => onReplyTextChange(e.target.value)}
              className="min-h-[60px] text-sm flex-1"
              maxLength={500}
              autoFocus
            />
            <Button
              size="sm"
              className="self-end min-h-[36px]"
              disabled={!replyText.trim()}
              onClick={() => onSubmitReply(comment.id)}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {comment.replies.map(reply => (
        <CommentItem
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          onUpvote={onUpvote}
          onReply={onReply}
          replyingTo={replyingTo}
          replyText={replyText}
          onReplyTextChange={onReplyTextChange}
          onSubmitReply={onSubmitReply}
        />
      ))}
    </div>
  );
};

const CommentsDrawer: React.FC<CommentsDrawerProps> = ({ open, onClose, publication }) => {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const totalComments = comments.reduce((acc, c) => {
    let count = 1;
    c.replies.forEach(r => { count++; r.replies.forEach(() => count++); });
    return acc + count;
  }, 0);

  const handleUpvote = (id: string) => {
    const toggle = (list: Comment[]): Comment[] =>
      list.map(c => c.id === id
        ? { ...c, userUpvoted: !c.userUpvoted, upvotes: c.upvotes + (c.userUpvoted ? -1 : 1) }
        : { ...c, replies: toggle(c.replies) }
      );
    setComments(toggle(comments));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    const c: Comment = {
      id: `new-${Date.now()}`,
      author: { displayName: 'Vous', role: 'Citizen', isVerified: false },
      content: newComment,
      createdAt: new Date(),
      upvotes: 0,
      userUpvoted: false,
      replies: [],
    };
    setComments([c, ...comments]);
    setNewComment('');
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) return;
    const reply: Comment = {
      id: `reply-${Date.now()}`,
      author: { displayName: 'Vous', role: 'Citizen', isVerified: false },
      content: replyText,
      createdAt: new Date(),
      upvotes: 0,
      userUpvoted: false,
      replies: [],
    };
    const addReply = (list: Comment[]): Comment[] =>
      list.map(c => c.id === parentId
        ? { ...c, replies: [...c.replies, reply] }
        : { ...c, replies: addReply(c.replies) }
      );
    setComments(addReply(comments));
    setReplyText('');
    setReplyingTo(null);
  };

  const sorted = [...comments].sort((a, b) =>
    sortBy === 'popular' ? b.upvotes - a.upvotes : b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="h-[92dvh] flex flex-col">
        {/* Sticky header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
          <button onClick={onClose} className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{publication.author.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{publication.content.fr?.slice(0, 60)}...</p>
          </div>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            💬 {totalComments}
          </Badge>
        </div>

        {/* Sort options */}
        <div className="flex gap-2 px-4 py-2 border-b border-border flex-shrink-0">
          <button
            onClick={() => setSortBy('recent')}
            className={cn('text-xs px-3 py-1.5 rounded-full transition-colors min-h-[32px]',
              sortBy === 'recent' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            Plus récents
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={cn('text-xs px-3 py-1.5 rounded-full transition-colors min-h-[32px]',
              sortBy === 'popular' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            Plus populaires
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-semibold text-foreground mb-1">Soyez le premier à commenter</p>
              <p className="text-sm text-muted-foreground">Partagez votre avis sur cette publication</p>
            </div>
          ) : (
            sorted.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={0}
                onUpvote={handleUpvote}
                onReply={(id) => setReplyingTo(replyingTo === id ? null : id)}
                replyingTo={replyingTo}
                replyText={replyText}
                onReplyTextChange={setReplyText}
                onSubmitReply={handleSubmitReply}
              />
            ))
          )}
        </div>

        {/* New comment input */}
        <div className="flex gap-2 px-4 py-3 border-t border-border bg-background flex-shrink-0">
          <Textarea
            placeholder="Écrire un commentaire..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[44px] max-h-[100px] text-sm flex-1"
            maxLength={500}
          />
          <Button
            size="sm"
            className="self-end min-h-[44px]"
            disabled={!newComment.trim()}
            onClick={handleSubmitComment}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CommentsDrawer;
