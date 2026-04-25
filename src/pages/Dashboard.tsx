import { useState, useEffect } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { 
  Users, 
  Ticket, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Plus,
  ArrowUpRight,
  Loader2,
  Download,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eventService } from '../services/api';

const StatCard = ({ title, value, change, icon: Icon, trend, loading }: any) => (
  <Card className="overflow-hidden border-none shadow-sm bg-card/40 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 p-4">
      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        <Icon size={14} strokeWidth={2.5} />
      </div>
    </CardHeader>
    <CardContent className="px-4 pb-4 pt-0">
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        <>
          <div className="text-xl font-black tracking-tighter">{value}</div>
          <div className="mt-1 flex items-center gap-1.5">
            <Badge variant="secondary" className={`text-[9px] font-bold px-1.5 py-0 rounded-md ${trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              {change}
            </Badge>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter opacity-60">vs mois dernier</span>
          </div>
        </>
      )}
    </CardContent>
    <div className="h-0.5 w-full bg-primary/5 group-hover:bg-primary/20 transition-colors" />
  </Card>
);

const Dashboard = () => {
  const { selectedCommunityId } = useCommunity();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: '0€',
    revenueChange: '-',
    members: '0',
    membersChange: '-',
    engagement: '0%',
    engagementChange: '-',
    activeEvents: '0'
  });
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsRes, statsRes, activityRes] = await Promise.all([
          eventService.getAll(selectedCommunityId),
          eventService.getGlobalStats(selectedCommunityId),
          eventService.getRecentActivity(selectedCommunityId)
        ]);
        
        const globalStats = statsRes.data;
        setStats({
          revenue: `${(globalStats.totalRevenue || 0).toLocaleString()}€`,
          revenueChange: globalStats.revenueChange || '-',
          members: globalStats.totalAttendees?.toString() || '0',
          membersChange: globalStats.attendeesChange || '+0%',
          engagement: globalStats.engagementRate || '0%',
          engagementChange: globalStats.engagementChange || '+0%',
          activeEvents: globalStats.activeEvents?.toString() || '0'
        });
        
        setEvents((eventsRes.data || []).slice(0, 5));
        setActivity(activityRes.data || []);
      } catch (err) {
        console.error('Dashboard fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCommunityId]);

  if (loading && !stats.members) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={32} className="animate-spin text-primary opacity-40" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Vue d'ensemble</h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Statistiques de votre écosystème</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-gray-100 bg-white font-bold h-9 text-[10px] uppercase tracking-wider gap-2"><Download size={14} /> Export</Button>
          <Link to="/create">
            <Button size="sm" className="rounded-xl font-bold h-9 text-[10px] uppercase tracking-wider gap-2 shadow-lg shadow-primary/20"><Plus size={14} /> Nouvel Event</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Inscrits" 
          value={stats.members} 
          change={stats.membersChange} 
          icon={Users} 
          trend={stats.membersChange?.startsWith('-') ? 'down' : 'up'} 
          loading={loading} 
        />
        <StatCard 
          title="Taux Engagement" 
          value={stats.engagement} 
          change={stats.engagementChange} 
          icon={TrendingUp} 
          trend={stats.engagementChange?.startsWith('-') ? 'down' : 'up'} 
          loading={loading} 
        />
        <StatCard 
          title="Événements Actifs" 
          value={stats.activeEvents} 
          change="-" 
          icon={CalendarIcon} 
          trend="up" 
          loading={loading} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-none shadow-sm bg-white rounded-2xl overflow-hidden border border-gray-50">
          <CardHeader className="p-5 pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold">Événements en cours</CardTitle>
                <CardDescription className="text-[10px] font-medium uppercase tracking-tight opacity-60">Gestion de proximité</CardDescription>
              </div>
              <Link to="/events">
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 rounded-lg text-[10px] uppercase tracking-widest">Tout voir</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Chargement...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-muted-foreground opacity-40" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Aucun événement</h3>
                  <p className="text-[10px] text-muted-foreground">Prêt pour votre prochain succès ?</p>
                </div>
                <Link to="/create">
                  <Button variant="outline" size="sm" className="rounded-lg text-[10px] font-bold">Lancer un projet</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-3 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all group">
                    <div className="h-16 w-16 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow shrink-0">
                      <img 
                        src={event.image || 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&auto=format&fit=crop&q=60'} 
                        alt={event.title} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold leading-tight group-hover:text-primary transition-colors truncate">{event.title}</h4>
                        <Badge variant="outline" className="rounded-md bg-success/5 text-success border-success/10 font-bold uppercase text-[8px] px-1.5 py-0 shrink-0">
                          {event.visibility === 'public' ? 'Public' : 'Privé'}
                        </Badge>
                      </div>
                      <div className="flex items-center text-[10px] text-muted-foreground gap-3 font-bold uppercase tracking-tight opacity-70">
                        <span className="flex items-center gap-1.5"><CalendarIcon size={12} className="text-primary" /> {new Date(event.startDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5 truncate"><MapPin size={12} className="text-primary" /> {event.location}</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
                          <span>Participation</span>
                          <span>{event.attendeesCount || 0} inscrits</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000" 
                            style={{ width: `${Math.min(100, ((event.attendeesCount || 0) / (event.capacity || 100)) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl bg-gray-50 hover:bg-primary hover:text-white transition-all">
                        <ArrowUpRight size={18} strokeWidth={2.5} />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-sm bg-white rounded-2xl overflow-hidden border border-gray-50">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-lg font-bold">Activité Récente</CardTitle>
            <CardDescription className="text-[10px] font-medium uppercase tracking-tight opacity-60">Dernières interactions</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="space-y-5">
              {activity.length === 0 ? (
                <p className="text-center py-8 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Aucune activité.</p>
              ) : (
                activity.map((item, i) => (
                  <div key={item.id} className="flex gap-3 items-start relative group">
                    {i < activity.length - 1 && <div className="absolute left-[5px] top-4 bottom-[-24px] w-[1px] bg-gray-100" />}
                    <div className="h-2.5 w-2.5 rounded-full border border-primary bg-background z-10 mt-1 group-hover:scale-125 transition-transform" />
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold leading-none">{item.user?.name || 'Utilisateur'}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Inscrit à <span className="text-primary font-bold">{item.event?.title}</span></p>
                      <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-tight mt-0.5 opacity-50">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-8 h-9 rounded-xl font-bold border-gray-100 text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-gray-50 hover:text-primary transition-all">Voir le journal</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
