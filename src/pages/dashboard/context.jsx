import { createContext, useContext } from 'react';

export const DashboardContext = createContext(null);

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardContext.Provider');
  }
  return context;
}

