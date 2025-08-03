import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UserPlus, Edit, Trash2, Shield, User, Eye, Search } from 'lucide-react';
import { type Agent } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface AgentsListProps {
  agents: Agent[];
  onAdd: (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Agent>) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

export function AgentsList({ agents, onAdd, onUpdate, onDelete, canEdit }: AgentsListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);
  const [newAgent, setNewAgent] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'user' as Agent['role'],
    isActive: true
  });

  const filteredAgents = agents.filter(agent =>
    agent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: Agent['role']) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: Agent['role']) => {
    switch (role) {
      case 'admin': return 'default';
      case 'user': return 'secondary';
      case 'viewer': return 'outline';
    }
  };

  const handleAddAgent = () => {
    if (!newAgent.username || !newAgent.email || !newAgent.fullName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si le nom d'utilisateur existe déjà
    if (agents.some(agent => agent.username === newAgent.username)) {
      toast({
        title: "Erreur",
        description: "Ce nom d'utilisateur existe déjà",
        variant: "destructive",
      });
      return;
    }

    onAdd(newAgent);
    setNewAgent({
      username: '',
      email: '',
      fullName: '',
      role: 'user',
      isActive: true
    });
    setShowAddDialog(false);
    toast({
      title: "Agent ajouté",
      description: "Le nouvel agent a été créé avec succès",
    });
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
  };

  const handleUpdateAgent = () => {
    if (!editingAgent) return;

    onUpdate(editingAgent.id, {
      username: editingAgent.username,
      email: editingAgent.email,
      fullName: editingAgent.fullName,
      role: editingAgent.role,
      isActive: editingAgent.isActive
    });
    setEditingAgent(null);
    toast({
      title: "Agent modifié",
      description: "Les informations ont été mises à jour avec succès",
    });
  };

  const handleDeleteAgent = (agent: Agent) => {
    if (agent.role === 'admin' && agents.filter(a => a.role === 'admin').length === 1) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le dernier administrateur",
        variant: "destructive",
      });
      return;
    }
    setDeletingAgent(agent);
  };

  const confirmDeleteAgent = () => {
    if (deletingAgent) {
      onDelete(deletingAgent.id);
      setDeletingAgent(null);
      toast({
        title: "Agent supprimé",
        description: "L'agent a été supprimé avec succès",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Administration des agents</h2>
        <p className="text-muted-foreground">
          Gérez les utilisateurs et leurs permissions d'accès
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {canEdit && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel agent</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    value={newAgent.username}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="nom.utilisateur"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAgent.email}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@entreprise.com"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    value={newAgent.fullName}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Prénom Nom"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rôle</Label>
                  <Select value={newAgent.role} onValueChange={(value: Agent['role']) => setNewAgent(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="viewer">Lecteur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={newAgent.isActive}
                    onCheckedChange={(checked) => setNewAgent(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Compte actif</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddAgent}>
                    Ajouter
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agents système</CardTitle>
          <CardDescription>
            {filteredAgents.length} agent(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                {canEdit && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{agent.fullName}</div>
                      <div className="text-sm text-muted-foreground">@{agent.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(agent.role)} className="flex items-center gap-1 w-fit">
                      {getRoleIcon(agent.role)}
                      {agent.role === 'admin' ? 'Administrateur' : 
                       agent.role === 'user' ? 'Utilisateur' : 'Lecteur'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={agent.isActive ? "default" : "secondary"}>
                      {agent.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {agent.lastLogin ? 
                      new Date(agent.lastLogin).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Jamais'
                    }
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAgent(agent)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAgent(agent)}
                          disabled={agent.role === 'admin' && agents.filter(a => a.role === 'admin').length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'agent</DialogTitle>
          </DialogHeader>
          {editingAgent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Nom d'utilisateur</Label>
                <Input
                  id="edit-username"
                  value={editingAgent.username}
                  onChange={(e) => setEditingAgent(prev => prev ? { ...prev, username: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingAgent.email}
                  onChange={(e) => setEditingAgent(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-fullName">Nom complet</Label>
                <Input
                  id="edit-fullName"
                  value={editingAgent.fullName}
                  onChange={(e) => setEditingAgent(prev => prev ? { ...prev, fullName: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Rôle</Label>
                <Select value={editingAgent.role} onValueChange={(value: Agent['role']) => setEditingAgent(prev => prev ? { ...prev, role: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="viewer">Lecteur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={editingAgent.isActive}
                  onCheckedChange={(checked) => setEditingAgent(prev => prev ? { ...prev, isActive: checked } : null)}
                />
                <Label htmlFor="edit-isActive">Compte actif</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingAgent(null)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateAgent}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!deletingAgent} onOpenChange={() => setDeletingAgent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'agent {deletingAgent?.fullName} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAgent}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}