import { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Download,
  ChevronRight,
  Calendar as CalendarIcon
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Statistiques</h2>
          <p className="text-xs text-muted-foreground font-medium">Analyse de la performance globale.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-gray-100 bg-white font-bold gap-2 text-[10px] uppercase tracking-wider">
            <Calendar size={14} /> 30 jours
          </Button>
          <Button size="sm" className="h-9 px-4 rounded-xl gap-2 shadow-md shadow-primary/10 font-bold text-[10px] uppercase tracking-wider">
            <Download size={14} /> Rapport
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: 'Revenu Brut', value: `${stats?.totalRevenue?.toLocaleString()}€`, change: stats?.revenueChange },
          { title: 'Inscriptions', value: stats?.totalAttendees?.toLocaleString(), change: stats?.attendeesChange },
          { title: 'Engagement', value: stats?.engagementRate, change: stats?.engagementChange },
          { title: 'Événements', value: stats?.activeEvents || '0', change: null }
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-sm bg-white rounded-xl overflow-hidden border border-gray-50">
            <CardHeader className="p-4 pb-1.5">
              <CardTitle className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl font-black tracking-tighter">{item.value || '0'}</div>
              {item.change && (
                <div className={`flex items-center gap-1 mt-1 font-bold text-[10px] ${item.change.startsWith('-') ? 'text-destructive' : 'text-success'}`}>
                  {item.change.startsWith('-') ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                  {item.change}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm rounded-2xl bg-white border border-gray-50">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm font-bold">Courbe de Ventes</CardTitle>
            <CardDescription className="text-[10px] font-medium uppercase tracking-tight opacity-50">Evolution quotidienne</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="h-[260px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.length > 0 ? history : [{ name: '-', value: 0 }]}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#247596" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#247596" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 'bold' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: '#fff', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#247596" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white border border-gray-50">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm font-bold">Performance Volumétrique</CardTitle>
            <CardDescription className="text-[10px] font-medium uppercase tracking-tight opacity-50">Répartition journalière</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="h-[260px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history.length > 0 ? history : [{ name: '-', value: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 'bold' }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(36,117,150,0.03)' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: '#fff', fontSize: '10px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {history.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#247596' : '#94c1d2'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden border border-gray-50">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-lg font-bold tracking-tight">Top Événements</CardTitle>
          <CardDescription className="text-[10px] font-medium uppercase tracking-tight opacity-50">Classement par rentabilité.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Aucune donnée</div>
            ) : (
              events.map((event, i) => (
                <div key={event.id} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 border border-transparent hover:border-gray-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-black text-primary opacity-20 w-5">#{i + 1}</div>
                    <div className="h-10 w-10 rounded-lg overflow-hidden shadow-sm shrink-0 bg-primary/5 flex items-center justify-center">
                      {event.image ? (
                        <img src={event.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <CalendarIcon size={14} className="text-primary opacity-30" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-bold group-hover:text-primary transition-colors truncate">{event.title}</h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight opacity-60 truncate">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-center shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[8px] font-bold uppercase tracking-tight text-muted-foreground opacity-50">Inscriptions</p>
                      <p className="text-[13px] font-bold">{event.attendeesCount || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase tracking-tight text-muted-foreground opacity-50">Revenus</p>
                      <p className="text-[13px] font-bold text-primary">{(event.totalRevenue || 0).toLocaleString()}€</p>
                    </div>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white shadow-sm border border-transparent hover:border-gray-100">
                        <ChevronRight size={16} strokeWidth={3} />
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
