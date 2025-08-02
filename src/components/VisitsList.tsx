import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Star,
  Calendar,
  Clock
} from 'lucide-react';
import { type Visit } from '@/lib/storage';

interface VisitsListProps {
  visits: Visit[];
  onAdd: () => void;
  onEdit: (visit: Visit) => void;
  onDelete: (visit: Visit) => void;
  onSearch: (query: string) => Visit[];
  onExportCSV: () => string;
  onExportJSON: () => string;
  canEdit: boolean;
}

export function VisitsList({ 
  visits, 
  onAdd, 
  onEdit, 
  onDelete, 
  onSearch, 
  onExportCSV, 
  onExportJSON,
  canEdit 
}: VisitsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVisits, setFilteredVisits] = useState(visits);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredVisits(visits);
    } else {
      const results = onSearch(query);
      setFilteredVisits(results);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const content = onExportCSV();
    const date = new Date().toISOString().split('T')[0];
    downloadFile(content, `visites-${date}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const content = onExportJSON();
    const date = new Date().toISOString().split('T')[0];
    downloadFile(content, `visites-${date}.json`, 'application/json');
  };

  // Update filtered visits when visits prop changes
  useState(() => {
    if (!searchQuery.trim()) {
      setFilteredVisits(visits);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des visites</h2>
          <p className="text-muted-foreground">
            {visits.length} visite{visits.length !== 1 ? 's' : ''} enregistrée{visits.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          {canEdit && (
            <Button onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle visite
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Liste des visites</CardTitle>
              <CardDescription>
                Historique complet des visites de la Direction Générale
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, entreprise ou motif..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-full sm:w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVisits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'Aucune visite trouvée pour cette recherche' : 'Aucune visite enregistrée'}
              </p>
              {canEdit && !searchQuery && (
                <Button className="mt-4" onClick={onAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter la première visite
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visiteur</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Heure</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Type</TableHead>
                    {canEdit && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="font-medium">
                        {visit.visitorName}
                      </TableCell>
                      <TableCell>{visit.company}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {visit.purpose}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(visit.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {visit.startTime}
                          {visit.endTime && ` - ${visit.endTime}`}
                        </div>
                      </TableCell>
                      <TableCell>{formatDuration(visit.duration)}</TableCell>
                      <TableCell>
                        {visit.isStrategic ? (
                          <Badge variant="default" className="gap-1">
                            <Star className="h-3 w-3" />
                            Stratégique
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Standard</Badge>
                        )}
                      </TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(visit)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(visit)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}