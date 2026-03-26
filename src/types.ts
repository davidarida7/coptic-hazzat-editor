export type HazzatSymbolType = 
  | 'note-o' 
  | 'note-i' 
  | 'long' 
  | 'pause' 
  | 'trill' 
  | 'short' 
  | 'slur' 
  | 'high' 
  | 'low';

export interface HazzatSymbolItem {
  id: string;
  type: 'symbol';
  symbolType: HazzatSymbolType;
  offset: number; // Vertical offset
}

export interface HazzatTextItem {
  id: string;
  type: 'text';
  value: string;
  offset: number;
}

export type HazzatItem = HazzatSymbolItem | HazzatTextItem;

export interface HazzatLine {
  id: string;
  items: HazzatItem[];
}
