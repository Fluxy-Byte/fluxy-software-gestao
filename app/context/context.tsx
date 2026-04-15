"use client";

import { createContext, useContext, useState, ReactNode, JSX } from "react";
import { BuilderResponse } from "@/app/api/interfaces/builder.interface";

interface BuilderContextType {
  builder: BuilderResponse | null;
  setBuilder: (builder: BuilderResponse | null) => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: ReactNode }): JSX.Element {
  const [builder, setBuilder] = useState<BuilderResponse | null>(null);

  return (
    <BuilderContext.Provider value={{ builder, setBuilder }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useContextBuilder() {
  const context = useContext(BuilderContext);

  if (!context) {
    throw new Error("useContextBuilder deve ser usado dentro do BuilderProvider");
  }

  return context;
}