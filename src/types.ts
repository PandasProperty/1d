import { ID_TABLE_BARS, ID_TABLE_PARTS } from './constants';

export type GlobalData = {
  [ID_TABLE_BARS]: any[]; 
  [ID_TABLE_PARTS]: any[];
}

export interface NestingBoardProps {
  globalData: GlobalData;
  setGlobalData: (data: GlobalData) => void;
}

export interface ExcelLikeTableProps {
  data: any[];
  updateData: (row: number, column: number, value: any) => void; 
  table_id: keyof GlobalData;
  columnNames: any;
}