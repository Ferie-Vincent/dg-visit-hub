import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Star,
  Activity
} from 'lucide-react';
import { type VisitStats } from '@/lib/storage';

interface DashboardProps {
  stats: VisitStats;
}

export function Dashboard({ stats }: DashboardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTotalTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMins = Math.round(minutes % 60);
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground">
          Vue d'ensemble des visites de la Direction Générale
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des visites
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisits}</div>
            <p className="text-xs text-muted-foreground">
              Toutes périodes confondues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visiteurs uniques
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">
              Personnes différentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Durée moyenne
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats.averageDuration)}
            </div>
            <p className="text-xs text-muted-foreground">
              Par visite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Temps total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTotalTime(stats.totalTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cumul des visites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visites stratégiques
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.strategicPercentage)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Du total des visites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cette semaine
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyVisits}</div>
            <p className="text-xs text-muted-foreground">
              7 derniers jours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Résumé de l'activité des visites
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                <span className="text-sm">Visites totales</span>
              </div>
              <Badge variant="secondary">{stats.totalVisits}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                <span className="text-sm">Visites stratégiques</span>
              </div>
              <Badge variant="secondary">
                {Math.round((stats.strategicPercentage / 100) * stats.totalVisits)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                <span className="text-sm">Cette semaine</span>
              </div>
              <Badge variant="secondary">{stats.weeklyVisits}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>
              Analyse des données de visite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taux de visites stratégiques</span>
                <span className="font-medium">{Math.round(stats.strategicPercentage)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-chart-2 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(stats.strategicPercentage, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Activité hebdomadaire</span>
                <span className="font-medium">
                  {stats.totalVisits > 0 ? Math.round((stats.weeklyVisits / stats.totalVisits) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-chart-1 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${stats.totalVisits > 0 ? Math.min((stats.weeklyVisits / stats.totalVisits) * 100, 100) : 0}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}