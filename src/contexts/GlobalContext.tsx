import React, { createContext, useState, Dispatch, SetStateAction, ReactNode } from "react";

// Field names
export const ID_TABLE_BARS = "excel_table_bars";
export const ID_TABLE_PARTS = "excel_table_parts";

// Define the type for the context value
type GlobalContextType = {
  globalData: {
    [ID_TABLE_BARS]: any[]; 
    [ID_TABLE_PARTS]: any[];
  };
  setGlobalData: Dispatch<
    SetStateAction<{
      [ID_TABLE_BARS]: any[]; 
      [ID_TABLE_PARTS]: any[]; 
    }>
  >;
};

// Create a Context object with the correct type
export const GlobalContext = createContext<GlobalContextType>({
  globalData: {
    [ID_TABLE_BARS]: [],
    [ID_TABLE_PARTS]: [],
  },
  setGlobalData: () => {},
});

// Create a Provider Component
export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [globalData, setGlobalData] = useState<GlobalContextType["globalData"]>({
    [ID_TABLE_BARS]: [],
    [ID_TABLE_PARTS]: [],
  });

  // Any updates to sharedData will now be available to any child component that consumes this context
  return (
    <GlobalContext.Provider value={{ globalData, setGlobalData }}>
      {children}
    </GlobalContext.Provider>
  );
};
