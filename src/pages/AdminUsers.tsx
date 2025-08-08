import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ShieldPlus, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsers() {
  const { session, profile, loading } = useSupabaseAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'admin'|'user'|'viewer'>('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // SEO basics
  useEffect(() => {
    document.title = 'Gestion des utilisateurs | DG Visit Hub';
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'Gestion des utilisateurs (admin): créer des comptes et gérer les mots de passe';
      document.head.appendChild(m);
    } else {
      meta.setAttribute('content', 'Gestion des utilisateurs (admin): créer des comptes et gérer les mots de passe');
    }
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      const c = document.createElement('link');
      c.rel = 'canonical';
      c.href = window.location.href;
      document.head.appendChild(c);
    }
  }, []);

  if (!loading && !session) return <Navigate to="/auth" replace />;
  if (!loading && profile?.role !== 'admin') return <Navigate to="/" replace />;

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`https://jghcvawrtmrymmulknau.supabase.co/functions/v1/admin-create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaGN2YXdydG1yeW1tdWxrbmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTI0NTQsImV4cCI6MjA2OTU2ODQ1NH0.zmzQNC4cT78EQhS4LH981J4AfXjSNvDp6u58sIYAR7k',
        },
        body: JSON.stringify({ email, password, display_name: displayName, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création');
      toast({ title: 'Utilisateur créé', description: `Compte créé pour ${email}` });
      setEmail(''); setPassword(''); setDisplayName(''); setRole('user');
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const userId = prompt('Entrer l\'ID utilisateur (UUID) pour réinitialiser le mot de passe:');
      const newPass = prompt('Nouveau mot de passe:');
      if (!userId || !newPass) throw new Error('Champs requis');
      const res = await fetch(`https://jghcvawrtmrymmulknau.supabase.co/functions/v1/admin-update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaGN2YXdydG1yeW1tdWxrbmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTI0NTQsImV4cCI6MjA2OTU2ODQ1NH0.zmzQNC4cT78EQhS4LH981J4AfXjSNvDp6u58sIYAR7k',
        },
        body: JSON.stringify({ user_id: userId, new_password: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour');
      toast({ title: 'Mot de passe mis à jour', description: `Mot de passe réinitialisé.` });
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Gestion des utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={createUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: prenom.nom@dgvisithub.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe initial" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Nom affiché</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nom et prénom" />
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select value={role} onValueChange={(v) => setRole(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="viewer">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                <ShieldPlus className="mr-2 h-4 w-4" /> {isLoading ? 'Création…' : 'Créer l\'utilisateur'}
              </Button>
            </form>

            <div className="mt-6">
              <Button variant="secondary" onClick={updatePassword} disabled={isLoading} className="w-full">
                <KeyRound className="mr-2 h-4 w-4" /> Réinitialiser un mot de passe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
