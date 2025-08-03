import { useState, useEffect } from 'react';
import { agentStorage, type Agent } from '@/lib/storage';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);

  const refreshData = () => {
    const allAgents = agentStorage.getAll();
    setAgents(allAgents);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addAgent = (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAgent = agentStorage.add(agentData);
    refreshData();
    return newAgent;
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    const updatedAgent = agentStorage.update(id, updates);
    if (updatedAgent) {
      refreshData();
    }
    return updatedAgent;
  };

  const deleteAgent = (id: string) => {
    const success = agentStorage.delete(id);
    if (success) {
      refreshData();
    }
    return success;
  };

  const findByUsername = (username: string) => {
    return agentStorage.findByUsername(username);
  };

  const updateLastLogin = (id: string) => {
    const updatedAgent = agentStorage.updateLastLogin(id);
    if (updatedAgent) {
      refreshData();
    }
    return updatedAgent;
  };

  return {
    agents,
    addAgent,
    updateAgent,
    deleteAgent,
    findByUsername,
    updateLastLogin,
    refreshData
  };
}