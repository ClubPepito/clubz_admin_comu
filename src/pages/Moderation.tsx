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
  User,
  Plus
} from 'lucide-react';
import { postService, communityService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from 'react-hot-toast';

const Moderation = () => {
  const { selectedCommunityId } = useCommunity();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [selectedCommunityId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsRes, channelsRes] = await Promise.all([
        postService.getAll(selectedCommunityId),
        communityService.getChannels(selectedCommunityId)
      ]);
      setPosts(postsRes.data || []);
      setRooms(channelsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch moderation data', err);
      toast.error('Erreur lors du chargement des données');
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
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">Modération & Social</h2>
          <p className="text-sm text-muted-foreground font-medium">Veillez à la sécurité et à l'engagement de vos communautés.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={2.5} />
            <Input placeholder="Rechercher..." className="pl-12 h-10 w-64 bg-muted/20 border-none shadow-sm rounded-xl font-bold text-sm" />
          </div>
          <Button variant="outline" className="h-10 rounded-xl border-2 font-bold gap-2">
            <Filter size={18} /> Filtrer
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="h-12 bg-muted/30 rounded-xl p-1.5 border-none mb-8">
          <TabsTrigger value="posts" className="rounded-lg font-black uppercase text-[10px] tracking-widest px-8 data-[state=active]:bg-card data-[state=active]:text-primary transition-all">Flux de Posts</TabsTrigger>
          <TabsTrigger value="rooms" className="rounded-lg font-black uppercase text-[10px] tracking-widest px-8 data-[state=active]:bg-card data-[state=active]:text-primary transition-all">Salons de Chat</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg font-black uppercase text-[10px] tracking-widest px-8 data-[state=active]:bg-card data-[state=active]:text-primary transition-all">Signalements</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="border-none shadow-lg bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden group">
                <CardHeader className="p-5 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.email}`} />
                        <AvatarFallback><User size={14} /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-black">{post.user?.name}</p>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-4">
                  <p className="text-sm font-medium leading-relaxed mb-4">{post.content}</p>
                  {post.mediaUrl && (
                    <div className="rounded-lg overflow-hidden mb-4 aspect-video bg-muted/20">
                      <img src={post.mediaUrl} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Heart size={14} className={post.isLiked ? "fill-primary text-primary" : ""} /> {post.likesCount || 0}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <MessageSquare size={14} /> {post.commentsCount || 0}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeletePost(post.id)}
                      className="h-8 px-3 rounded-lg text-destructive hover:bg-destructive/10 gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Trash2 size={14} /> Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-dashed border-muted-foreground/20 bg-transparent flex flex-col items-center justify-center p-8 text-center space-y-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer rounded-xl group">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Plus size={24} />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest">Nouveau Salon</h4>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Créez un espace thématique.</p>
              </div>
            </Card>

            {rooms.map((room) => (
              <Card key={room.id} className="border-none shadow-lg bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-all">
                <CardHeader className="p-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <MessageSquare size={20} />
                  </div>
                  <CardTitle className="text-base font-black tracking-tight">{room.name}</CardTitle>
                  <CardDescription className="text-xs font-medium line-clamp-1">{room.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-6 w-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[8px] font-black uppercase">U</div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{room.memberCount || 0} membres</span>
                  </div>
                  <Badge className="bg-success/10 text-success border-none text-[8px] font-black uppercase tracking-widest">Actif</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="">
          <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                <ShieldAlert size={40} className="text-success opacity-40" />
              </div>
              <div>
                <h4 className="text-xl font-black">Tout est calme !</h4>
                <p className="text-sm text-muted-foreground font-medium mt-2">Aucun signalement n'a été effectué récemment.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Moderation;
