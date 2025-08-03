import { useState, useEffect } from 'react';
import { visitStorage, purposeStorage, type Visit, type VisitStats } from '@/lib/storage';

export function useVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [purposes, setPurposes] = useState<string[]>([]);

  const refreshData = () => {
    const allVisits = visitStorage.getAll();
    setVisits(allVisits);
    setStats(visitStorage.getStats());
    setPurposes(purposeStorage.getAll());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addVisit = (visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVisit = visitStorage.add(visitData);
    refreshData();
    return newVisit;
  };

  const updateVisit = (id: string, updates: Partial<Visit>) => {
    const updatedVisit = visitStorage.update(id, updates);
    if (updatedVisit) {
      refreshData();
    }
    return updatedVisit;
  };

  const deleteVisit = (id: string) => {
    const success = visitStorage.delete(id);
    if (success) {
      refreshData();
    }
    return success;
  };

  const searchVisits = (query: string) => {
    return visitStorage.search(query);
  };

  const exportToCSV = () => {
    return visitStorage.exportToCSV();
  };

  const exportToJSON = () => {
    return visitStorage.exportToJSON();
  };

  const importData = (data: Visit[]) => {
    const success = visitStorage.import(data);
    if (success) {
      refreshData();
    }
    return success;
  };

  const clearAllData = () => {
    visitStorage.clear();
    refreshData();
  };

  const getStorageInfo = () => {
    return visitStorage.getStorageInfo();
  };

  const addPurpose = (purpose: string) => {
    const success = purposeStorage.add(purpose);
    if (success) {
      setPurposes(purposeStorage.getAll());
    }
    return success;
  };

  const updatePurpose = (oldPurpose: string, newPurpose: string) => {
    const success = purposeStorage.update(oldPurpose, newPurpose);
    if (success) {
      setPurposes(purposeStorage.getAll());
    }
    return success;
  };

  const deletePurpose = (purpose: string) => {
    const success = purposeStorage.delete(purpose);
    if (success) {
      setPurposes(purposeStorage.getAll());
    }
    return success;
  };

  return {
    visits,
    stats,
    purposes,
    addVisit,
    updateVisit,
    deleteVisit,
    searchVisits,
    exportToCSV,
    exportToJSON,
    importData,
    clearAllData,
    getStorageInfo,
    refreshData,
    addPurpose,
    updatePurpose,
    deletePurpose
  };
}