import { useState, useEffect } from 'react';
import { useCommunity } from '../context/CommunityContext';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  MoreVertical,
  ExternalLink,
  Clock,
  Loader2,
  Ticket,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/api';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import toast from 'react-hot-toast';

const Events = () => {
  const { selectedCommunityId } = useCommunity();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventService.getAll(selectedCommunityId);
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch events', err);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
    try {
      await eventService.delete(id);
      setEvents(events.filter(e => e.id !== id));
      toast.success('Événement supprimé');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCommunityId]);

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight text-foreground">Mes Événements 🗓️</h2>
          <p className="text-muted-foreground font-medium">Gérez vos prochains événements et suivez leurs performances.</p>
        </div>
        <Link to="/create">
          <Button className="h-12 px-6 rounded-2xl gap-2 shadow-lg shadow-primary/20 font-bold">
            <Plus size={20} strokeWidth={3} /> Créer un Événement
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={2.5} />
          <Input
            placeholder="Rechercher un événement..."
            className="pl-12 h-11 bg-card/50 border-none shadow-sm rounded-xl font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="h-11 rounded-xl border-2 font-bold gap-2 flex-1 md:flex-none">
            <Filter size={18} strokeWidth={2.5} /> Filtrer
          </Button>
          <Button variant="outline" className="h-11 rounded-xl border-2 font-bold gap-2 flex-1 md:flex-none">
            <Calendar size={18} strokeWidth={2.5} /> Date
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-bold">Récupération de vos événements...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm rounded-[2rem] p-20 text-center flex flex-col items-center space-y-6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <Ticket className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black">Aucun événement trouvé</h3>
            <p className="text-muted-foreground font-medium max-w-md mx-auto">
              {searchTerm
                ? "Aucun événement ne correspond à votre recherche. Essayez d'autres termes."
                : "Vous n'avez pas encore créé d'événement pour cette communauté."}
            </p>
          </div>
          {!searchTerm && (
            <Link to="/create">
              <Button className="h-12 px-8 rounded-xl font-bold">Créer mon premier événement</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="group border-none shadow-lg bg-card/60 backdrop-blur-sm rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.coverImage || 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&auto=format&fit=crop&q=60'}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none font-bold shadow-sm">
                    {event.visibility === 'public' ? '🌍 Public' : '🔒 Privé'}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button size="icon" variant="secondary" className="h-9 w-9 rounded-xl bg-background/80 backdrop-blur-md border-none shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl">
                      <DropdownMenuItem className="font-bold gap-2">
                        <ExternalLink size={16} /> Voir la page
                      </DropdownMenuItem>
                      <DropdownMenuItem className="font-bold gap-2">
                        <Link to={`/create/${event.id}`}>Modifier</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="font-bold gap-2 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 size={16} /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xl font-black group-hover:text-primary transition-colors line-clamp-1">{event.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                    <Clock size={14} className="text-primary" />
                    {new Date(event.startDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold italic">
                  <MapPin size={14} className="text-primary" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>

                <div className="pt-4 border-t border-muted/50 flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inscriptions</p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-muted overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?u=${event.id}-${i}`} alt="Avatar" />
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-black">+{event.attendeesCount || 0}</span>
                    </div>
                  </div>
                  <Link to={`/events/${event.id}`}>
                    <Button variant="ghost" className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary p-0">
                      <ChevronRight size={24} strokeWidth={3} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
