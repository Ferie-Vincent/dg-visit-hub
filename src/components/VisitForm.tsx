import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Visit } from '@/lib/storage';

interface VisitFormProps {
  visit?: Visit;
  onSave: (visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function VisitForm({ visit, onSave, onCancel }: VisitFormProps) {
  const [formData, setFormData] = useState({
    visitorName: '',
    company: '',
    purpose: '',
    date: '',
    startTime: '',
    endTime: '',
    isStrategic: false,
    notes: ''
  });

  useEffect(() => {
    if (visit) {
      setFormData({
        visitorName: visit.visitorName,
        company: visit.company,
        purpose: visit.purpose,
        date: visit.date,
        startTime: visit.startTime,
        endTime: visit.endTime || '',
        isStrategic: visit.isStrategic,
        notes: visit.notes || ''
      });
    } else {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: today }));
    }
  }, [visit]);

  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.round(diffMs / (1000 * 60))); // Convert to minutes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const duration = calculateDuration(formData.startTime, formData.endTime);
    
    onSave({
      visitorName: formData.visitorName.trim(),
      company: formData.company.trim(),
      purpose: formData.purpose.trim(),
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime || undefined,
      duration: duration > 0 ? duration : undefined,
      isStrategic: formData.isStrategic,
      notes: formData.notes.trim() || undefined
    });
  };

  const isValid = formData.visitorName && formData.company && formData.purpose && 
                  formData.date && formData.startTime;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {visit ? 'Modifier la visite' : 'Nouvelle visite'}
        </CardTitle>
        <CardDescription>
          {visit ? 'Modifiez les informations de la visite' : 'Enregistrez une nouvelle visite'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visitorName">Nom du visiteur *</Label>
              <Input
                id="visitorName"
                value={formData.visitorName}
                onChange={(e) => setFormData(prev => ({ ...prev, visitorName: e.target.value }))}
                placeholder="Nom complet du visiteur"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Nom de l'entreprise"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Motif de la visite *</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="Objectif ou sujet de la visite"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startTime">Heure de début *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">Heure de fin</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          {formData.startTime && formData.endTime && (
            <div className="text-sm text-muted-foreground">
              Durée calculée : {calculateDuration(formData.startTime, formData.endTime)} minutes
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="isStrategic"
              checked={formData.isStrategic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isStrategic: checked }))}
            />
            <Label htmlFor="isStrategic">Visite stratégique</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Remarques, conclusions ou points importants..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={!isValid}>
              {visit ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}