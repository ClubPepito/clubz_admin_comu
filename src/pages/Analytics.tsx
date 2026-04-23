import { useState, useEffect } from 'react';
import { 
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Download,
  Ticket,
  ChevronRight
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Link } from 'react-router-dom';
import { eventService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';
import { useCommunity } from '../context/CommunityContext';

const Analytics = () => {
  const { selectedCommunityId } = useCommunity();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [statsRes, historyRes, eventsRes] = await Promise.all([
          eventService.getGlobalStats(selectedCommunityId),
          eventService.getGlobalHistory(selectedCommunityId),
          eventService.getAll(selectedCommunityId)
        ]);
        
        setStats(statsRes.data);
        setHistory(historyRes.data || []);
        
        // Sort events by revenue for the "Top Events" section
        const sortedEvents = (eventsRes.data || []).sort((a: any, b: any) => 
          (b.totalRevenue || 0) - (a.totalRevenue || 0)
        );
        setEvents(sortedEvents.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch analytics', err);
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedCommunityId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground">Statistiques Globales 📊</h2>
          <p className="text-sm text-muted-foreground font-medium">Analyse profonde de la croissance et de la performance.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 px-5 rounded-xl border-2 font-bold gap-2 hover:bg-muted/50 transition-all">
            <Calendar size={18} strokeWidth={2.5} /> 30 derniers jours
          </Button>
          <Button className="h-10 px-5 rounded-xl gap-2 shadow-lg shadow-primary/10 font-bold">
            <Download size={18} strokeWidth={2.5} /> Rapport PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Revenu Brut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tighter">{stats?.totalRevenue?.toLocaleString()}€</div>
            <div className={`flex items-center gap-1.5 mt-2 font-bold text-xs ${stats?.revenueChange?.startsWith('-') ? 'text-destructive' : 'text-success'}`}>
              {stats?.revenueChange?.startsWith('-') ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />} 
              {stats?.revenueChange || '-'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Inscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tighter">{stats?.totalAttendees?.toLocaleString()}</div>
            <div className={`flex items-center gap-1.5 mt-2 font-bold text-xs ${stats?.attendeesChange?.startsWith('-') ? 'text-destructive' : 'text-success'}`}>
              {stats?.attendeesChange?.startsWith('-') ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />} 
              {stats?.attendeesChange || '-'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Taux Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tighter">{stats?.engagementRate || '-'}</div>
            <div className={`flex items-center gap-1.5 mt-2 font-bold text-xs ${stats?.engagementChange?.startsWith('-') ? 'text-destructive' : 'text-success'}`}>
              {stats?.engagementChange?.startsWith('-') ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />} 
              {stats?.engagementChange || '-'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Événements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tighter">{stats?.activeEvents || '0'}</div>
            <div className="flex items-center gap-1.5 mt-2 font-bold text-xs text-muted-foreground">
              Total gérés
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card/80 backdrop-blur-md p-8">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle className="text-xl font-black">Courbe de Ventes (7j)</CardTitle>
            <CardDescription className="font-bold italic">Evolution des revenus quotidiens.</CardDescription>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history.length > 0 ? history : [{ name: '-', value: 0 }]}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2A7B9B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2A7B9B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2A7B9B" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card/80 backdrop-blur-md p-8">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle className="text-xl font-black">Performance Volumétrique</CardTitle>
            <CardDescription className="font-bold italic">Répartition des ventes par jour.</CardDescription>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history.length > 0 ? history : [{ name: '-', value: 0 }]}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(42,123,155,0.05)'}}
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {history.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2A7B9B' : '#B5D9D2'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card/80 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-10 pb-4">
          <CardTitle className="text-2xl font-black tracking-tight">Top Événements</CardTitle>
          <CardDescription className="text-base font-medium">Classement des événements par rentabilité et impact.</CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-6">
          <div className="space-y-6">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Ticket className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-bold">Aucune donnée d'événement disponible.</p>
              </div>
            ) : (
              events.map((event, i) => (
                <div key={event.id} className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border-2 border-transparent hover:border-primary/10 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="text-2xl font-black text-primary opacity-20 w-8">#{i + 1}</div>
                    <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-sm">
                      <img src={event.coverImage || `https://i.pravatar.cc/100?u=${event.id}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black group-hover:text-primary transition-colors">{event.title}</h4>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-10 items-center">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inscriptions</p>
                      <p className="text-xl font-black">{event.attendeesCount || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Revenus</p>
                      <p className="text-xl font-black text-primary">{(event.totalRevenue || 0).toLocaleString()}€</p>
                    </div>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted/50 hover:bg-primary hover:text-white transition-all">
                        <ChevronRight size={24} strokeWidth={2.5} />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
