import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import {
  Sparkles,
  Ticket,
  Eye,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  MapPin,
  Globe,
  Lock,
  Loader2,
  HelpCircle,
  Hash,
  Repeat,
  CheckCircle2,
  Users,
  XCircle
} from 'lucide-react';
import { eventService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEditMode = !!id;

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
    image: '',
    isRecurring: false,
    recurrenceRule: '',
    isOnline: false,
    shortLink: '',
    tags: [] as string[],
    coHostIds: [] as string[],
    ticketTypes: [
      { name: 'Regular', price: 0, totalQuantity: 100, order: 0, isHidden: false, points: 10, description: '', salesStartDate: '', salesEndDate: '' }
    ],
    customFields: [] as any[]
  });

  useEffect(() => {
    if (isEditMode) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await eventService.getOne(id!);
      const event = res.data;
      // Format dates for input datetime-local
      const format = (d: string) => d ? new Date(d).toISOString().slice(0, 16) : '';

      setFormData({
        ...event,
        startDate: format(event.startDate),
        endDate: format(event.endDate),
        ticketTypes: event.ticketTypes?.length > 0 ? event.ticketTypes : formData.ticketTypes,
        customFields: event.customFields || [],
        coHostIds: event.coHosts?.map((c: any) => c.id) || []
      });
    } catch (err) {
      toast.error('Erreur lors du chargement de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiUrl) return;
    try {
      setLoading(true);
      const res = await eventService.autoGenerate(aiUrl);
      const data = res.data;

      setFormData({
        ...formData,
        title: data.title || formData.title,
        description: data.description || formData.description,
        location: data.location || formData.location,
        image: data.image || formData.image,
        ticketTypes: data.ticketTypes?.length > 0 ? data.ticketTypes : formData.ticketTypes
      });
      toast.success('Données générées par l\'IA !');
    } catch (err) {
      toast.error('L\'IA n\'a pas pu extraire les données.');
    } finally {
      setLoading(false);
    }
  };

  const addTicketType = () => {
    setFormData({
      ...formData,
      ticketTypes: [
        ...formData.ticketTypes,
        { name: 'Nouveau Tier', price: 0, totalQuantity: 50, order: formData.ticketTypes.length, isHidden: false, points: 10, description: '', salesStartDate: '', salesEndDate: '' }
      ]
    });
  };

  const removeTicketType = (index: number) => {
    const newTiers = [...formData.ticketTypes];
    newTiers.splice(index, 1);
    setFormData({ ...formData, ticketTypes: newTiers });
  };

  const handleYieldSuggest = (idx: number) => {
    const tier = formData.ticketTypes[idx];
    let suggestedPrice = 10;
    if (tier.name.toLowerCase().includes('vip')) suggestedPrice = 50;
    if (tier.name.toLowerCase().includes('early')) suggestedPrice = 5;

    const newTiers = [...formData.ticketTypes];
    newTiers[idx].price = suggestedPrice;
    setFormData({ ...formData, ticketTypes: newTiers });
    toast.success(`Prix suggéré par l'IA: ${suggestedPrice}€`);
  };

  const addCustomField = () => {
    setFormData({
      ...formData,
      customFields: [
        ...formData.customFields,
        { label: 'Nouvelle Question', type: 'text', isRequired: false, options: [] }
      ]
    });
  };

  const removeCustomField = (index: number) => {
    const newFields = [...formData.customFields];
    newFields.splice(index, 1);
    setFormData({ ...formData, customFields: newFields });
  };

  const handleSubmit = async () => {
    if (!formData.communityId) return toast.error('Choisissez une communauté');
    if (!formData.title) return toast.error('Donnez un titre');

    try {
      setSubmitting(true);
      if (isEditMode) {
        await eventService.update(id!, formData);
        toast.success('Événement mis à jour !');
      } else {
        await eventService.create(formData);
        toast.success('Événement publié avec succès !');
      }
      navigate('/events');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  const steps = [
    { id: 'general', label: 'Infos', icon: Sparkles },
    { id: 'tickets', label: 'Billets', icon: Ticket },
    { id: 'form', label: 'Formulaire', icon: HelpCircle },
    { id: 'visibility', label: 'Publier', icon: Eye }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === tab);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight">{isEditMode ? 'Modifier l\'événement' : 'Créer un événement'}</h2>
        <p className="text-sm text-muted-foreground font-medium">Contrôlez chaque détail de votre expérience Clubz.</p>
      </div>

      {!isEditMode && (
        <Card className="border-2 border-primary/20 bg-primary/[0.03] rounded-xl overflow-hidden shadow-xl shadow-primary/5">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                <Sparkles className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-lg font-black">Assistant IA Magic</CardTitle>
                <CardDescription className="text-xs font-medium">L'IA pré-remplit le formulaire à partir d'un lien.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 flex gap-3">
            <Input
              placeholder="Lien Shotgun, Resident Advisor, Instagram..."
              className="h-11 bg-background border-2 border-transparent focus-visible:border-primary/30 rounded-xl shadow-sm text-sm"
              value={aiUrl}
              onChange={(e) => setAiUrl(e.target.value)}
            />
            <Button onClick={handleAiGenerate} disabled={loading} className="h-11 px-6 rounded-xl font-black gap-2 shrink-0">
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Générer'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Timeline Stepper */}
      <div className="relative mb-10 px-4">
        <div className="absolute top-6 left-12 right-12 h-1 bg-muted/20 rounded-full" />
        <div
          className="absolute top-6 left-12 h-1 bg-primary rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 90}%` }}
        />

        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = tab === step.id;
            const isPast = currentStepIndex > index;

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
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
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
          <Card className="border-none shadow-xl rounded-xl bg-card/80 backdrop-blur-md">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black tracking-tight">Informations de Base</CardTitle>
              <CardDescription className="text-sm font-medium">Les détails essentiels que tout le monde verra.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Communauté Organisatrice</Label>
                  <Select
                    value={formData.communityId}
                    onValueChange={(val: string | null) => setFormData({...formData, communityId: val || ''})}
                  >
                    <SelectTrigger size="lg" className="pl-10 relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={2.5} />
                      <span>{communities.find(c => c.id === formData.communityId)?.name || "Choisir..."}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {communities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Co-Organisateurs (Partenariats)</Label>
                  <Select
                    onValueChange={(val: string | null) => {
                      if (val && !formData.coHostIds.includes(val)) {
                        setFormData({...formData, coHostIds: [...formData.coHostIds, val]});
                      }
                    }}
                  >
                    <SelectTrigger size="lg" className="pl-10 relative">
                      <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" strokeWidth={2.5} />
                      <span>{(formData.coHostIds || []).length > 0 ? `${formData.coHostIds.length} partenaire(s)` : "Ajouter un co-hôte..."}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {communities.filter(c => c.id !== formData.communityId).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.coHostIds.map(id => (
                      <Badge key={id} variant="secondary" className="font-bold text-[10px] pr-1">
                        {communities.find(c => c.id === id)?.name}
                        <XCircle className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setFormData({ ...formData, coHostIds: formData.coHostIds.filter(cid => cid !== id) })} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Titre de l'événement</Label>
                  <Input
                    placeholder="LA NUIT LIQUIDE"
                    className="h-10 text-base font-bold"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Lien de partage personnalisé</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">clubz.app/</span>
                    <Input
                      placeholder="ma-soiree"
                      className="h-10 text-sm font-bold"
                      value={formData.shortLink}
                      onChange={(e) => setFormData({ ...formData, shortLink: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Début</Label>
                  <Input type="datetime-local" className="h-10 text-sm font-bold" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Fin</Label>
                  <Input type="datetime-local" className="h-10 text-sm font-bold" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Lieu & Adresse</Label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher une adresse..." className="h-10 pl-10 text-sm font-bold" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description Notion-Style</Label>
                <textarea
                  className="w-full min-h-[150px] rounded-xl border-2 border-transparent bg-muted/20 px-4 py-3 text-sm font-bold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary/30 transition-all resize-none"
                  placeholder="Décrivez l'expérience..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setTab('tickets')} className="h-10 px-8 rounded-xl font-black gap-2">
                  Suivant <ChevronRight size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <Card className="border-none shadow-xl rounded-xl bg-card/80 backdrop-blur-md">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight">Types de Billets</CardTitle>
                <CardDescription className="text-sm font-medium">Gérez vos catégories et vos quotas.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addTicketType} className="h-9 px-4 rounded-lg font-bold gap-2">
                <Plus size={16} /> Ajouter
              </Button>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              {(formData.ticketTypes || []).map((tier, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-muted/10 border-2 border-transparent hover:border-primary/10 transition-all space-y-4">
                  <div className="flex gap-4 items-end px-2 pt-2">
                    <div className="flex-1 space-y-2">
                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Nom</Label>
                      <Input className="h-10 bg-background border-none font-bold text-sm" value={tier.name} onChange={(e) => {
                        const newTiers = [...formData.ticketTypes];
                        newTiers[idx].name = e.target.value;
                        setFormData({ ...formData, ticketTypes: newTiers });
                      }} />
                    </div>
                    <div className="w-24 space-y-2">
                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Prix (€)</Label>
                      <Input type="number" className="h-10 bg-background border-none font-black text-sm" value={tier.price} onChange={(e) => {
                        const newTiers = [...formData.ticketTypes];
                        newTiers[idx].price = Number(e.target.value);
                        setFormData({ ...formData, ticketTypes: newTiers });
                      }} />
                    </div>
                    <div className="w-20 space-y-2">
                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Stock</Label>
                      <Input type="number" className="h-10 bg-background border-none font-bold text-sm" value={tier.totalQuantity} onChange={(e) => {
                        const newTiers = [...formData.ticketTypes];
                        newTiers[idx].totalQuantity = Number(e.target.value);
                        setFormData({ ...formData, ticketTypes: newTiers });
                      }} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleYieldSuggest(idx)} className="h-10 w-10 text-primary bg-primary/5 rounded-lg"><Sparkles size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => removeTicketType(idx)} className="h-10 w-10 text-destructive rounded-lg"><Trash2 size={16} /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-4">
                    <div className="space-y-1">
                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Description du billet</Label>
                      <Input className="h-9 bg-background border-none text-xs" placeholder="Ce qui est inclus..." value={tier.description} onChange={(e) => {
                        const newTiers = [...formData.ticketTypes];
                        newTiers[idx].description = e.target.value;
                        setFormData({ ...formData, ticketTypes: newTiers });
                      }} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Début des ventes</Label>
                      <Input type="datetime-local" className="h-9 bg-background border-none text-[10px]" value={tier.salesStartDate} onChange={(e) => {
                        const newTiers = [...formData.ticketTypes];
                        newTiers[idx].salesStartDate = e.target.value;
                        setFormData({ ...formData, ticketTypes: newTiers });
                      }} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Fin des ventes</Label>
                      <Input type="datetime-local" className="h-9 bg-background border-none text-[10px]" value={tier.salesEndDate} onChange={(e) => {
                        const newTiers = [...formData.ticketTypes];
                        newTiers[idx].salesEndDate = e.target.value;
                        setFormData({ ...formData, ticketTypes: newTiers });
                      }} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={() => setTab('general')} className="h-10 px-6 font-bold gap-2"><ChevronLeft size={18} /> Retour</Button>
                <Button onClick={() => setTab('form')} className="h-10 px-8 rounded-xl font-black gap-2">Suivant <ChevronRight size={18} /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <Card className="border-none shadow-xl rounded-xl bg-card/80 backdrop-blur-md">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight">Questions Participants</CardTitle>
                <CardDescription className="text-sm font-medium">Collectez les données cruciales lors de l'inscription.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addCustomField} className="h-9 px-4 rounded-lg font-bold gap-2">
                <Plus size={16} /> Nouvelle Question
              </Button>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              {(formData.customFields || []).length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-xl">
                  <p className="text-sm font-bold text-muted-foreground">Aucune question personnalisée.</p>
                </div>
              ) : (
                (formData.customFields || []).map((field, idx) => (
                  <div key={idx} className="flex gap-4 items-end p-4 rounded-xl bg-muted/10 border-2 border-transparent hover:border-primary/10 transition-all">
                    <div className="flex-1 space-y-2">
                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Intitulé de la question</Label>
                      <Input className="h-10 bg-background border-none font-bold text-sm" value={field.label} onChange={(e) => {
                        const newFields = [...formData.customFields];
                        newFields[idx].label = e.target.value;
                        setFormData({ ...formData, customFields: newFields });
                      }} />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Type</Label>
                      <Select value={field.type} onValueChange={(val) => {
                        const newFields = [...formData.customFields];
                        newFields[idx].type = val;
                        setFormData({ ...formData, customFields: newFields });
                      }}>
                        <SelectTrigger className="h-10 bg-background border-none font-bold text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texte</SelectItem>
                          <SelectItem value="number">Nombre</SelectItem>
                          <SelectItem value="select">Liste</SelectItem>
                          <SelectItem value="checkbox">Case à cocher</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeCustomField(idx)} className="h-10 w-10 text-destructive rounded-lg"><Trash2 size={16} /></Button>
                  </div>
                )
                ))}

              <Separator className="my-8" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Options Avancées</Label>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/5 border border-transparent hover:border-muted-foreground/10 transition-all">
                    <div className="flex items-center gap-3">
                      <Repeat className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-bold">Événement Récurrent</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Répéter automatiquement.</p>
                      </div>
                    </div>
                    <Button
                      variant={formData.isRecurring ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                      className="h-8 rounded-lg text-[10px] font-black uppercase"
                    >
                      {formData.isRecurring ? "Activé" : "Désactivé"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/5 border border-transparent hover:border-muted-foreground/10 transition-all">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-bold">Événement Online</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Lien de stream ou visio.</p>
                      </div>
                    </div>
                    <Button
                      variant={formData.isOnline ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, isOnline: !formData.isOnline })}
                      className="h-8 rounded-lg text-[10px] font-black uppercase"
                    >
                      {formData.isOnline ? "Activé" : "Désactivé"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tags de Découverte</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.tags || []).map(tag => (
                      <Badge key={tag} className="bg-primary/10 text-primary border-none font-bold px-3 py-1 flex items-center gap-1.5">
                        {tag} <XCircle className="h-3 w-3 cursor-pointer" onClick={() => setFormData({ ...formData, tags: (formData.tags || []).filter(t => t !== tag) })} />
                      </Badge>
                    ))}
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Ajouter un tag (Entrée)..."
                      className="h-10 pl-10 text-sm font-bold rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val && !formData.tags.includes(val)) {
                            setFormData({ ...formData, tags: [...formData.tags, val] });
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-10">
                <Button variant="ghost" onClick={() => setTab('tickets')} className="h-10 px-6 font-bold gap-2"><ChevronLeft size={18} /> Retour</Button>
                <Button onClick={() => setTab('visibility')} className="h-10 px-8 rounded-xl font-black gap-2">Suivant <ChevronRight size={18} /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility">
          <Card className="border-none shadow-xl rounded-xl bg-card/80 backdrop-blur-md">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black tracking-tight">Paramètres de Publication</CardTitle>
              <CardDescription className="text-sm font-medium">Définissez la portée de votre événement.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-6 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={cn(
                    "group relative p-6 rounded-2xl border-4 cursor-pointer transition-all duration-300",
                    formData.visibility === 'public' ? "border-primary bg-primary/5 shadow-xl scale-[1.02]" : "border-muted/30 hover:border-muted"
                  )}
                  onClick={() => setFormData({ ...formData, visibility: 'public' })}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-xl mb-4 flex items-center justify-center transition-all",
                    formData.visibility === 'public' ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground"
                  )}>
                    <Globe className="h-6 w-6" />
                  </div>
                  <h4 className={cn("text-lg font-black mb-1", formData.visibility === 'public' ? "text-primary" : "text-foreground")}>Public</h4>
                  <p className="text-xs font-medium text-muted-foreground">Visible par tous sur la carte Clubz.</p>
                </div>

                <div
                  className={cn(
                    "group relative p-6 rounded-2xl border-4 cursor-pointer transition-all duration-300",
                    formData.visibility === 'community_only' ? "border-primary bg-primary/5 shadow-xl scale-[1.02]" : "border-muted/30 hover:border-muted"
                  )}
                  onClick={() => setFormData({ ...formData, visibility: 'community_only' })}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-xl mb-4 flex items-center justify-center transition-all",
                    formData.visibility === 'community_only' ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground"
                  )}>
                    <Lock className="h-6 w-6" />
                  </div>
                  <h4 className={cn("text-lg font-black mb-1", formData.visibility === 'community_only' ? "text-primary" : "text-foreground")}>Privé</h4>
                  <p className="text-xs font-medium text-muted-foreground">Uniquement pour les membres de la communauté.</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6">
                <Button variant="ghost" onClick={() => setTab('form')} className="h-10 px-6 font-bold gap-2"><ChevronLeft size={18} /> Retour</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="h-11 px-10 rounded-xl font-black gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                  {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : (isEditMode ? <CheckCircle2 size={20} /> : <Plus size={20} />)}
                  {isEditMode ? 'Mettre à jour' : 'Publier l\'événement'}
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
