import { useState, useEffect } from 'react';
import { 
  Search,
  Filter,
  Mail,
  MoreVertical,
  ShieldCheck,
  Loader2,
  Calendar,
} from 'lucide-react';
import { communityService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import toast from 'react-hot-toast';
import { useCommunity } from '../context/CommunityContext';

const Members = () => {
  const { selectedCommunityId } = useCommunity();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedCommunityId) return;
      try {
        setLoading(true);
        const res = await communityService.getMembers(selectedCommunityId);
        setMembers(res.data || []);
      } catch (err) {
        console.error('Failed to fetch members', err);
        toast.error('Erreur lors du chargement des membres');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedCommunityId]);

  const handleKickMember = async (memberId: string) => {
    if (!confirm('Voulez-vous vraiment exclure ce membre ?')) return;
    try {
      if (!selectedCommunityId) return;
      await communityService.kickMember(selectedCommunityId, memberId);
      setMembers(members.filter(m => m.id !== memberId));
      toast.success('Membre exclu');
    } catch (err) {
      toast.error('Erreur lors de l\'exclusion');
    }
  };

  const handleRoleChange = async (memberId: string, roleName: string) => {
    try {
      if (!selectedCommunityId) return;
      await communityService.updateMemberRole(selectedCommunityId, memberId, roleName);
      setMembers(members.map(m => m.id === memberId ? { ...m, role: { ...m.role, name: roleName } } : m));
      toast.success('Rôle mis à jour');
    } catch (err) {
      toast.error('Erreur lors du changement de rôle');
    }
  };

  const filteredMembers = members.filter(m => 
    m.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.community?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight text-foreground">Communauté 👥</h2>
          <p className="text-muted-foreground font-medium">Gérez les membres de vos différentes communautés Clubz.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl border-2 font-bold gap-2 hover:bg-muted/50 transition-all">
            Exporter la liste
          </Button>
          <Button className="h-12 px-6 rounded-2xl gap-2 shadow-lg shadow-primary/20 font-bold">
            Inviter un membre
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Membres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter">{members.length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nouveaux (7j)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-success">
              +{members.filter(m => new Date(m.joinedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Rétention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-primary">-</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-card/80 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black tracking-tight">Liste des Membres</CardTitle>
            <CardDescription className="text-base font-medium">Visualisez et gérez les droits d'accès.</CardDescription>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={2.5} />
              <Input 
                placeholder="Rechercher..." 
                className="pl-12 h-11 w-80 bg-background border-none shadow-sm rounded-xl font-bold text-sm" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-11 rounded-xl border-2 font-bold gap-2 hover:bg-muted/50">
              <Filter size={18} strokeWidth={2.5} /> Filtrer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-bold">Chargement des membres...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-bold">Aucun membre trouvé.</div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-10 h-14 text-[10px] font-black uppercase tracking-widest">Utilisateur</TableHead>
                  <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Communauté</TableHead>
                  <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Rôle</TableHead>
                  <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Rejoint le</TableHead>
                  <TableHead className="px-10 h-14"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((m) => (
                  <TableRow key={m.id} className="group hover:bg-primary/[0.01] transition-colors border-muted/30">
                    <TableCell className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-all shadow-sm">
                          <AvatarImage src={m.user?.profileImage} />
                          <AvatarFallback className="bg-primary/5 text-primary font-black text-xs">{m.user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-base font-black leading-none group-hover:text-primary transition-colors">{m.user?.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold opacity-60">
                            <Mail size={12} /> {m.user?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg bg-primary/5 text-primary border-primary/20 font-black uppercase text-[9px] px-3 py-1 gap-1.5">
                        <ShieldCheck size={10} /> {m.community?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-black uppercase tracking-tighter text-foreground">
                        {m.role?.name || 'Membre'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <Calendar size={14} className="text-primary/40" />
                        {new Date(m.joinedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className="flex justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                              <MoreVertical size={18} strokeWidth={2.5} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl">
                            <DropdownMenuItem className="font-bold gap-2" onClick={() => handleRoleChange(m.id, 'admin')}>
                              Promouvoir Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem className="font-bold gap-2" onClick={() => handleRoleChange(m.id, 'moderator')}>
                              Promouvoir Modérateur
                            </DropdownMenuItem>
                            <DropdownMenuItem className="font-bold gap-2" onClick={() => handleRoleChange(m.id, 'member')}>
                              Rétrograder Membre
                            </DropdownMenuItem>
                            <DropdownMenuItem className="font-bold gap-2 text-destructive" onClick={() => handleKickMember(m.id)}>
                              Exclure
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Members;
