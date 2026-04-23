import { useState, useEffect } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { 
  Settings, 
  Users, 
  ShieldCheck, 
  LayoutGrid, 
  CheckCircle2, 
  XCircle, 
  Palette, 
  Image as ImageIcon,
  Save,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react';
import { communityService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const CommunitySettings = () => {
  const { selectedCommunityId, communities } = useCommunity();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');
  const [community, setCommunity] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [widgets, setWidgets] = useState<any[]>([]);

  useEffect(() => {
    if (selectedCommunityId) {
      fetchData();
    }
  }, [selectedCommunityId]);

  const fetchData = async () => {
    if (!selectedCommunityId) return;
    try {
      setLoading(true);
      const [commRes, membersRes, requestsRes, widgetsRes] = await Promise.all([
        communityService.getOne(selectedCommunityId),
        communityService.getMembers(selectedCommunityId),
        communityService.getPendingRequests(selectedCommunityId),
        communityService.getWidgets(selectedCommunityId).catch(() => ({ data: [] })) // Handle if endpoint missing
      ]);
      
      setCommunity(commRes.data);
      setMembers(membersRes.data || []);
      setPendingRequests(requestsRes.data || []);
      setWidgets(widgetsRes.data || [
        { id: 'spotify', name: 'Spotify Player', description: 'Permet aux membres de partager leurs playlists.', enabled: true },
        { id: 'instagram', name: 'Feed Instagram', description: 'Affiche les derniers posts de la communauté.', enabled: false },
        { id: 'gamification', name: 'Système de Points', description: 'Récompense l\'engagement des membres.', enabled: true },
      ]);
    } catch (err) {
      console.error('Failed to fetch settings', err);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await communityService.update(selectedCommunityId!, community);
      toast.success('Paramètres mis à jour !');
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleRequest = async (userId: string, action: 'accept' | 'reject') => {
    try {
      await communityService.respondToRequest(selectedCommunityId!, userId, action);
      toast.success(action === 'accept' ? 'Membre accepté !' : 'Demande refusée');
      setPendingRequests(prev => prev.filter(r => r.userId !== userId));
    } catch (err) {
      toast.error('Erreur lors de la réponse à la demande');
    }
  };

  if (!selectedCommunityId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-6 rounded-full bg-muted/20">
          <Settings size={48} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-black">Sélectionnez une communauté</h2>
        <p className="text-muted-foreground font-medium text-center max-w-md">
          Veuillez choisir une communauté dans la barre latérale pour accéder à ses paramètres avancés.
        </p>
      </div>
    );
  }

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
          <h2 className="text-3xl font-black tracking-tight">Paramètres de {community?.name}</h2>
          <p className="text-sm text-muted-foreground font-medium">Gérez l'identité et les membres de votre univers.</p>
        </div>
        <Button onClick={handleUpdate} disabled={saving} className="h-10 px-6 rounded-xl font-black gap-2 shadow-lg shadow-primary/10">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Sauvegarder
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 h-12 bg-muted/20 backdrop-blur-xl rounded-xl p-1.5 border-none shadow-inner overflow-hidden">
          <TabsTrigger value="general" className="rounded-lg gap-2 font-black uppercase text-[10px] tracking-widest transition-all">
            <Palette className="h-4 w-4" /> Identité
          </TabsTrigger>
          <TabsTrigger value="members" className="rounded-lg gap-2 font-black uppercase text-[10px] tracking-widest transition-all">
            <Users className="h-4 w-4" /> Membres
          </TabsTrigger>
          <TabsTrigger value="widgets" className="rounded-lg gap-2 font-black uppercase text-[10px] tracking-widest transition-all">
            <LayoutGrid className="h-4 w-4" /> Modules
          </TabsTrigger>
          <TabsTrigger value="requests" className="rounded-lg gap-2 font-black uppercase text-[10px] tracking-widest transition-all relative">
            <ShieldCheck className="h-4 w-4" /> Requêtes
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] h-4 w-4 rounded-full flex items-center justify-center shadow-lg">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black tracking-tight">Branding & Informations</CardTitle>
              <CardDescription className="text-sm font-medium">Configurez l'aspect visuel de votre communauté.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom de la Communauté</Label>
                    <Input 
                      value={community?.name} 
                      onChange={(e) => setCommunity({...community, name: e.target.value})}
                      className="h-12 text-base font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bio Courte</Label>
                    <textarea 
                      className="w-full min-h-[100px] rounded-xl border-2 border-transparent bg-muted/20 px-4 py-3 text-sm font-bold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary/30 transition-all resize-none"
                      value={community?.description}
                      onChange={(e) => setCommunity({...community, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-2xl bg-muted/20 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center relative overflow-hidden group">
                      {community?.logoUrl ? (
                        <img src={community.logoUrl} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon size={32} className="text-muted-foreground" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Plus size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-sm uppercase tracking-widest">Logo Officiel</h4>
                      <p className="text-xs text-muted-foreground font-medium">Recommandé: 512x512px (SVG ou PNG).</p>
                      <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg font-bold text-xs mt-2">Changer le logo</Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Couleur Identitaire</Label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={community?.primaryColor || '#0ea5e9'} 
                        onChange={(e) => setCommunity({...community, primaryColor: e.target.value})}
                        className="h-10 w-10 rounded-lg cursor-pointer border-none bg-transparent"
                      />
                      <Input 
                        value={community?.primaryColor || '#0ea5e9'} 
                        onChange={(e) => setCommunity({...community, primaryColor: e.target.value})}
                        className="h-10 font-mono text-xs w-32"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight">Gestion de l'Équipe</CardTitle>
                <CardDescription className="text-sm font-medium">Contrôlez qui peut administrer votre univers.</CardDescription>
              </div>
              <Button size="sm" className="h-10 px-4 rounded-xl font-bold gap-2">
                <Plus size={16} /> Inviter
              </Button>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <div className="space-y-3">
                {members.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-transparent hover:border-muted-foreground/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
                        {member.user?.name?.substring(0, 1) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{member.user?.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{member.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-background">
                        {member.role?.name || 'Membre'}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widgets" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <Card key={widget.id} className={cn(
              "border-none shadow-lg transition-all duration-300 rounded-xl overflow-hidden",
              widget.enabled ? "bg-primary/5 ring-1 ring-primary/20" : "bg-card/40 opacity-70 grayscale"
            )}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "p-2 rounded-lg",
                    widget.enabled ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {widget.id === 'spotify' && <LayoutGrid size={20} />}
                    {widget.id === 'instagram' && <ImageIcon size={20} />}
                    {widget.id === 'gamification' && <ShieldCheck size={20} />}
                  </div>
                  <Button 
                    variant={widget.enabled ? "default" : "outline"} 
                    size="sm" 
                    className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider"
                    onClick={() => {
                      setWidgets(prev => prev.map(w => w.id === widget.id ? {...w, enabled: !w.enabled} : w));
                    }}
                  >
                    {widget.enabled ? 'Activé' : 'Désactivé'}
                  </Button>
                </div>
                <CardTitle className="text-base font-black mt-4">{widget.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">{widget.description}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black tracking-tight">Demandes en Attente</CardTitle>
              <CardDescription className="text-sm font-medium">Nouveaux membres souhaitant rejoindre votre univers.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-muted/10 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-muted-foreground opacity-30" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Aucune demande d'adhésion pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-5 rounded-xl bg-muted/10 border-2 border-transparent hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary">
                          {request.user?.name?.substring(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-base">{request.user?.name}</p>
                          <p className="text-xs text-muted-foreground font-medium">{request.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => handleRequest(request.userId, 'reject')}
                          variant="ghost" 
                          className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10"
                        >
                          <XCircle size={20} />
                        </Button>
                        <Button 
                          onClick={() => handleRequest(request.userId, 'accept')}
                          className="h-10 px-6 rounded-xl font-black gap-2 shadow-lg shadow-primary/20"
                        >
                          <CheckCircle2 size={18} /> Accepter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunitySettings;
