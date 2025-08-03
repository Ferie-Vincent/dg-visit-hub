import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PurposesListProps {
  purposes: string[];
  onAdd: (purpose: string) => boolean;
  onUpdate: (oldPurpose: string, newPurpose: string) => boolean;
  onDelete: (purpose: string) => boolean;
  canEdit: boolean;
}

export function PurposesList({ purposes, onAdd, onUpdate, onDelete, canEdit }: PurposesListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState<string | null>(null);
  const [newPurpose, setNewPurpose] = useState('');
  const [editValue, setEditValue] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    if (!newPurpose.trim()) {
      toast({
        title: "Erreur",
        description: "Le motif ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    const success = onAdd(newPurpose.trim());
    if (success) {
      toast({
        title: "Motif ajouté",
        description: "Le nouveau motif a été ajouté avec succès",
      });
      setNewPurpose('');
      setShowAddDialog(false);
    } else {
      toast({
        title: "Erreur",
        description: "Ce motif existe déjà",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (purpose: string) => {
    setEditingPurpose(purpose);
    setEditValue(purpose);
  };

  const handleUpdate = () => {
    if (!editValue.trim()) {
      toast({
        title: "Erreur",
        description: "Le motif ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    if (editingPurpose) {
      const success = onUpdate(editingPurpose, editValue.trim());
      if (success) {
        toast({
          title: "Motif modifié",
          description: "Le motif a été modifié avec succès",
        });
        setEditingPurpose(null);
        setEditValue('');
      } else {
        toast({
          title: "Erreur",
          description: "Ce motif existe déjà",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = (purpose: string) => {
    const success = onDelete(purpose);
    if (success) {
      toast({
        title: "Motif supprimé",
        description: "Le motif a été supprimé avec succès",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des motifs</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les motifs de visite prédéfinis pour éviter les erreurs de saisie
          </p>
        </div>
        {canEdit && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un motif
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau motif</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nom du motif"
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAdd}>
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
          <CardTitle className="flex items-center gap-2">
            Liste des motifs ({purposes.length})
          </CardTitle>
          <CardDescription>
            Motifs de visite disponibles pour les nouvelles visites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purposes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun motif configuré
            </div>
          ) : (
            <div className="grid gap-3">
              {purposes.map((purpose) => (
                <div
                  key={purpose}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {editingPurpose === purpose ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleUpdate}>
                        Valider
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setEditingPurpose(null)}
                      >
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Badge variant="secondary" className="text-sm">
                        {purpose}
                      </Badge>
                      {canEdit && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(purpose)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer le motif "{purpose}" ?
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(purpose)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}