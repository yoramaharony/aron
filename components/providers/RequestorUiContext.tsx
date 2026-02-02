'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type RequestorUiState = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
};

const RequestorUiContext = createContext<RequestorUiState | undefined>(undefined);
const STORAGE_KEY = 'aron:requestor:sidebarCollapsed';

export function RequestorUiProvider({ children }: { children: React.ReactNode }) {
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

  const value = useMemo<RequestorUiState>(() => {
    return {
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((v) => !v),
    };
  }, [sidebarCollapsed]);

  return <RequestorUiContext.Provider value={value}>{children}</RequestorUiContext.Provider>;
}

export function useRequestorUi() {
  const ctx = useContext(RequestorUiContext);
  if (!ctx) throw new Error('useRequestorUi must be used within RequestorUiProvider');
  return ctx;
}

