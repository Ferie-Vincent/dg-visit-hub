import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  Settings, 
  User,
  BarChart3,
  FileText,
  Tags,
  Users
} from 'lucide-react';
interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  role: 'admin' | 'user' | 'viewer';
  created_at: string;
  updated_at: string;
}

interface HeaderProps {
  user: Profile | null;
  onLogout: () => void;
  onAdminPanel?: () => void;
  currentView: 'dashboard' | 'visits' | 'purposes' | 'administration';
  onViewChange: (view: 'dashboard' | 'visits' | 'purposes' | 'administration') => void;
}

export function Header({ user, onLogout, onAdminPanel, currentView, onViewChange }: HeaderProps) {
  if (!user) return null;
  return (
    <header className="border-b bg-card/95 backdrop-blur-sm shadow-sm animate-fade-in">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img src="/lovable-uploads/a191b29e-98bb-461b-8a0b-0f362e0b69cf.png" alt="DGIE Logo" className="h-8 w-auto" />
            <h1 className="text-lg font-semibold">DG Visit Hub</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('dashboard')}
              className="hover:scale-105 transition-all duration-200"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Tableau de bord
            </Button>
            <Button
              variant={currentView === 'visits' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('visits')}
              className="hover:scale-105 transition-all duration-200"
            >
              <FileText className="mr-2 h-4 w-4" />
              Visites
            </Button>
            <Button
              variant={currentView === 'purposes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('purposes')}
              className="hover:scale-105 transition-all duration-200"
            >
              <Tags className="mr-2 h-4 w-4" />
              Motifs
            </Button>
            {user?.role === 'admin' && (
              <Button
                variant={currentView === 'administration' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('administration')}
                className="hover:scale-105 transition-all duration-200"
              >
                <Users className="mr-2 h-4 w-4" />
                Administration
              </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{user?.display_name || 'Utilisateur'}</span>
            <Badge 
              variant={user?.role === 'admin' ? 'default' : 'secondary'}
              className="animate-scale-in"
            >
              {user?.role === 'admin' ? 'Administrateur' : user?.role === 'user' ? 'Utilisateur' : 'Consultation'}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            {user?.role === 'admin' && onAdminPanel && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onAdminPanel}
                className="hover:scale-110 transition-all duration-200 hover:bg-accent/20"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="hover:scale-110 transition-all duration-200 hover:bg-destructive/20"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden border-t px-6 py-2">
        <nav className="flex space-x-2 overflow-x-auto">
          <Button
            variant={currentView === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('dashboard')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Tableau de bord
          </Button>
          <Button
            variant={currentView === 'visits' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('visits')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Visites
          </Button>
          <Button
            variant={currentView === 'purposes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('purposes')}
          >
            <Tags className="mr-2 h-4 w-4" />
            Motifs
          </Button>
          {user?.role === 'admin' && (
            <Button
              variant={currentView === 'administration' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('administration')}
            >
              <Users className="mr-2 h-4 w-4" />
              Administration
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}