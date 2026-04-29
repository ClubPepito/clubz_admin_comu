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
  Trash2,
  Pen,
  Copy
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

  const handleDuplicateEvent = async (id: string) => {
    if (!confirm('Voulez-vous vraiment dupliquer cet événement ?')) return;
    // try {
    //   await eventService.duplicate(id);
    //   setEvents(events.map(e => e.id === id ? { ...e, duplicated: true } : e));
    //   toast.success('Événement dupliqué');
    // } catch (err) {
    //   toast.error('Erreur lors de la duplication');
    // }
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Mes Événements 🗓️</h2>
          <p className="text-xs text-muted-foreground font-medium">Gérez vos prochains événements.</p>
        </div>
        <Link to="/create">
          <Button size="sm" className="h-10 px-5 rounded-xl gap-2 shadow-md shadow-primary/10 font-bold text-xs">
            <Plus size={16} strokeWidth={3} /> Créer un Événement
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-60" />
          <Input
            placeholder="Rechercher..."
            className="pl-10 h-10 bg-white border-gray-100 shadow-sm rounded-xl font-medium text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="h-10 rounded-xl border-gray-100 bg-white font-bold gap-2 flex-1 md:flex-none text-[11px] uppercase tracking-wider">
            <Filter size={16} /> Filtrer
          </Button>
          <Button variant="outline" size="sm" className="h-10 rounded-xl border-gray-100 bg-white font-bold gap-2 flex-1 md:flex-none text-[11px] uppercase tracking-wider">
            <Calendar size={16} /> Date
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Récupération...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="border-none shadow-sm bg-white rounded-2xl p-16 text-center flex flex-col items-center space-y-4 border border-gray-50">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Ticket className="h-8 w-8 text-muted-foreground opacity-40" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Aucun résultat</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {searchTerm ? "Aucun événement ne correspond." : "Vous n'avez pas encore créé d'événement."}
            </p>
          </div>
          {!searchTerm && (
            <Link to="/create">
              <Button size="sm" className="rounded-lg font-bold text-xs">Lancer mon premier projet</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="group border-none shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-50 flex flex-col">
              <div className="relative h-36 overflow-hidden">
                <img
                  src={event.image || 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&auto=format&fit=crop&q=60'}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/90 backdrop-blur-sm text-foreground border-none font-bold text-[8px] uppercase px-1.5 py-0 shadow-sm">
                    {event.visibility === 'public' ? '🌍 Public' : '🔒 Privé'}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg bg-white/90 backdrop-blur-sm border-none shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-lg border border-gray-100 shadow-xl p-1 min-w-[120px]">
                      <DropdownMenuItem className="text-[10px] font-bold gap-2 cursor-pointer">
                        <Link to={`/events/${event.id}`} className="flex items-center gap-2 w-full"><ExternalLink size={14} /> Voir</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-[10px] font-bold gap-2 cursor-pointer">
                        <Link to={`/create/${event.id}`} className="flex items-center gap-2 w-full"><Pen size={14} /> Modifier</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-[10px] font-bold gap-2 cursor-pointer" onClick={() => handleDuplicateEvent(event.id)}>
                        <Link to={`/create/${event.id}`} className="flex items-center gap-2 w-full"><Copy size={14} /> Dupliquer</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-[10px] font-bold gap-2 text-destructive hover:bg-destructive/5 cursor-pointer"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 size={14} /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col space-y-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">{event.title}</h4>
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold uppercase tracking-tight opacity-70">
                    <Clock size={12} className="text-primary" />
                    {new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold italic opacity-70 truncate">
                  <MapPin size={12} className="text-primary" />
                  <span className="truncate">{event.location}</span>
                </div>

                <div className="pt-3 border-t border-gray-50 mt-auto flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black uppercase tracking-wider text-muted-foreground opacity-50">Inscrits</p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1.5">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-5 w-5 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm shrink-0">
                            <img src={`https://i.pravatar.cc/100?u=${event.id}-${i}`} alt="Avatar" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-foreground">+{event.attendeesCount || 0}</span>
                    </div>
                  </div>
                  <Link to={`/events/${event.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5 text-primary">
                      <ChevronRight size={20} strokeWidth={3} />
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
