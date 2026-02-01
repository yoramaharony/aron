'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AdminUiState = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
};

const AdminUiContext = createContext<AdminUiState | undefined>(undefined);
const STORAGE_KEY = 'aron:admin:sidebarCollapsed';

export function AdminUiProvider({ children }: { children: React.ReactNode }) {
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

  const value = useMemo<AdminUiState>(() => {
    return {
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((v) => !v),
    };
  }, [sidebarCollapsed]);

  return <AdminUiContext.Provider value={value}>{children}</AdminUiContext.Provider>;
}

export function useAdminUi() {
  const ctx = useContext(AdminUiContext);
  if (!ctx) throw new Error('useAdminUi must be used within AdminUiProvider');
  return ctx;
}

