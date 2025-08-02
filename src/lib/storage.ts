export interface Visit {
  id: string;
  visitorName: string;
  company: string;
  purpose: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration?: number; // en minutes
  isStrategic: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  averageDuration: number;
  totalTime: number;
  strategicPercentage: number;
  weeklyVisits: number;
}

class VisitStorage {
  private storageKey = 'dg-visit-hub-visits';

  getAll(): Visit[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  save(visits: Visit[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(visits));
  }

  add(visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Visit {
    const visits = this.getAll();
    const newVisit: Visit = {
      ...visit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    visits.push(newVisit);
    this.save(visits);
    return newVisit;
  }

  update(id: string, updates: Partial<Visit>): Visit | null {
    const visits = this.getAll();
    const index = visits.findIndex(v => v.id === id);
    
    if (index === -1) return null;
    
    visits[index] = {
      ...visits[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.save(visits);
    return visits[index];
  }

  delete(id: string): boolean {
    const visits = this.getAll().filter(v => v.id !== id);
    this.save(visits);
    return true;
  }

  getStats(): VisitStats {
    const visits = this.getAll();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const uniqueVisitors = new Set(visits.map(v => v.visitorName.toLowerCase())).size;
    const visitsWithDuration = visits.filter(v => v.duration && v.duration > 0);
    const averageDuration = visitsWithDuration.length > 0 
      ? visitsWithDuration.reduce((sum, v) => sum + (v.duration || 0), 0) / visitsWithDuration.length
      : 0;
    const totalTime = visits.reduce((sum, v) => sum + (v.duration || 0), 0);
    const strategicVisits = visits.filter(v => v.isStrategic).length;
    const strategicPercentage = visits.length > 0 ? (strategicVisits / visits.length) * 100 : 0;
    const weeklyVisits = visits.filter(v => new Date(v.date) >= weekAgo).length;

    return {
      totalVisits: visits.length,
      uniqueVisitors,
      averageDuration,
      totalTime,
      strategicPercentage,
      weeklyVisits
    };
  }

  search(query: string): Visit[] {
    const visits = this.getAll();
    const searchTerm = query.toLowerCase();
    
    return visits.filter(visit => 
      visit.visitorName.toLowerCase().includes(searchTerm) ||
      visit.company.toLowerCase().includes(searchTerm) ||
      visit.purpose.toLowerCase().includes(searchTerm)
    );
  }

  exportToCSV(): string {
    const visits = this.getAll();
    const headers = ['Date', 'Visiteur', 'Entreprise', 'Motif', 'Heure début', 'Heure fin', 'Durée (min)', 'Stratégique', 'Notes'];
    
    const csvContent = [
      headers.join(','),
      ...visits.map(v => [
        v.date,
        `"${v.visitorName}"`,
        `"${v.company}"`,
        `"${v.purpose}"`,
        v.startTime,
        v.endTime || '',
        v.duration || '',
        v.isStrategic ? 'Oui' : 'Non',
        `"${v.notes || ''}"`
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  exportToJSON(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  import(data: Visit[]): boolean {
    try {
      // Validate data structure
      if (!Array.isArray(data)) return false;
      
      data.forEach(visit => {
        if (!visit.id || !visit.visitorName || !visit.company || !visit.purpose || !visit.date) {
          throw new Error('Invalid visit data structure');
        }
      });

      this.save(data);
      return true;
    } catch {
      return false;
    }
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  getStorageInfo(): { used: number; total: number; percentage: number } {
    const used = new Blob([localStorage.getItem(this.storageKey) || '']).size;
    const total = 5 * 1024 * 1024; // 5MB approximation for localStorage
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  }
}

export const visitStorage = new VisitStorage();