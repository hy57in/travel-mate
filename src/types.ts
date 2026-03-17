export interface ItineraryItem {
  time: string;
  text: string;
  type: string;
  url?: string;
  lat?: number;
  lng?: number;
  hl?: boolean;
  skip?: boolean;
  pend?: boolean;
}

export interface Day {
  date: string;
  title: string;
  memo: string;
  items: ItineraryItem[];
}

export interface Expense {
  id: number;
  cat: string;
  name: string;
  amt: number;
  ok: boolean;
  day?: number | null;
  paidBy?: number;
}

export interface ChecklistItem {
  id: number;
  cat: string;
  text: string;
  done: boolean;
}

export interface Trip {
  id: string;
  name: string;
  emoji: string;
  dates: string;
  startDate: string;
  travelers: number;
  travelerNames: string[];
  rate: number;
  memo: string;
  days: Day[];
  expenses: Expense[];
  checklist: ChecklistItem[];
}

export interface BudgetSummary {
  confirmedAmount: number;
  estimatedAmount: number;
  total: number;
  perPerson: number;
  categoryTotals: Record<string, number>;
  donutData: DonutDataItem[];
  settlement: SettlementItem[];
}

export interface DonutDataItem {
  color: string;
  value: number;
  label: string;
}

export interface SettlementItem {
  name: string;
  paid: number;
  shouldPay: number;
  diff: number;
}

export interface ChecklistSummary {
  done: number;
  total: number;
  percent: number;
}

export interface WeatherForecast {
  date: string;
  maxC: string;
  minC: string;
  desc: string;
  icon: string;
}

export type DialogState =
  | { type: "item"; dayIdx: number; itemIdx?: number; isNew?: boolean }
  | { type: "addExp" }
  | { type: "addChk" }
  | { type: "settings" }
  | { type: "trip" }
  | { type: "ai" }
  | { type: "login" }
  | null;

export interface ConfirmDeleteState {
  msg: string;
  onOk: () => void;
}

export interface StorageData {
  trips: Trip[];
  aid: string;
}
