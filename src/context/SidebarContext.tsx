"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface SidebarContextType {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isSidebarOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
