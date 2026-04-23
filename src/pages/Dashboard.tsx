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
  Calendar as CalendarIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eventService } from '../services/api';

const StatCard = ({ title, value, change, icon: Icon, trend, loading }: any) => (
  <Card className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm group hover:shadow-lg transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        <Icon size={18} strokeWidth={2.5} />
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      ) : (
        <>
          <div className="text-2xl font-black tracking-tighter">{value}</div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className={`text-[10px] font-bold px-2 py-0 ${trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              {change}
            </Badge>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">vs mois dernier</span>
          </div>
        </>
      )}
    </CardContent>
    <div className="h-1 w-full bg-primary/5 group-hover:bg-primary/20 transition-colors" />
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
        
        setEvents(eventsRes.data || []);
        setActivity(activityRes.data || []);
        
        const globalStats = statsRes.data;
        setStats({
          revenue: `${globalStats.totalRevenue.toLocaleString()}€`,
          revenueChange: globalStats.revenueChange,
          members: `+${globalStats.totalAttendees}`,
          membersChange: globalStats.attendeesChange,
          engagement: globalStats.engagementRate,
          engagementChange: globalStats.engagementChange,
          activeEvents: globalStats.activeEvents.toString()
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCommunityId]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground">Tableau de bord 👋</h2>
          <p className="text-muted-foreground font-medium">Voici l'activité de vos communautés aujourd'hui.</p>
        </div>
        <Link to="/create">
          <Button className="h-12 px-6 rounded-2xl gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all font-bold">
            <Plus size={20} strokeWidth={3} /> Créer un Événement
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Revenu Total" 
          value={stats.revenue} 
          change={stats.revenueChange} 
          icon={Ticket} 
          trend={stats.revenueChange?.startsWith('-') ? 'down' : 'up'} 
          loading={loading} 
        />
        <StatCard 
          title="Nouveaux Membres" 
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
          icon={Clock} 
          trend="up" 
          loading={loading} 
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-black">Événements en cours</CardTitle>
                <CardDescription className="text-sm font-medium">Gérez vos événements les plus proches.</CardDescription>
              </div>
              <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-xl">Tout voir</Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-bold">Chargement des événements...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Aucun événement</h3>
                  <p className="text-sm text-muted-foreground">Commencez par créer votre premier événement.</p>
                </div>
                <Link to="/create">
                  <Button variant="outline">Créer un événement</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center gap-6 p-4 rounded-3xl border border-transparent hover:border-primary/10 hover:bg-primary/[0.02] transition-all group">
                    <div className="h-24 w-24 rounded-[1.5rem] overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                      <img 
                        src={event.coverImage || 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&auto=format&fit=crop&q=60'} 
                        alt={event.title} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xl font-black leading-tight group-hover:text-primary transition-colors">{event.title}</h4>
                        <Badge variant="outline" className="rounded-lg bg-success/10 text-success border-success/20 font-black uppercase text-[9px]">
                          {event.visibility === 'public' ? 'Public' : 'Privé'}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-4 font-semibold uppercase tracking-tight">
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" strokeWidth={2.5} /> {new Date(event.startDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" strokeWidth={2.5} /> {event.location}</span>
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                          <span>Participation</span>
                          <span>{event.attendeesCount || 0} inscrits</span>
                        </div>
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary shadow-[0_0_10px_rgba(42,123,155,0.4)] transition-all duration-1000" 
                            style={{ width: `${Math.min(100, ((event.attendeesCount || 0) / (event.capacity || 100)) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="secondary" size="icon" className="h-12 w-12 rounded-2xl bg-muted/50 hover:bg-primary hover:text-white transition-all">
                        <ArrowUpRight size={24} strokeWidth={2.5} />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-black">Activité Live</CardTitle>
            <CardDescription className="text-sm font-medium">Flux d'inscriptions en temps réel.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="space-y-8">
              {activity.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground font-bold">Aucune activité récente.</p>
              ) : (
                activity.map((item, i) => (
                  <div key={item.id} className="flex gap-4 items-start relative group">
                    {i < activity.length - 1 && <div className="absolute left-[7px] top-6 bottom-[-32px] w-[2px] bg-muted/40" />}
                    <div className="h-4 w-4 rounded-full border-2 border-primary bg-background z-10 group-hover:scale-125 transition-transform" />
                    <div className="space-y-1">
                      <p className="text-sm font-black leading-none">{item.user?.name || 'Inconnu'}</p>
                      <p className="text-xs text-muted-foreground font-medium">S'est inscrit à <span className="text-primary font-bold">{item.event?.title}</span></p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mt-1 italic opacity-60">{new Date(item.joinedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button className="w-full mt-10 h-11 rounded-xl variant-outline font-bold border-2 hover:bg-primary/5 transition-all">Voir tout le journal</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
