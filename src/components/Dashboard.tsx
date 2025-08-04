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
import { type VisitStats, type Visit } from '@/lib/storage';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

interface DashboardProps {
  stats: VisitStats;
  visits: Visit[];
}

export function Dashboard({ stats, visits }: DashboardProps) {
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

  // Préparer les données pour les graphiques
  const prepareVisitsOverTimeData = () => {
    const visitsByDate = visits.reduce((acc, visit) => {
      const date = visit.date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(visitsByDate)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7) // Derniers 7 jours
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        visites: count
      }));
  };

  const preparePurposeData = () => {
    const purposeCounts = visits.reduce((acc, visit) => {
      acc[visit.purpose] = (acc[visit.purpose] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(purposeCounts)
      .map(([purpose, count]) => ({
        name: purpose,
        value: count,
        percentage: Math.round((count / visits.length) * 100)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 motifs
  };

  const prepareStrategicData = () => {
    const strategicCount = visits.filter(v => v.isStrategic).length;
    const nonStrategicCount = visits.length - strategicCount;
    
    return [
      { name: 'Stratégiques', value: strategicCount, fill: 'hsl(var(--chart-1))' },
      { name: 'Non stratégiques', value: nonStrategicCount, fill: 'hsl(var(--chart-2))' }
    ];
  };

  const prepareDurationTrendData = () => {
    const visitsByDate = visits.reduce((acc, visit) => {
      if (visit.duration) {
        const date = visit.date;
        if (!acc[date]) {
          acc[date] = { total: 0, count: 0 };
        }
        acc[date].total += visit.duration;
        acc[date].count += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(visitsByDate)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        duree: Math.round(data.total / data.count)
      }));
  };

  const visitsOverTime = prepareVisitsOverTimeData();
  const purposeData = preparePurposeData();
  const strategicData = prepareStrategicData();
  const durationTrend = prepareDurationTrendData();

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))', 
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  const chartConfig = {
    visites: {
      label: "Visites",
      color: "hsl(var(--chart-1))",
    },
    duree: {
      label: "Durée (min)",
      color: "hsl(var(--chart-2))",
    },
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
        <Card className="animate-fade-in hover:scale-105 transition-all duration-300 bg-gradient-to-br from-chart-1 to-chart-1/80 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Total des visites
            </CardTitle>
            <Users className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalVisits}</div>
            <p className="text-xs opacity-75">
              Toutes périodes confondues
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:scale-105 transition-all duration-300 bg-gradient-to-br from-chart-2 to-chart-2/80 text-white border-0 shadow-lg" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Visiteurs uniques
            </CardTitle>
            <Activity className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.uniqueVisitors}</div>
            <p className="text-xs opacity-75">
              Personnes différentes
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:scale-105 transition-all duration-300 bg-gradient-to-br from-chart-3 to-chart-3/80 text-white border-0 shadow-lg" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Durée moyenne
            </CardTitle>
            <Clock className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatDuration(stats.averageDuration)}
            </div>
            <p className="text-xs opacity-75">
              Par visite
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:scale-105 transition-all duration-300 bg-gradient-to-br from-chart-4 to-chart-4/80 text-white border-0 shadow-lg" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Temps total
            </CardTitle>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatTotalTime(stats.totalTime)}
            </div>
            <p className="text-xs opacity-75">
              Cumul des visites
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:scale-105 transition-all duration-300 bg-gradient-to-br from-accent to-accent/80 text-white border-0 shadow-lg" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Visites stratégiques
            </CardTitle>
            <Star className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(stats.strategicPercentage)}%
            </div>
            <p className="text-xs opacity-75">
              Du total des visites
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple to-purple/80 text-white border-0 shadow-lg" style={{ animationDelay: '0.5s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Cette semaine
            </CardTitle>
            <Calendar className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.weeklyVisits}</div>
            <p className="text-xs opacity-75">
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

      {/* Section des graphiques */}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Analyse graphique</h3>
          <p className="text-muted-foreground">
            Visualisation détaillée des données de visite
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Graphique évolution des visites */}
          <Card className="animate-scale-in shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Évolution des visites
              </CardTitle>
              <CardDescription>7 derniers jours</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={visitsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="visites" 
                    fill="var(--color-visites)" 
                    radius={[6, 6, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Graphique motifs de visite */}
          <Card className="animate-scale-in shadow-xl hover:shadow-2xl transition-all duration-300 border-0" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Répartition par motif
              </CardTitle>
              <CardDescription>Top des motifs de visite</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <PieChart>
                  <Pie
                    data={purposeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ percentage }) => `${percentage}%`}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    className="hover:opacity-80 transition-opacity"
                  >
                    {purposeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Graphique visites stratégiques */}
          <Card className="animate-fade-in shadow-xl hover:shadow-2xl transition-all duration-300 border-0" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple to-primary bg-clip-text text-transparent">
                Visites stratégiques
              </CardTitle>
              <CardDescription>Répartition stratégique vs non stratégique</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <PieChart>
                  <Pie
                    data={strategicData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    label={({ value, name }) => `${name}: ${value}`}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    className="hover:opacity-80 transition-opacity"
                  >
                    {strategicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Graphique évolution durée moyenne */}
          <Card className="animate-fade-in shadow-xl hover:shadow-2xl transition-all duration-300 border-0" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Durée moyenne des visites
              </CardTitle>
              <CardDescription>Évolution sur 7 jours (en minutes)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <LineChart data={durationTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="duree" 
                    stroke="var(--color-duree)" 
                    strokeWidth={3}
                    dot={{ fill: "var(--color-duree)", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: "var(--color-duree)" }}
                    className="hover:opacity-80 transition-opacity"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}