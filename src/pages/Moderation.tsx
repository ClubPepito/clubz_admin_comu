import { useState, useEffect, useRef } from 'react';
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
  Plus,
  Send,
  Image as ImageIcon,
  X,
  MessageCircle,
  Hash,
  ChevronLeft,
  Smile,
  MapPin,
  Check,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { postService, communityService, storageService, chatService } from '../services/api';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

// Mock data for comments since backend doesn't have it yet
const MOCK_COMMENTS = [
  {
    id: '1',
    author: { name: 'Sarah Wilson', email: 'sarah@example.com' },
    content: 'Incroyable cette photo ! Ça donne trop envie d\'y être.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    author: { name: 'Marc Dupont', email: 'marc@example.com' },
    content: 'On organise une sortie là-bas bientôt ?',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  }
];

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
          <p className="text-[10px] text-gray-400 font-medium">{post.author?.name || 'Thomas'}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 hover:bg-gray-100">
          <X size={16} className="text-gray-400" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {MOCK_COMMENTS.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8 rounded-full mt-0.5">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.email}`} />
              <AvatarFallback className="bg-gray-100 text-[10px]">{comment.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-bold text-[#1a1a1a]">{comment.author.name}</span>
                  <span className="text-[9px] text-gray-400">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-normal">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-50 bg-gray-50/30">
        <div className="relative">
          <textarea 
            placeholder="Écrire..."
            className="w-full bg-white border border-gray-100 rounded-xl p-3 pr-10 text-[11px] font-medium outline-none resize-none min-h-[40px] shadow-sm"
          />
          <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#247596] hover:scale-110 transition-transform">
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const PostCard = ({ post, onDelete, onCommentClick }: { post: any, onDelete: (id: string) => void, onCommentClick: (post: any) => void }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group relative"
    >
      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-4 transition-all hover:shadow-md">
        <CardContent className="p-0">
          <div className="p-4 pb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-full bg-[#247596] shadow-sm">
                <AvatarImage src={post.author?.avatarUrl || post.user?.avatarUrl} />
                <AvatarFallback className="text-white text-sm font-bold">
                  {(post.author?.name || post.user?.name || "T")[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#1a1a1a]">{post.author?.name || post.user?.name || 'Thomas'}</span>
                <div className="flex items-center gap-1.5 text-[10px] text-[#707070]">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>•</span>
                  <span className="text-[#247596] font-bold uppercase tracking-tight">#{post.community?.name || 'COMMUNITY'}</span>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1.5 hover:bg-gray-50 rounded-full transition-colors outline-none">
                <MoreVertical size={18} className="text-[#707070]" />
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent className="bg-white rounded-lg shadow-xl border border-gray-100 p-1 min-w-[140px] z-50">
                  <DropdownMenuItem 
                    className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold text-destructive hover:bg-destructive/5 rounded-md cursor-pointer outline-none"
                    onClick={() => onDelete(post.id)}
                    variant="destructive"
                  >
                    <Trash2 size={14} /> Supprimer
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer outline-none">
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
              <div className="flex items-center gap-1 text-[9px] text-[#247596] font-black uppercase tracking-widest mb-3">
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
                <div className="h-4 w-4 rounded-full bg-[#247596] flex items-center justify-center border border-white">
                  <ThumbsUp size={8} className="text-white fill-current" />
                </div>
                <div className="h-4 w-4 rounded-full bg-[#ff4d4d] flex items-center justify-center border border-white">
                  <Heart size={8} className="text-white fill-current" />
                </div>
              </div>
              <span className="text-[10px] text-[#707070] font-bold">{post.reactionsCount || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#707070] font-bold uppercase tracking-tighter">
              <span>{post.commentsCount || 0} Comments</span>
              <span className="opacity-30">•</span>
              <span>{post.sharesCount || 0} Shares</span>
            </div>
          </div>

          <div className="px-3 py-1.5 flex items-center justify-around bg-gray-50/20">
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg text-[#707070] font-bold text-xs cursor-default opacity-40">
              <ThumbsUp size={16} />
              <span>Like</span>
            </div>
            <button 
              onClick={() => onCommentClick(post)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-[#707070] hover:bg-gray-50 transition-all font-bold text-xs"
            >
              <MessageCircle size={16} />
              <span>Comment</span>
            </button>
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg text-[#707070] font-bold text-xs cursor-default opacity-40">
              <Share2 size={16} />
              <span>Share</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CreatePost = ({ onPostCreated }: { onPostCreated: () => void }) => {
  const { selectedCommunityId } = useCommunity();
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = async () => {
    if (!content.trim() && mediaUrls.length === 0) return;
    try {
      await postService.create({
        content,
        images: mediaUrls.length > 1 ? mediaUrls : undefined,
        image: mediaUrls.length === 1 ? mediaUrls[0] : undefined,
        communityId: selectedCommunityId
      });
      setContent('');
      setMediaUrls([]);
      onPostCreated();
      toast.success('Post publié !');
    } catch (err) {
      toast.error('Erreur lors de la publication');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setUploading(true);
      const promises = files.map(file => storageService.upload(file));
      const results = await Promise.all(promises);
      setMediaUrls([...mediaUrls, ...results.map(r => r.data.url)]);
      toast.success('Médias ajoutés');
    } catch (err) {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-6">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 rounded-full ring-2 ring-gray-50">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=admin`} />
            <AvatarFallback className="text-[10px]">AD</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Exprimez-vous..."
              className="w-full bg-gray-50 rounded-xl p-3 border-none focus:ring-1 focus:ring-primary/20 text-xs font-medium placeholder:text-gray-400 resize-none min-h-[60px]"
            />
            {mediaUrls.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative shrink-0">
                    <img src={url} className="h-14 w-14 object-cover rounded-lg border border-gray-100 shadow-sm" alt="Preview" />
                    <button onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== idx))} className="absolute -top-1.5 -right-1.5 bg-destructive text-white p-0.5 rounded-full shadow-sm">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-gray-50">
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 w-8 rounded-full text-primary hover:bg-primary/5">
                  <ImageIcon size={18} />
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" multiple />
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-50">
                  <Smile size={18} />
                </Button>
              </div>
              <Button onClick={handlePost} disabled={!content.trim() && mediaUrls.length === 0 || uploading} className="h-8 px-4 rounded-lg font-bold text-[10px] bg-[#247596] hover:bg-[#1e617d] text-white">
                {uploading ? <Loader2 className="animate-spin h-3 w-3" /> : 'Publier'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ChatModeratorView = ({ room, onBack }: { room: any, onBack: () => void }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [room.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await chatService.getByRoom(room.id);
      setMessages(res.data || []);
    } catch (err) { toast.error('Erreur chat'); } finally { setLoading(false); }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await chatService.delete(id);
      setMessages(messages.map(m => m.id === id ? { ...m, isDeleted: true, content: 'Supprimé' } : m));
      toast.success('Supprimé');
    } catch (err) { toast.error('Erreur'); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-[65vh] bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
      <div className="p-4 border-b border-gray-50 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 rounded-full">
          <ChevronLeft size={18} className="text-gray-400" />
        </Button>
        <div className="h-10 w-10 rounded-xl bg-[#247596]/10 flex items-center justify-center text-[#247596]">
          <Hash size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1a1a1a]">{room.name}</h3>
          <p className="text-[9px] text-success font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-success animate-pulse" /> Live
          </p>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-gray-50/20">
        {loading ? <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-[#247596]" size={24} /></div> :
          messages.length === 0 ? <div className="flex flex-col items-center justify-center h-full opacity-20"><MessageSquare size={48} /><p className="text-[10px] font-bold mt-2 uppercase">Vide</p></div> :
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 group">
              <Avatar className="h-8 w-8 rounded-full mt-0.5">
                <AvatarImage src={msg.sender?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.email}`} />
                <AvatarFallback className="bg-gray-100 text-[10px]">{msg.sender?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#1a1a1a]">{msg.sender?.name}</span>
                  {!msg.isDeleted && <button onClick={() => handleDeleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 text-destructive p-0.5"><Trash2 size={12} /></button>}
                </div>
                <div className={cn("p-2.5 rounded-xl text-[11px] font-medium w-fit max-w-[90%] border shadow-sm", msg.isDeleted ? "bg-gray-50 text-gray-400 italic border-gray-100" : "bg-white text-[#1a1a1a] border-gray-100")}>{msg.content}</div>
              </div>
            </div>
          ))
        }
      </div>
    </motion.div>
  );
};

const Moderation = () => {
  const { selectedCommunityId } = useCommunity();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState<any | null>(null);

  useEffect(() => { fetchData(); }, [selectedCommunityId]);

  const fetchData = async () => {
    if (!selectedCommunityId) return;
    try {
      setLoading(true);
      const [postsRes, channelsRes] = await Promise.all([
        postService.getAll(selectedCommunityId),
        communityService.getChannels(selectedCommunityId)
      ]);
      setPosts(postsRes.data || []);
      setRooms(channelsRes.data || []);
    } catch (err) { toast.error('Erreur chargement'); } finally { setLoading(false); }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce post ?')) return;
    try {
      await postService.delete(id);
      setPosts(posts.filter(p => p.id !== id));
      toast.success('Post supprimé');
    } catch (err) { toast.error('Erreur suppression'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={32} className="animate-spin text-[#247596]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12 relative overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">Modération & Social</h2>
          <p className="text-xs text-gray-400 font-medium">Contrôle du contenu communautaire.</p>
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
        <TabsList className="h-10 bg-gray-100/50 rounded-lg p-1 border border-gray-200/50 mb-6 w-fit">
          <TabsTrigger value="posts" className="rounded-md font-bold px-5 text-[10px] uppercase tracking-tight h-full data-[state=active]:bg-white data-[state=active]:text-[#247596] data-[state=active]:shadow-sm transition-all duration-200">Posts</TabsTrigger>
          <TabsTrigger value="rooms" className="rounded-md font-bold px-5 text-[10px] uppercase tracking-tight h-full data-[state=active]:bg-white data-[state=active]:text-[#247596] data-[state=active]:shadow-sm transition-all duration-200">Chats</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-md font-bold px-5 text-[10px] uppercase tracking-tight h-full data-[state=active]:bg-white data-[state=active]:text-destructive data-[state=active]:shadow-sm transition-all duration-200">Signalements</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <CreatePost onPostCreated={fetchData} />
              <AnimatePresence mode="popLayout">
                {posts.length > 0 ? posts.map((post) => (
                  <PostCard key={post.id} post={post} onDelete={handleDeletePost} onCommentClick={(p) => setSelectedPostForComments(p)} />
                )) : <div className="py-12 text-center bg-white rounded-2xl shadow-sm border border-gray-50"><MessageSquare size={40} className="mx-auto text-gray-100 mb-2" /><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aucun post</p></div>}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-4 space-y-4 hidden lg:block">
              <Card className="border-none shadow-sm bg-white rounded-2xl p-6 sticky top-28 border border-gray-50">
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-[#247596]/10 flex items-center justify-center text-[#247596]"><ShieldAlert size={20} /></div>
                  <h3 className="text-lg font-bold text-[#1a1a1a]">Statistiques</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Posts Totaux</p>
                      <p className="text-xl font-bold text-[#1a1a1a]">{posts.length}</p>
                    </div>
                    <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Engagement</p>
                      <p className="text-xl font-bold text-[#247596]">+12%</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full h-9 rounded-lg font-bold text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-50">Exporter</Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="outline-none">
          <AnimatePresence mode="wait">
            {!selectedRoom ? (
              <motion.div key="room-grid" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card onClick={() => {}} className="h-full border border-dashed border-gray-200 bg-gray-50/30 flex flex-col items-center justify-center p-6 text-center space-y-2 hover:border-[#247596] hover:bg-white transition-all cursor-pointer rounded-2xl group min-h-[140px]">
                  <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#247596] group-hover:bg-[#247596] group-hover:text-white transition-all"><Plus size={20} /></div>
                  <h4 className="font-bold text-xs text-gray-500">Nouveau</h4>
                </Card>
                {rooms.map((room) => (
                  <Card key={room.id} onClick={() => setSelectedRoom(room)} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all group cursor-pointer border border-gray-50 flex flex-col h-full min-h-[140px]">
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="h-10 w-10 rounded-xl bg-[#247596]/5 flex items-center justify-center text-[#247596] group-hover:scale-105 transition-all"><MessageSquare size={18} /></div>
                        <Badge className="bg-success/10 text-success border-none text-[8px] font-bold uppercase px-2 py-0.5 rounded-full">Actif</Badge>
                      </div>
                      <h3 className="text-sm font-bold text-[#1a1a1a] mb-1 line-clamp-1 group-hover:text-[#247596] transition-colors">{room.name}</h3>
                      <p className="text-[10px] text-gray-400 leading-tight line-clamp-2">{room.description || "Discussion communautaire."}</p>
                    </div>
                  </Card>
                ))}
              </motion.div>
            ) : <ChatModeratorView room={selectedRoom} onBack={() => setSelectedRoom(null)} />}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="reports" className="outline-none">
          <Card className="border-none shadow-sm bg-white rounded-2xl py-20 text-center space-y-4 border border-gray-50">
            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto shadow-inner"><ShieldAlert size={40} className="text-success" /></div>
            <div className="max-w-xs mx-auto">
              <h4 className="text-lg font-bold text-[#1a1a1a]">Tout est en ordre</h4>
              <p className="text-[11px] text-gray-400 mt-1">Aucun signalement en attente pour le moment.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {selectedPostForComments && (
          <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPostForComments(null)} className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[90]" />
          <CommentsSidebar post={selectedPostForComments} onClose={() => setSelectedPostForComments(null)} /></>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Moderation;
