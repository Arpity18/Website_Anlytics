export * from "./FilterPill";
export * from "./Filter";

export interface FilterState {
  filters: Array<{
    label: string;
    checked: boolean;
  }>;
  is_select_all: boolean;
  selected_count: number;
  loading?: boolean;
}

export interface FilterStateMap {
  [key: string]: FilterState;
}
