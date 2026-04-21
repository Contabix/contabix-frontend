"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type FYContextType = {
  startDate: string | null;
  endDate: string | null;
  setFinancialYear: (start: string, end: string) => void;
  isReady: boolean;
};

const FYContext = createContext<FYContextType | undefined>(undefined);

export function FinancialYearProvider({ children }: { children: React.ReactNode }) {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedStart = localStorage.getItem("fy_start");
    const storedEnd = localStorage.getItem("fy_end");
    if (storedStart && storedEnd) {
      setStartDate(storedStart);
      setEndDate(storedEnd);
    }
    setIsReady(true);
  }, []);

  const setFinancialYear = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    localStorage.setItem("fy_start", start);
    localStorage.setItem("fy_end", end);
  };

  return (
    <FYContext.Provider value={{ startDate, endDate, setFinancialYear, isReady }}>
      {children}
    </FYContext.Provider>
  );
}

export const useFinancialYear = () => {
  const context = useContext(FYContext);
  if (!context) throw new Error("useFinancialYear must be used within FinancialYearProvider");
  return context;
};