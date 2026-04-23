import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ArrowLeft, 
  Download, 
  Search,
  Clock,
  QrCode,
  MoreVertical,
  Filter,
  CheckCircle2,
  MapPin,
  Calendar as CalendarIcon,
  Loader2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { eventService } from '../services/api';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const [tab, setTab] = useState('analytics');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [eventRes, analyticsRes, attendeesRes] = await Promise.all([
          eventService.getOne(id),
          eventService.getStats(id).catch(() => ({ data: null })),
          eventService.getAttendees(id).catch(() => ({ data: [] }))
        ]);
        
        setEvent(eventRes.data);
        setAnalytics(analyticsRes.data);
        setAttendees(attendeesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch event details', err);
        toast.error('Erreur lors du chargement de l\'événement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCheckIn = async (ticketId: string) => {
    if (!id) return;
    setCheckingIn(ticketId);
    try {
      await eventService.checkIn(id, ticketId);
      toast.success('Check-in réussi !');
      // Update local state
      setAttendees(attendees.map(a => a.id === ticketId ? { ...a, checkedIn: true } : a));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors du check-in');
    } finally {
      setCheckingIn(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Initialisation de la console...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black">Événement introuvable</h2>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">Retour au Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Link to="/" className="group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} /> Retour au Dashboard
      </Link>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 rounded-[2rem] border-4 border-card shadow-2xl">
              <AvatarImage src={event.coverImage || 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&auto=format&fit=crop&q=60'} className="object-cover" />
              <AvatarFallback>EV</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-success rounded-xl border-4 border-card flex items-center justify-center shadow-lg">
              <CheckCircle2 size={16} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black tracking-tighter">{event.title}</h2>
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20 font-black uppercase text-[10px] tracking-widest px-3 py-1">PUBLIÉ</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm font-bold text-muted-foreground uppercase tracking-tight">
              <span className="flex items-center gap-2"><CalendarIcon size={16} className="text-primary" strokeWidth={2.5} /> {new Date(event.startDate).toLocaleDateString()}</span>
              <span className="flex items-center gap-2"><Clock size={16} className="text-primary" strokeWidth={2.5} /> {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="flex items-center gap-2"><MapPin size={16} className="text-primary" strokeWidth={2.5} /> {event.location}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <Button variant="outline" className="flex-1 lg:flex-none h-12 px-6 rounded-2xl border-2 font-bold gap-2 hover:bg-muted/50 transition-all">
            <Download size={20} strokeWidth={2.5} /> Exporter CSV
          </Button>
          <Button className="flex-1 lg:flex-none h-12 px-8 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <QrCode size={20} strokeWidth={2.5} /> Scanner QR
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="h-14 bg-muted/30 rounded-2xl p-1.5 border-2 border-transparent mb-8">
          <TabsTrigger value="analytics" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8 data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">Analytics de Vente</TabsTrigger>
          <TabsTrigger value="attendees" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8 data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">Participants ({attendees.length})</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8 data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-[2rem] overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Revenu Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black tracking-tighter group-hover:text-primary transition-colors">{analytics?.totalRevenue?.toLocaleString() || '0'} €</div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-success/10 text-success text-[10px] font-bold">+24%</Badge>
                  <span className="text-[10px] font-black uppercase text-muted-foreground opacity-60 italic">vs prévision</span>
                </div>
              </CardContent>
              <div className="h-1.5 w-full bg-success/10" />
            </Card>
            
            <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-[2rem] overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Check-ins Actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black tracking-tighter">{analytics?.checkInCount || 0} <span className="text-xl text-muted-foreground font-medium">/ {event.capacity || 0}</span></div>
                <div className="mt-5 h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-[0_0_10px_rgba(42,123,155,0.4)]" 
                    style={{ width: `${Math.min(100, ((analytics?.checkInCount || 0) / (event.capacity || 1)) * 100)}%` }} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-[2rem] overflow-hidden group">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Waitlist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black tracking-tighter text-warning">{analytics?.waitlistCount || 0}</div>
                <p className="mt-3 text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-warning" /> Moyenne: 3 promos / jour
                </p>
              </CardContent>
              <div className="h-1.5 w-full bg-warning/10" />
            </Card>
          </div>

          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card/80 backdrop-blur-md overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">Flux de Trésorerie Live</CardTitle>
                  <CardDescription className="text-base font-medium italic">Ventes de billets agrégées sur la semaine.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-muted/50 text-[10px] font-black uppercase tracking-tighter">
                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(42,123,155,0.6)]" /> Ventes (€)
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 pt-6 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.salesHistory || []}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2A7B9B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2A7B9B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold'}} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '1.5rem', 
                      border: 'none', 
                      boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
                      padding: '1rem 1.5rem',
                      background: 'rgba(255,255,255,0.95)'
                    }}
                    itemStyle={{ color: '#2A7B9B', fontWeight: '900', fontSize: '14px' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#2A7B9B" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendees">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card/80 backdrop-blur-md overflow-hidden">
            <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">Liste des Invités</CardTitle>
                <CardDescription className="text-base font-medium">Gérez les accès et les statuts en temps réel.</CardDescription>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={2.5} />
                  <Input placeholder="Nom, email, code..." className="pl-12 h-11 w-80 bg-background border-none shadow-sm rounded-xl font-bold text-sm" />
                </div>
                <Button variant="outline" className="h-11 rounded-xl border-2 font-bold gap-2 hover:bg-muted/50">
                  <Filter size={18} strokeWidth={2.5} /> Filtrer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="px-10 h-14 text-[10px] font-black uppercase tracking-widest">Membre</TableHead>
                    <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Type de Billet</TableHead>
                    <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Statut</TableHead>
                    <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-center">Check-in</TableHead>
                    <TableHead className="px-10 h-14"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees.map((a) => (
                    <TableRow key={a.id} className="group hover:bg-primary/[0.01] transition-colors border-muted/30">
                      <TableCell className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-all shadow-sm">
                            <AvatarFallback className="bg-primary/5 text-primary font-black text-xs">{(a.user?.name || a.name || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="text-base font-black leading-none group-hover:text-primary transition-colors">{a.user?.name || a.name || 'Utilisateur'}</p>
                            <p className="text-xs text-muted-foreground font-bold italic opacity-60">{a.user?.email || a.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-lg bg-primary/5 text-primary border-primary/20 font-black uppercase text-[9px] px-3 py-1">
                          {a.ticketType?.name || a.ticket || 'Standard'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full shadow-[0_0_8px] ${a.status === 'going' ? 'bg-success shadow-success/40' : 'bg-warning shadow-warning/40'}`} />
                          <span className={`text-xs font-black uppercase tracking-tighter ${a.status === 'going' ? 'text-success' : 'text-warning'}`}>
                            {a.status === 'going' ? 'Confirmé' : 'Waitlist'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {a.checkedIn ? (
                          <div className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-success/10 text-success shadow-inner">
                            <CheckCircle2 size={22} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            disabled={checkingIn === a.id}
                            onClick={() => handleCheckIn(a.id)}
                            className="h-10 w-10 rounded-2xl bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white transition-all"
                          >
                            {checkingIn === a.id ? <Loader2 className="animate-spin h-5 w-5" /> : <QrCode size={20} strokeWidth={2.5} />}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right px-10">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary">
                          <MoreVertical size={20} strokeWidth={2.5} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventDetails;
