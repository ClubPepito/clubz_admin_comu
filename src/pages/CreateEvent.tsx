import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Type, 
  Plus, 
  Trash2, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Rocket,
  Loader2,
  Users,
  Ticket
} from 'lucide-react';
import { eventService } from '../services/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommunity } from '../context/CommunityContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { selectedCommunityId, communities } = useCommunity();
  const [tab, setTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiUrl, setAiUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    visibility: 'public',
    communityId: selectedCommunityId || '',
    capacity: 100,
    ticketTypes: [
      { name: 'Regular', price: 0, totalQuantity: 100, order: 0, isHidden: false }
    ]
  });

  useEffect(() => {
    if (selectedCommunityId && !formData.communityId) {
      setFormData(prev => ({ ...prev, communityId: selectedCommunityId }));
    }
  }, [selectedCommunityId]);

  const handleAiGenerate = async () => {
    if (!aiUrl) return toast.error('Veuillez entrer une URL');
    setLoading(true);
    try {
      const res = await eventService.autoGenerate(aiUrl);
      const data = res.data;
      
      setFormData({
        ...formData,
        title: data.title || formData.title,
        description: data.description || formData.description,
        location: data.location || formData.location,
        startDate: data.startDate ? data.startDate.substring(0, 16) : formData.startDate,
        endDate: data.endDate ? data.endDate.substring(0, 16) : formData.endDate,
        ticketTypes: data.ticketTypes || formData.ticketTypes
      });
      
      toast.success('Données générées par l\'IA !');
    } catch (err) {
      toast.error('Erreur lors de la génération IA');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.communityId) {
      return toast.error('Veuillez remplir les informations obligatoires (Titre, Dates, Communauté)');
    }

    setSubmitting(true);
    try {
      await eventService.create(formData);
      toast.success('LANCEMENT RÉUSSI !');
      navigate('/events');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const addTicketType = () => {
    setFormData({
      ...formData,
      ticketTypes: [
        ...formData.ticketTypes,
        { name: 'Nouveau Tier', price: 0, totalQuantity: 50, order: formData.ticketTypes.length, isHidden: formData.ticketTypes.length > 0 }
      ]
    });
  };

  const removeTicketType = (index: number) => {
    const newTiers = [...formData.ticketTypes];
    newTiers.splice(index, 1);
    setFormData({ ...formData, ticketTypes: newTiers });
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight">Créer un événement</h2>
        <p className="text-sm text-muted-foreground font-medium">Configurez votre événement Clubz avec puissance et précision.</p>
      </div>

      <Card className="border-2 border-primary/20 bg-primary/[0.03] rounded-[2rem] overflow-hidden shadow-xl shadow-primary/5">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
              <Sparkles className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <CardTitle className="text-lg font-black">Assistant IA Magic</CardTitle>
              <CardDescription className="text-xs font-medium">L'IA s'occupe de tout pour vous.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="flex gap-3">
            <Input 
              placeholder="Shotgun, Resident Advisor, Instagram URL..." 
              className="h-11 bg-background border-2 border-transparent focus-visible:border-primary/30 rounded-xl shadow-sm text-sm font-medium px-4 transition-all"
              value={aiUrl}
              onChange={(e) => setAiUrl(e.target.value)}
            />
            <Button onClick={handleAiGenerate} disabled={loading} className="h-11 px-6 rounded-xl font-black gap-2 shrink-0 shadow-lg shadow-primary/10">
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Générer'} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Stepper */}
      <div className="relative mb-10">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-muted/20 rounded-full" />
        
        {/* Active Progress Line */}
        <div 
          className={cn(
            "absolute top-6 h-1 bg-primary rounded-full transition-all duration-500 ease-in-out shadow-[0_0_15px_rgba(var(--primary),0.5)]",
            tab === 'general' ? "left-6 w-0" : tab === 'tickets' ? "left-6 w-[calc(50%-24px)]" : "left-6 right-6"
          )}
        />

        <div className="relative flex justify-between">
          {[
            { id: 'general', label: 'Informations', icon: Sparkles },
            { id: 'tickets', label: 'Billetterie', icon: Ticket },
            { id: 'visibility', label: 'Publication', icon: Eye }
          ].map((step, index) => {
            const isActive = tab === step.id;
            const isPast = (tab === 'tickets' && step.id === 'general') || (tab === 'visibility' && (step.id === 'general' || step.id === 'tickets'));
            
            return (
              <button
                key={step.id}
                onClick={() => setTab(step.id)}
                className="flex flex-col items-center gap-3 group transition-all"
              >
                <div className={cn(
                  "relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                  isActive 
                    ? "bg-background border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-110" 
                    : isPast 
                      ? "bg-primary border-primary text-white" 
                      : "bg-background border-muted/30 text-muted-foreground hover:border-muted-foreground/50"
                )}>
                  <step.icon className={cn("h-5 w-5", isActive ? "text-primary" : "")} strokeWidth={2.5} />
                  {isPast && !isActive && <div className="absolute -right-1 -top-1 bg-green-500 rounded-full p-1 border-2 border-background"><Plus className="h-2 w-2 rotate-45 text-white" /></div>}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsContent value="general">
          <Card className="border-none shadow-2xl rounded-[2rem] bg-card/80 backdrop-blur-md">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black tracking-tight">Détails cruciaux</CardTitle>
              <CardDescription className="text-sm font-medium">Commencez par les fondations de votre événement.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Communauté Organisatrice</Label>
                  <Select 
                    value={formData.communityId} 
                    onValueChange={(val) => setFormData({...formData, communityId: val})}
                  >
                    <SelectTrigger size="lg" className="pl-11 relative text-left">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
                      <span className="truncate">
                        {formData.communityId 
                          ? (communities.find(c => c.id === formData.communityId)?.name || "Chargement...") 
                          : "Choisir une communauté"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {communities.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nom de l'événement</Label>
                  <div className="relative group">
                    <Type className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={2.5} />
                    <Input 
                      id="title" 
                      size="lg"
                      placeholder="ex: LA NUIT LIQUIDE" 
                      className="pl-12"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Début</Label>
                  <div className="relative group">
                    <CalendarIcon className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={2.5} />
                    <Input type="datetime-local" size="lg" className="pl-12 [color-scheme:light]" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Fin</Label>
                  <div className="relative group">
                    <CalendarIcon className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={2.5} />
                    <Input type="datetime-local" size="lg" className="pl-12 [color-scheme:light]" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Localisation</Label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={2.5} />
                  <Input placeholder="Rechercher un lieu..." size="lg" className="pl-12" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">À propos de l'événement</Label>
                <textarea 
                  className="w-full min-h-[180px] rounded-2xl border-2 border-transparent bg-muted/20 px-6 py-4 text-base font-medium shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary/30 transition-all resize-none"
                  placeholder="Décrivez l'ambiance, le line-up, les règles..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setTab('tickets')} className="h-14 px-10 rounded-2xl font-black gap-2 shadow-xl shadow-primary/20">
                  Suivant <ChevronRight size={20} strokeWidth={3} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card/80 backdrop-blur-md overflow-hidden">
            <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">Stratégie de Billetterie</CardTitle>
                <CardDescription className="text-base font-medium">Maximisez vos revenus avec des tiers dynamiques.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addTicketType} className="h-10 px-4 rounded-xl font-bold gap-2 border-2 border-primary/20 text-primary hover:bg-primary/5">
                <Plus size={16} strokeWidth={2.5} /> Nouveau Tier
              </Button>
            </CardHeader>
            <CardContent className="p-10 pt-6 space-y-6">
              {formData.ticketTypes.map((tier, idx) => (
                <div key={idx} className="flex gap-4 items-end border-2 border-muted/30 p-6 rounded-[1.5rem] bg-muted/10 hover:border-primary/20 transition-all group">
                  <div className="flex-1 space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Désignation</Label>
                    <Input className="h-12 bg-background border-none shadow-sm font-bold text-base rounded-xl" value={tier.name} onChange={(e) => {
                      const newTiers = [...formData.ticketTypes];
                      newTiers[idx].name = e.target.value;
                      setFormData({...formData, ticketTypes: newTiers});
                    }} />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Prix (€)</Label>
                    <Input type="number" className="h-12 bg-background border-none shadow-sm font-black text-lg rounded-xl" value={tier.price} onChange={(e) => {
                      const newTiers = [...formData.ticketTypes];
                      newTiers[idx].price = Number(e.target.value);
                      setFormData({...formData, ticketTypes: newTiers});
                    }} />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Stock</Label>
                    <Input type="number" className="h-12 bg-background border-none shadow-sm font-bold text-base rounded-xl" value={tier.totalQuantity} onChange={(e) => {
                      const newTiers = [...formData.ticketTypes];
                      newTiers[idx].totalQuantity = Number(e.target.value);
                      setFormData({...formData, ticketTypes: newTiers});
                    }} />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-12 w-12 rounded-xl transition-all ${tier.isHidden ? 'bg-muted/50 text-muted-foreground' : 'bg-primary/10 text-primary shadow-sm shadow-primary/10'}`}
                      onClick={() => {
                        const newTiers = [...formData.ticketTypes];
                        newTiers[idx].isHidden = !newTiers[idx].isHidden;
                        setFormData({...formData, ticketTypes: newTiers});
                      }}
                    >
                      {tier.isHidden ? <EyeOff size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeTicketType(idx)} className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10">
                      <Trash2 size={20} strokeWidth={2.5} />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between pt-10">
                <Button variant="ghost" onClick={() => setTab('general')} className="h-12 px-6 rounded-xl font-bold gap-2">
                  <ChevronLeft size={18} strokeWidth={2.5} /> Retour
                </Button>
                <Button onClick={() => setTab('visibility')} className="h-12 px-8 rounded-xl font-black gap-2 shadow-lg shadow-primary/10">
                  Continuer <ChevronRight size={18} strokeWidth={2.5} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card/80 backdrop-blur-md">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black tracking-tight">Visibilité & Diffusion</CardTitle>
              <CardDescription className="text-base font-medium">Choisissez qui peut découvrir et rejoindre votre univers.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-6 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  className={`group relative p-8 rounded-[2rem] border-4 cursor-pointer transition-all duration-300 ${formData.visibility === 'public' ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-[1.02]' : 'border-muted/30 hover:border-muted'}`}
                  onClick={() => setFormData({...formData, visibility: 'public'})}
                >
                  <div className={`h-14 w-14 rounded-2xl mb-6 flex items-center justify-center transition-all ${formData.visibility === 'public' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground group-hover:bg-muted/50'}`}>
                    <Globe className="h-8 w-8" strokeWidth={2.5} />
                  </div>
                  <h4 className={`text-xl font-black mb-2 transition-colors ${formData.visibility === 'public' ? 'text-primary' : 'text-foreground'}`}>Public Radar</h4>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">Visible par tous sur la carte interactive. Idéal pour attirer de nouveaux membres.</p>
                </div>
                
                <div 
                  className={`group relative p-8 rounded-[2rem] border-4 cursor-pointer transition-all duration-300 ${formData.visibility === 'community_only' ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-[1.02]' : 'border-muted/30 hover:border-muted'}`}
                  onClick={() => setFormData({...formData, visibility: 'community_only'})}
                >
                  <div className={`h-14 w-14 rounded-2xl mb-6 flex items-center justify-center transition-all ${formData.visibility === 'community_only' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground group-hover:bg-muted/50'}`}>
                    <Lock className="h-8 w-8" strokeWidth={2.5} />
                  </div>
                  <h4 className={`text-xl font-black mb-2 transition-colors ${formData.visibility === 'community_only' ? 'text-primary' : 'text-foreground'}`}>Exclusif Communauté</h4>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">Seuls les membres de votre communauté Clubz peuvent voir et s'inscrire.</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-muted/20 p-8 rounded-[2rem]">
                <Button variant="ghost" onClick={() => setTab('tickets')} className="h-12 px-6 rounded-xl font-bold gap-2">
                  <ChevronLeft size={18} strokeWidth={2.5} /> Retour
                </Button>
                <Button 
                  className="h-16 px-12 rounded-2xl font-black text-lg gap-3 shadow-2xl shadow-primary/30 hover:scale-105 transition-all disabled:opacity-50" 
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="animate-spin h-6 w-6" /> : <>LANCER L'ÉVÉNEMENT <Rocket size={24} strokeWidth={2.5} /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateEvent;
