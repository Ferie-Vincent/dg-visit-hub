import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { AlertCircle, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const { session, signIn, loading } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Bootstrap admin states (one-time setup)
  const [bootstrapEmail, setBootstrapEmail] = useState('admin@dgvisithub.com');
  const [bootstrapPassword, setBootstrapPassword] = useState('Admin#2025!');
  const [bootstrapDisplayName, setBootstrapDisplayName] = useState('Administrateur');
  const [bootstrapToken, setBootstrapToken] = useState('');
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [bootstrapError, setBootstrapError] = useState('');
  const [bootstrapSuccess, setBootstrapSuccess] = useState('');

  // Redirect if already authenticated
  if (session && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };
  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setBootstrapError('');
    setBootstrapSuccess('');
    setBootstrapLoading(true);
    try {
      const { error } = await supabase.functions.invoke('bootstrap-admin', {
        body: {
          email: bootstrapEmail,
          password: bootstrapPassword,
          display_name: bootstrapDisplayName,
        },
        headers: {
          'x-setup-token': bootstrapToken,
        },
      });
      if (error) throw error;
      setBootstrapSuccess('Administrateur créé. Vous pouvez maintenant vous connecter.');
    } catch (err: any) {
      setBootstrapError(err?.message || 'Erreur lors de l\'initialisation');
    } finally {
      setBootstrapLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Système de gestion des visites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4" aria-label="Formulaire de connexion">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dgvisithub.com"
                required
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signin-password">Mot de passe</Label>
              <Input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                autoComplete="current-password"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* One-time admin bootstrap section */}
          <div className="mt-6">
            <details>
              <summary className="text-sm cursor-pointer">Initialiser l'administrateur (setup)</summary>
              <div className="mt-4 space-y-3">
                {bootstrapError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{bootstrapError}</AlertDescription>
                  </Alert>
                )}
                {bootstrapSuccess && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{bootstrapSuccess}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleBootstrap} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="setup-token">Setup token (sécurité)</Label>
                    <Input id="setup-token" type="password" value={bootstrapToken} onChange={(e) => setBootstrapToken(e.target.value)} placeholder="Coller le SETUP_BOOTSTRAP_TOKEN" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bootstrap-email">Email admin</Label>
                    <Input id="bootstrap-email" type="email" value={bootstrapEmail} onChange={(e) => setBootstrapEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bootstrap-password">Mot de passe</Label>
                    <Input id="bootstrap-password" type="password" value={bootstrapPassword} onChange={(e) => setBootstrapPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bootstrap-name">Nom affiché</Label>
                    <Input id="bootstrap-name" value={bootstrapDisplayName} onChange={(e) => setBootstrapDisplayName(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={bootstrapLoading}>
                    {bootstrapLoading ? 'Initialisation…' : 'Créer l\'administrateur'}
                  </Button>
                </form>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}