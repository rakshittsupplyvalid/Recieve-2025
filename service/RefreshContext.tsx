import React, { createContext, useState, useCallback, ReactNode } from "react";

interface RefreshContextType {
  refreshing: boolean;
  onRefresh: () => void;
}

export const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

interface RefreshProviderProps {
  children: ReactNode;
}

export const RefreshProvider: React.FC<RefreshProviderProps> = ({ children }) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchCounts = async () => {
    console.log("Fetching counts...");
    // Simulate API call
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCounts().finally(() => setRefreshing(false));
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshing, onRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};
