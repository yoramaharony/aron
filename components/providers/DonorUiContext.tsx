'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type DonorUiState = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
};

const DonorUiContext = createContext<DonorUiState | undefined>(undefined);

const STORAGE_KEY = 'aron:donor:sidebarCollapsed';

export function DonorUiProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === '1') setSidebarCollapsed(true);
      if (raw === '0') setSidebarCollapsed(false);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, sidebarCollapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [sidebarCollapsed]);

  const value = useMemo<DonorUiState>(() => {
    return {
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((v) => !v),
    };
  }, [sidebarCollapsed]);

  return <DonorUiContext.Provider value={value}>{children}</DonorUiContext.Provider>;
}

export function useDonorUi() {
  const ctx = useContext(DonorUiContext);
  if (!ctx) throw new Error('useDonorUi must be used within DonorUiProvider');
  return ctx;
}

