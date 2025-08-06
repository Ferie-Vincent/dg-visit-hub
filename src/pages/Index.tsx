import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { VisitsList } from '@/components/VisitsList';
import { VisitForm } from '@/components/VisitForm';
import { PurposesList } from '@/components/PurposesList';
import { AgentsList } from '@/components/AgentsList';
import { Header } from '@/components/Header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useVisits } from '@/hooks/useVisits';
import { useAgents } from '@/hooks/useAgents';
import { useToast } from '@/hooks/use-toast';
import { type Visit } from '@/lib/storage';

type ViewType = 'dashboard' | 'visits' | 'purposes' | 'administration';

const Index = () => {
  const { session, profile, signOut, loading } = useSupabaseAuth();
  const { visits, stats, purposes, addVisit, updateVisit, deleteVisit, searchVisits, exportToCSV, exportToJSON, addPurpose, updatePurpose, deletePurpose } = useVisits();
  const { agents, addAgent, updateAgent, deleteAgent } = useAgents();
  const { toast } = useToast();
  
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [deletingVisit, setDeletingVisit] = useState<Visit | null>(null);

  const handleLogout = async () => {
    await signOut();
    setCurrentView('dashboard');
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
  };

  const handleAddVisit = () => {
    setEditingVisit(null);
    setShowVisitForm(true);
  };

  const handleEditVisit = (visit: Visit) => {
    setEditingVisit(visit);
    setShowVisitForm(true);
  };

  const handleSaveVisit = (visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingVisit) {
        updateVisit(editingVisit.id, visitData);
        toast({
          title: "Visite modifiée",
          description: "Les informations ont été mises à jour avec succès",
        });
      } else {
        addVisit(visitData);
        toast({
          title: "Visite ajoutée",
          description: "La nouvelle visite a été enregistrée avec succès",
        });
      }
      setShowVisitForm(false);
      setEditingVisit(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVisit = (visit: Visit) => {
    setDeletingVisit(visit);
  };

  const confirmDeleteVisit = () => {
    if (deletingVisit) {
      deleteVisit(deletingVisit.id);
      toast({
        title: "Visite supprimée",
        description: "La visite a été supprimée avec succès",
      });
      setDeletingVisit(null);
    }
  };

  // Redirect to auth page if not authenticated
  if (!session && !loading) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const canEdit = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={profile}
        onLogout={handleLogout}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <main className="container mx-auto px-6 py-8">
        {currentView === 'dashboard' && stats && (
          <Dashboard stats={stats} visits={visits} />
        )}
        
        {currentView === 'visits' && (
          <VisitsList
            visits={visits}
            onAdd={handleAddVisit}
            onEdit={handleEditVisit}
            onDelete={handleDeleteVisit}
            onSearch={searchVisits}
            onExportCSV={exportToCSV}
            onExportJSON={exportToJSON}
            canEdit={canEdit}
          />
        )}
        
        {currentView === 'purposes' && (
          <PurposesList
            purposes={purposes}
            onAdd={addPurpose}
            onUpdate={updatePurpose}
            onDelete={deletePurpose}
            canEdit={canEdit}
          />
        )}
        
        {currentView === 'administration' && profile?.role === 'admin' && (
          <AgentsList
            agents={agents}
            onAdd={addAgent}
            onUpdate={updateAgent}
            onDelete={deleteAgent}
            canEdit={canEdit}
          />
        )}
      </main>

      <Dialog open={showVisitForm} onOpenChange={setShowVisitForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVisit ? 'Modifier la visite' : 'Nouvelle visite'}
            </DialogTitle>
          </DialogHeader>
          <VisitForm
            visit={editingVisit}
            purposes={purposes}
            onSave={handleSaveVisit}
            onCancel={() => {
              setShowVisitForm(false);
              setEditingVisit(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingVisit} onOpenChange={() => setDeletingVisit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la visite de {deletingVisit?.visitorName} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVisit}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;