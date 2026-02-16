export interface Filter {
  label: string;
  checked: boolean;
}

export interface FilterState {
  filters: Filter[];
  state?: any;
  loading?: boolean;
  is_select_all?: boolean;
  selected_count?: number;
}

export type onSubmit = (id: string, data: FilterState) => void;

export interface FilterProps {
  filter: {
    [key: string]: FilterState;
  };
  onChange: (id: string, filterState: FilterState) => void;
} 