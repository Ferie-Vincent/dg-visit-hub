import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  LogOut, 
  Settings, 
  User,
  BarChart3,
  FileText,
  Tags
} from 'lucide-react';
import { type User as UserType } from '@/lib/auth';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
  onAdminPanel?: () => void;
  currentView: 'dashboard' | 'visits' | 'purposes';
  onViewChange: (view: 'dashboard' | 'visits' | 'purposes') => void;
}

export function Header({ user, onLogout, onAdminPanel, currentView, onViewChange }: HeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">DG Visit Hub</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2">
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
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{user.username}</span>
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
              {user.role === 'admin' ? 'Administrateur' : 'Consultation'}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            {user.role === 'admin' && onAdminPanel && (
              <Button variant="ghost" size="sm" onClick={onAdminPanel}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onLogout}>
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
        </nav>
      </div>
    </header>
  );
}