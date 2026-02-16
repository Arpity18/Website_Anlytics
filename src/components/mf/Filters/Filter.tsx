"use client";

import React, {
  useReducer,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { FilterPill, FilterState } from "./FilterPill";
import { session } from "@/lib/utils";
import { onSubmit } from "./types";

interface ExtendedFilterState extends FilterState {
  loading?: boolean;
}

interface FilterProps {
  report?: boolean;
  component?: ReactNode;
  filter: { [key in string]: ExtendedFilterState };
  onChange: (d: State) => void;
  isSearchable?: boolean;
  onSearch?: (id: string, query: string) => void;
  itemsPerPage?: number;
  grouped?: boolean;
  publisherGroups?: { [key: string]: string[] };
}

type FilterPayload = { [key: string]: ExtendedFilterState };

export function Filter({
  report = false,
  component,
  filter,
  onChange,
  isSearchable = false,
  onSearch,
  itemsPerPage = 5,
  grouped = false,
  publisherGroups,
}: FilterProps) {
  const [state, setState] = useState<FilterPayload>(filter);
  console.log("state", state);

  useEffect(() => {
    setState(filter);
  }, [filter]);

  const handleSubmit = (id: string, data: FilterState & { groupedFilters?: { [key: string]: string[] } }) => {
    console.log("data", data);
    if (grouped && data.groupedFilters) {
      // Use data.groupedFilters for grouped data
      const newState = { ...state, [id]: { ...data, filters: data.filters, groupedFilters: data.groupedFilters } };
      setState(newState);
      onChange(newState);
    } else {
      // Not grouped: send as is
      const newState = { ...state, [id]: data };
      setState(newState);
      onChange(newState);
    }
  };

  const loadingRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(state).map(([id, filterState]) => {
        return (
          <FilterPill
            key={id}
            id={id}
            title={id}
            filters={filterState.filters}
            onSubmit={handleSubmit}
            loading={filterState.loading || false}
            grouped={grouped}
            publisherGroups={publisherGroups || {}}
            isSearchable={true}
            
          />
        );
      })}
      <div ref={loadingRef} className="h-10" />
    </div>
  );
}

// #################### Logic ####################

enum ActionType {
  SET = "SET",
  GET = "GET",
}

type State = {
  [key in string]: FilterState;
};

type Action = {
  type: ActionType;
  payload?: Record<string, FilterState>;
};

// Actions
function Set(id: string, p: FilterState): Action {
  return { type: ActionType.SET, payload: { [id]: p } };
}

function Reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SET: {
      if (!action.payload) return state;
      const s = { ...state, ...action.payload };
      session.set("filter", s);
      return s;
    }
    case ActionType.GET: {
      return state;
    }
    default:
      return state;
  }
}

function useFilterReducer(filter: { [key in string]: FilterState }) {
  return useReducer(Reducer, filter);
}