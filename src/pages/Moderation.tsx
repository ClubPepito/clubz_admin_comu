import { useState, useEffect } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { 
  ShieldAlert, 
  MessageSquare, 
  Trash2, 
  MoreVertical, 
  Search, 
  Filter, 
  Loader2,
  Heart,
  Send,
  X,
  MessageCircle,
  MapPin,
  Check,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { ModerationChat } from '@/components/ModerationChat';
import { postService, commentService } from '../services/api';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuPortal, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';



// Sub-component for Polls
const PollDisplay = ({ poll }: { poll: any }) => {
  const totalVotes = poll.totalVotes || 0;
  const isEnded = poll.endsAt ? new Date(poll.endsAt) < new Date() : false;
  const maxVotes = poll.options?.length > 0 ? Math.max(...poll.options.map((o: any) => o.voteCount)) : 0;

  const getTimeRemaining = () => {
    if (isEnded) return 'Résultats finaux';
    if (!poll.endsAt) return '';
    const now = new Date();
    const end = new Date(poll.endsAt);
    const diff = end.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours > 24) return `${Math.floor(hours / 24)}j restants`;
    return `${hours}h restantes`;
  };

  return (
    <div className="mt-3 space-y-1.5">
      {poll.options?.map((option: any) => {
        const percentage = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;
        const isWinner = isEnded && option.voteCount === maxVotes && totalVotes > 0;
        
        return (
          <div key={option.id} className="relative h-9 rounded-lg border border-primary/10 overflow-hidden bg-primary/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className={cn(
                "absolute inset-y-0 left-0 transition-colors duration-500",
                option.viewerVoted ? "bg-primary/20" : "bg-primary/5"
              )}
            />
            <div className="absolute inset-0 flex items-center justify-between px-3 z-10">
              <span className={cn("text-[11px] font-bold", isWinner && "text-primary")}>
                {option.text}
                {option.viewerVoted && <Check size={12} className="inline ml-1.5 text-primary" />}
              </span>
              <span className="text-[10px] font-black text-muted-foreground">{percentage}%</span>
            </div>
          </div>
        );
      })}
      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight mt-1 pl-1">
        {totalVotes} votes • {getTimeRemaining()}
      </p>
    </div>
  );
};

const RichText = ({ content, entities }: { content: string, entities?: any }) => {
  if (!entities) return <>{content}</>;
  const elements = [];
  let lastIndex = 0;
  const allEntities = [
    ...(entities.mentions || []).map((m: any) => ({ ...m, type: 'mention' })),
    ...(entities.hashtags || []).map((h: any) => ({ ...h, type: 'hashtag' })),
    ...(entities.urls || []).map((u: any) => ({ ...u, type: 'url' })),
  ].sort((a, b) => a.start - b.start);

  allEntities.forEach((entity, idx) => {
    if (entity.start > lastIndex) {
      elements.push(content.substring(lastIndex, entity.start));
    }
    const entityText = content.substring(entity.start, entity.end);
    if (entity.type === 'mention') {
      elements.push(<span key={`m-${idx}`} className="text-primary font-black cursor-pointer hover:underline">{entityText}</span>);
    } else if (entity.type === 'hashtag') {
      elements.push(<span key={`h-${idx}`} className="text-primary font-bold cursor-pointer hover:underline">{entityText}</span>);
    } else {
      elements.push(<a key={`u-${idx}`} href={entity.url} target="_blank" rel="noreferrer" className="text-primary underline font-medium">{entityText}</a>);
    }
    lastIndex = entity.end;
  });
  if (lastIndex < content.length) {
    elements.push(content.substring(lastIndex));
  }
  return <>{elements}</>;
};

const CommentsSidebar = ({ post, onClose }: { post: any, onClose: () => void }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (post?.id) {
      fetchComments();
    }
  }, [post?.id]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await commentService.getByPost(post.id);
      setComments(res.data || []);
    } catch (err) {
      toast.error('Erreur chargement commentaires');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-[360px] bg-white shadow-2xl z-[100] border-l border-gray-100 flex flex-col"
    >
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#1a1a1a]">Commentaires</h3>
          <p className="text-[10px] text-gray-400 font-medium">{post.author?.name || post.user?.name}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 hover:bg-gray-100">
          <X size={16} className="text-gray-400" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-primary h-6 w-6" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8 rounded-full mt-0.5 border border-gray-100">
                <AvatarImage src={comment.author?.avatar} />
                <AvatarFallback className="bg-gray-100 text-[10px] font-bold">
                  {(comment.author?.name || "U")[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] font-bold text-[#1a1a1a]">{comment.author?.name || 'Anonyme'}</span>
                    <span className="text-[9px] text-gray-400">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-normal font-medium">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-30">
            <MessageCircle className="mx-auto mb-2" size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Aucun commentaire</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-50 bg-gray-50/30">
        <div className="relative">
          <textarea 
            placeholder="Écrire un commentaire..."
            className="w-full bg-white border border-gray-200 rounded-xl p-3 pr-10 text-[11px] font-medium outline-none resize-none min-h-[40px] shadow-sm focus:border-primary/30 transition-colors"
          />
          <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform">
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "À l'instant";
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) {
    if (date.getDate() === now.getDate()) {
      return `Aujourd'hui à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `Hier à ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const PostCard = ({ post, onDelete, onCommentClick }: { post: any, onDelete: (id: string) => void, onCommentClick: (post: any) => void }) => {

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group relative"
    >
      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-4 transition-all hover:shadow-md border border-gray-50">
        <CardContent className="p-0">
          <div className="p-4 pb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-full shadow-sm border border-gray-100">
                <AvatarImage src={post.author?.avatar || post.user?.avatar} />
                <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                  {(post.author?.name || post.user?.name || "T")[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#1a1a1a]">{post.author?.name || post.user?.name || 'Utilisateur'}</span>
                <div className="flex items-center gap-1.5 text-[10px] text-[#707070]">
                  <span>{formatRelativeTime(post.createdAt)}</span>
                  <span>•</span>
                  <span className="text-primary font-bold uppercase tracking-tight">#{post.community?.name || 'COMMUNAUTÉ'}</span>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1.5 hover:bg-gray-50 rounded-full transition-colors outline-none">
                <MoreVertical size={18} className="text-[#707070]" />
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent className="bg-white rounded-xl shadow-xl border border-gray-100 p-1 min-w-[140px] z-50">
                  <DropdownMenuItem 
                    className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-destructive hover:bg-destructive/5 rounded-lg cursor-pointer outline-none"
                    onClick={() => onDelete(post.id)}
                  >
                    <Trash2 size={14} /> Supprimer
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer outline-none">
                    <ShieldAlert size={14} /> Modérer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </div>

          <div className="px-4 pb-3">
            <div className="text-sm font-medium text-[#1a1a1a] mb-3 leading-snug">
              <RichText content={post.content} entities={post.entities} />
            </div>

            {post.location && (
              <div className="flex items-center gap-1 text-[9px] text-primary font-black uppercase tracking-widest mb-3">
                <MapPin size={12} /> {post.location.name}
              </div>
            )}

            {(post.image || (post.images && post.images.length > 0)) && (
              <div className="rounded-xl overflow-hidden mb-3 border border-gray-50 shadow-inner bg-gray-50">
                <img 
                  src={post.image || post.images?.[0]} 
                  className="w-full h-auto object-cover max-h-[360px]" 
                  alt="Post content" 
                />
              </div>
            )}

            {post.poll && <PollDisplay poll={post.poll} />}
          </div>

          <div className="px-4 py-2 flex items-center justify-between border-t border-[#f8f8f8]">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center border border-white">
                  <ThumbsUp size={8} className="text-white fill-current" />
                </div>
                <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center border border-white">
                  <Heart size={8} className="text-white fill-current" />
                </div>
              </div>
              <span className="text-[10px] text-[#707070] font-bold">
                {(post.stats?.likeCount || 0) + (post.stats?.heartCount || 0) + (post.stats?.flameCount || 0)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#707070] font-bold uppercase tracking-tighter">
              <span>{post.stats?.replyCount || 0} Commentaires</span>
              <span className="opacity-30">•</span>
              <span>{post.stats?.repostCount || 0} Partages</span>
            </div>
          </div>

          <div className="px-3 py-1.5 flex items-center justify-around bg-gray-50/20">
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg text-[#707070] font-bold text-xs cursor-default opacity-40">
              <ThumbsUp size={16} />
              <span>J'aime</span>
            </div>
            <button 
              onClick={() => onCommentClick(post)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-[#707070] hover:bg-gray-50 transition-all font-bold text-xs"
            >
              <MessageCircle size={16} />
              <span>Commenter</span>
            </button>
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg text-[#707070] font-bold text-xs cursor-default opacity-40">
              <Share2 size={16} />
              <span>Partager</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Moderation = () => {
  const { selectedCommunityId } = useCommunity();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => { 
    if (selectedCommunityId) {
      fetchData(); 
    }
  }, [selectedCommunityId]);

  const fetchData = async () => {
    if (!selectedCommunityId) return;
    try {
      setLoading(true);
      const postsRes = await postService.getAll(selectedCommunityId);
      setPosts(postsRes.data || []);
    } catch (err) { 
      toast.error('Erreur chargement'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce post ?')) return;
    try {
      await postService.delete(id);
      setPosts(posts.filter(p => p.id !== id));
      toast.success('Post supprimé');
    } catch (err) { 
      toast.error('Erreur suppression'); 
    }
  };

  const [selectedPostForComments, setSelectedPostForComments] = useState<any | null>(null);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12 relative overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">Modération & Social</h2>
          <p className="text-xs text-gray-400 font-medium tracking-wide">Contrôle et animation du contenu communautaire.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Rechercher..." className="pl-9 h-9 w-full sm:w-48 bg-white border-gray-100 shadow-sm rounded-xl text-xs" />
          </div>
          <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-gray-100 bg-white font-bold text-gray-600 gap-1.5 shadow-sm text-[11px]">
            <Filter size={14} /> Filtre
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="h-11 bg-muted/50 rounded-xl p-1 border mb-6 w-fit">
          <TabsTrigger value="posts" className="rounded-lg font-bold px-6 text-[10px] uppercase tracking-tight h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200">Posts</TabsTrigger>
          <TabsTrigger value="rooms" className="rounded-lg font-bold px-6 text-[10px] uppercase tracking-tight h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200">Chats</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg font-bold px-6 text-[10px] uppercase tracking-tight h-full data-[state=active]:bg-background data-[state=active]:text-destructive data-[state=active]:shadow-sm transition-all duration-200">Signalements</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence mode="popLayout">
                {posts.length > 0 ? posts.map((post) => (
                  <PostCard key={post.id} post={post} onDelete={handleDeletePost} onCommentClick={(p) => setSelectedPostForComments(p)} />
                )) : (
                  <div className="py-20 text-center bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                    <MessageSquare size={40} className="mx-auto text-gray-100 mb-4" />
                    <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">Aucun post à modérer</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-4 space-y-4 hidden lg:block">
              <Card className="border-none shadow-sm bg-white rounded-3xl p-6 sticky top-28 border border-gray-50">
                <div className="space-y-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1a1a]">Vue d'ensemble</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Statistiques de la semaine</p>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-1">Flux Social</p>
                      <p className="text-2xl font-black text-[#1a1a1a]">{posts.length}</p>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-1">Croissance</p>
                      <p className="text-2xl font-black text-primary">+12.5%</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full h-11 rounded-xl font-bold text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:bg-gray-50 border-gray-200 shadow-sm">
                    Télécharger le rapport
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="outline-none">
          {selectedCommunityId ? (
            <ModerationChat communityId={selectedCommunityId} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] border border-dashed rounded-3xl opacity-40 bg-gray-50/50">
              <MessageSquare size={48} className="mb-4 text-muted-foreground" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sélectionnez une communauté</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="outline-none">
          <Card className="border-none shadow-sm bg-white rounded-3xl py-24 text-center space-y-6 border border-gray-50">
            <div className="h-24 w-24 rounded-full bg-green-50 flex items-center justify-center mx-auto shadow-inner border border-green-100/50">
              <ShieldAlert size={44} className="text-green-500" />
            </div>
            <div className="max-w-xs mx-auto px-4">
              <h4 className="text-xl font-black text-[#1a1a1a] tracking-tight">Espace sécurisé</h4>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed mt-2 uppercase tracking-wide">Tout est sous contrôle. Aucun signalement en attente de modération.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {selectedPostForComments && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedPostForComments(null)} 
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90]" 
            />
            <CommentsSidebar post={selectedPostForComments} onClose={() => setSelectedPostForComments(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Moderation;
