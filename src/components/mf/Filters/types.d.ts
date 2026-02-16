export type Filter = { label: string; checked: boolean };
export type FilterPillPropType = {
  id: string;
  title: string;
  filters: Filter[];
  loading: boolean;
  onSubmit: onSubmit;
  onSearch: (id: string, s: string) => void;
};
export type onSubmit = (
  id: string,
  data: {
    filters: Filter[];
    is_select_all: boolean;
    selected_count: number;
  },
) => void;
