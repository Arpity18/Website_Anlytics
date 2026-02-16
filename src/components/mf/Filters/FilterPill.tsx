"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EllipsisTooltip from "../EllipsisTooltip";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Search, ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useReducer, useState, useRef, useCallback } from "react";
import MFSpinner from "../MFSpinner";

// #################### Types ####################
interface Filter {
  label: string;
  checked: boolean;
  group?: string;
}

interface FilterPillProps {
  id: string;
  title: string;
  filters: Array<Filter> | { [key: string]: string[] };
  onSubmit: (id: string, data: { is_select_all: boolean; selected_count: number; filters: Filter[] | { [key: string]: string[] }; grouped?: boolean }) => void;
  onSearch?: (id: string, query: string) => void;
  loading: boolean;
  isSearchable?: boolean;
  grouped?: boolean;
  filterGroups?: { [key: string]: string[] };
  publisherGroups: { [key: string]: string[] };
}

export type FilterState = {
  is_select_all: boolean;
  selected_count: number;
  filters: Filter[];
  grouped?: boolean;
};

enum ActionType {
  TOGGLE = "TOGGLE",
  SELECT_ALL = "SELECT_ALL",
  UN_SELECT_ALL = "UN_SELECT_ALL",
  SET_FILTERS = "SET_FILTERS",
  TOGGLE_GROUP = "TOGGLE_GROUP",
}

type Action =
  | { type: ActionType.TOGGLE; payload: number }
  | { type: ActionType.SELECT_ALL }
  | { type: ActionType.UN_SELECT_ALL }
  | { type: ActionType.SET_FILTERS; payload: Filter[] }
  | { type: ActionType.TOGGLE_GROUP; payload: { group: string; checked: boolean }  };

// #################### Reducer ####################
function Reducer(state: FilterState, action: Action): FilterState {
  switch (action.type) {
    case ActionType.TOGGLE: {
      const f = state.filters.at(action.payload);
      let count = state.selected_count;
      if (!f) return state;
      if (f.checked) {
        f.checked = false;
        count--;
      } else {
        f.checked = true;
        count++;
      }
      const filters = [
        ...state.filters.slice(0, action.payload),
        f,
        ...state.filters.slice(action.payload + 1),
      ];
      return {
        ...state,
        is_select_all: count === filters.length,
        filters,
        selected_count: count,
      };
    }
    case ActionType.SELECT_ALL: {
      return {
        ...state,
        is_select_all: true,
        selected_count: state.filters.length,
        filters: state.filters.map((v) => ({ 
          ...v, 
          checked: true 
        })),
      };
    }
    case ActionType.UN_SELECT_ALL: {
      return {
        ...state,
        is_select_all: false,
        selected_count: 0,
        filters: state.filters.map((v) => ({ 
          ...v, 
          checked: false 
        })),
      };
    }
    case ActionType.SET_FILTERS: {
      const newFilters = action.payload;
      const selectedCount = newFilters.filter((v) => v.checked).length;
      return {
        ...state,
        filters: newFilters,
        selected_count: selectedCount,
        is_select_all: newFilters.length === selectedCount,
      };
    }
    
    case ActionType.TOGGLE_GROUP: {
      const { group, checked } = action.payload
      const updatedFilters = state.filters.map((filter) => 
        (filter.group === group ? { ...filter, checked } : filter)
      )
      const selectedCount = updatedFilters.filter((v) => v.checked).length
      return {
        ...state,
        filters: updatedFilters,
        selected_count: selectedCount,
        is_select_all: selectedCount === updatedFilters.length,
      }
    }
    
    default:
      return state;
  }
}

// #################### Actions ####################
function toggle(index: number): { type: ActionType.TOGGLE; payload: number } {
  return { type: ActionType.TOGGLE, payload: index };
}

function selectAll(): { type: ActionType.SELECT_ALL } {
  return { type: ActionType.SELECT_ALL };
}

function unSelectAll(): { type: ActionType.UN_SELECT_ALL } {
  return { type: ActionType.UN_SELECT_ALL };
}

function setFilters(filters: Filter[]): { type: ActionType.SET_FILTERS; payload: Filter[] } {
  return { type: ActionType.SET_FILTERS, payload: filters };
}

function toggleGroup(group: string, checked: boolean): { type: ActionType.TOGGLE_GROUP; payload: { group: string; checked: boolean } } {
  return { type: ActionType.TOGGLE_GROUP, payload: { group, checked } };
}


// #################### Custom Hook ####################
function useFilterReducer(filters: Filter[] | { [key: string]: string[] }) {
  // Convert grouped object to array if needed
  const F = useMemo(() => {
    if (Array.isArray(filters)) {
      return filters;
    }
    // If it's a grouped object, convert to array of Filter objects
    const filterArray: Filter[] = [];
    Object.entries(filters).forEach(([group, items]) => {
      items.forEach(label => {
        filterArray.push({ label, checked: true, group });
      });
    });
    return filterArray;
  }, [filters]);

  const count = F.filter((v) => v.checked).length;
  const init: FilterState = {
    filters: F,
    selected_count: count,
    is_select_all: F.length === count,
  };
  return useReducer(Reducer, init);
}

// #################### Component ####################
function isPublisherGroups(obj: any): obj is { [key: string]: string[] } {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

export function FilterPill({ id, title, filters, onSubmit, onSearch = () => {}, loading, isSearchable = false, grouped , filterGroups, publisherGroups }: FilterPillProps) {
  const [state, Dispatch] = useFilterReducer(filters ?? []);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleItems, setVisibleItems] = useState(500);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [filteredFilters, setFilteredFilters] = useState<Filter[]>([]);
  
  // Get the appropriate group data based on grouped prop and available data
  const getGroupData = () => {
    if (!grouped) return null;
    
    // For Publishers, use publisherGroups (legacy support)
    if (id === "Publishers" && publisherGroups && isPublisherGroups(publisherGroups)) {
      return publisherGroups;
    }
    
    // For other grouped filters, use filterGroups
    if (filterGroups && isPublisherGroups(filterGroups)) {
      return filterGroups;
    }
    return null;
  };

  // Create properly structured filters for grouped items
  const processedFilters = useMemo(() => {
    const groupData = getGroupData();
    
    if (grouped && groupData) {
      const allGroupedItems: Filter[] = [];
      
      Object.entries(groupData).forEach(([groupKey, groupItems]) => {
        groupItems.forEach(item => {
          // Convert filters to array if it's an object
          const filtersArray = Array.isArray(filters) ? filters : [];
          const existingFilter = filtersArray.find(f => f.label === item);
          allGroupedItems.push({
            label: item,
            checked: existingFilter ? existingFilter.checked : true,
            group: groupKey
          });
        });
      });
      return allGroupedItems;
    }
    
    // If filters is an object, convert it to array
    if (!Array.isArray(filters)) {
      const filterArray: Filter[] = [];
      Object.entries(filters).forEach(([group, items]) => {
        items.forEach(label => {
          filterArray.push({ label, checked: true, group });
        });
      });
      return filterArray;
    }
    return filters;
  }, [grouped, filters, filterGroups, publisherGroups, id]);

  // Update state when filters prop changes
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && processedFilters && processedFilters.length > 0) {
      if (grouped) {
        const initialFilters = processedFilters.map(filter => ({
          ...filter,
          checked: true
        }));
        Dispatch({
          type: ActionType.SET_FILTERS,
          payload: initialFilters
        });
        Dispatch({ type: ActionType.SELECT_ALL });
      } else {
        Dispatch(setFilters(processedFilters));
      }
      hasInitialized.current = true;
    }
  }, [processedFilters, Dispatch, grouped]);

  // Apply search filter
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFilters(state.filters);
      setVisibleItems(500);
    } else {
      const filtered = state.filters.filter((filter) => 
        filter.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFilters(filtered);
      setVisibleItems(filtered.length);
    }
  }, [searchQuery, state.filters]);

  // Group filters by first letter for alphabetical layout
  const groupedFilters = useMemo(() => {
    const filtersToUse = searchQuery.trim() === "" ? state.filters : filteredFilters;
    const groups: { [key: string]: Filter[] } = {};
    
    filtersToUse.forEach(filter => {
      const firstLetter = filter.label.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push({
        ...filter,
        checked: state.is_select_all || filter.checked
      });
    });
    
    return groups;
  }, [state.filters, state.is_select_all, searchQuery, filteredFilters]);

  // Group filters for display (for grouped=true)
  const groupedFiltersForDisplay = useMemo(() => {
    const groupData = getGroupData();
    const filtersToUse = searchQuery.trim() === "" ? state.filters : filteredFilters;
    
    if (grouped && groupData) {
      const groups: { [key: string]: Filter[] } = {};
      
      // Initialize all groups
      Object.keys(groupData).forEach(groupKey => {
        groups[groupKey] = [];
      });
      
      // Add filters to their respective groups
      filtersToUse.forEach(filter => {
        if (filter.group && groups[filter.group]) {
          groups[filter.group].push({
            ...filter,
            checked: state.is_select_all || filter.checked
          });
        }
      });
      return groups;
    }
    return {
      "All": filtersToUse.map(f => ({
        ...f,
        checked: state.is_select_all || f.checked
      }))
    };
  }, [state.filters, state.is_select_all, grouped, filterGroups, publisherGroups, id, searchQuery, filteredFilters]);

  // Alphabet index
  const alphabet = useMemo(() => {
    return Object.keys(groupedFilters).sort();
  }, [groupedFilters]);

  // Get group keys for grouped layout
  const groupKeys = useMemo(() => {
    const keys = Object.keys(groupedFiltersForDisplay).sort();
    return keys;
  }, [groupedFiltersForDisplay]);

  // Calculate total number of items
  const totalItems = useMemo(() => {
    return searchQuery.trim() === "" ? state.filters.length : filteredFilters.length;
  }, [state.filters, filteredFilters, searchQuery]);

  // Check if there are more items to load
  const hasMoreItems = useMemo(() => {
    return visibleItems < totalItems;
  }, [visibleItems, totalItems]);

  // Get group state for grouped layout
  const getGroupState = (groupKey: string) => {
    const groupItems = groupedFiltersForDisplay[groupKey] || [];
    const totalCount = groupItems.length;
    const selectedCount = groupItems.filter(item => item.checked).length;
    const allSelected = totalCount > 0 && selectedCount === totalCount;
    const someSelected = selectedCount > 0 && selectedCount < totalCount;

    const groupState = {
      totalCount,
      selectedCount,
      allSelected,
      someSelected
    };
    
    return groupState;
  };

  // Handle group toggle for grouped layout
  const handleGroupToggle = (groupKey: string, itemLabel?: string) => {
    
    if (itemLabel) {
      // Toggle individual item
      const filterIndex = state.filters.findIndex(f => f.label === itemLabel);
      if (filterIndex !== -1) {
        Dispatch(toggle(filterIndex));
      }
    } else {
      // Toggle entire group
      const groupState = getGroupState(groupKey);
      const shouldCheck = !groupState.allSelected;
      
      // Use the toggleGroup action for better performance
      Dispatch(toggleGroup(groupKey, shouldCheck));
    }
  };

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current && !isLoadingMore && hasMoreItems) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      if (scrollHeight - scrollTop - clientHeight < 50) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleItems(prev => prev + 500);
          setIsLoadingMore(false);
        }, 500);
      }
    }
  }, [isLoadingMore, hasMoreItems]);

  // Handle letter selection
  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle group click for grouped layout
  const handleGroupClick = (groupKey: string) => {
    setSelectedLetter(groupKey);
    const element = document.getElementById(`group-${groupKey}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (grouped) {
      const selectedByGroup: { [key: string]: string[] } = {};
      const groupData = getGroupData();

      if (groupData) {
        Object.keys(groupData).forEach(groupKey => {
          selectedByGroup[groupKey] = [];
        });
      }

      // Convert array filters to grouped object for submission
      state.filters.forEach(filter => {
        if (filter.checked && filter.group) {
          if (!selectedByGroup[filter.group]) {
            selectedByGroup[filter.group] = [];
          }
          selectedByGroup[filter.group].push(filter.label);
        }
      });

      // Send grouped object in filters
      onSubmit(id, {
        is_select_all: state.is_select_all,
        selected_count: state.selected_count,
        filters: selectedByGroup,
        grouped: true
      });
    } else {
      // Send array filters
      onSubmit(id, {
        ...state,
        grouped: false
      });
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSearchable) {
      onSearch(id, searchQuery);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (isSearchable) {
      onSearch(id, query);
    }
  };

  const getTotalCount = () => {
    return searchQuery.trim() === "" ? state.filters.length : filteredFilters.length;
  };

  const getSelectedCount = () => {
    return state.selected_count;
  };

  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex items-center gap-1 rounded-3xl border bg-card px-2 text-body text-card-foreground shadow-sm hover:opacity-75">
          <span>{title}</span>|{" "}
          <span className="text-body text-orange-500">
            {state.is_select_all ? "All" : `${getSelectedCount()}/${getTotalCount()}`}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="z-[200] w-[300px] max-h-[70vh] overflow-y-hidden">
        <span className="flex items-center">
          <Checkbox
            title="Select All"
            onClick={() => {
              if (state.is_select_all) {
                Dispatch(unSelectAll());
              } else {
                Dispatch(selectAll());
              }
            }}
            checked={state.is_select_all}
          />
          <p className="ml-2 font-thin text-body">{title}</p>
          <p className="ml-auto text-xs text-destructive text-small-font">
            {getSelectedCount()}/{getTotalCount()}
          </p>
        </span>
        
        {isSearchable && (
          <form className="flex mt-2" onSubmit={handleSearch}>
            <Input
              className="rounded-br-none rounded-tr-none text-small-font"
              type="text"
              name="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Button variant="default" size="icon-xs" className="w-10 h-10 rounded-bl-none rounded-tl-none" type="submit">
              <Search size={15} />
            </Button>
          </form>
        )}

        <hr className="my-2" />
        
        {!loading && (
          <div className="relative flex max-h-[300px]">
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
              onScroll={handleScroll}
            >
              {grouped && getGroupData() ? (
                // Grouped view (previous layout)
                <div className="flex flex-col gap-2">
                  {groupKeys.map((groupKey) => {
                    const groupItems = groupedFiltersForDisplay[groupKey] || [];
                    const totalItemsBeforeThisGroup = groupKeys
                      .slice(0, groupKeys.indexOf(groupKey))
                      .reduce((sum, g) => sum + (groupedFiltersForDisplay[g]?.length || 0), 0);

                    const itemsToShow = Math.max(0, Math.min(groupItems.length, visibleItems - totalItemsBeforeThisGroup));

                    if (itemsToShow <= 0) return null;

                    const groupState = getGroupState(groupKey);
                    
                    return (
                      <div key={groupKey} id={`group-${groupKey}`} className="mb-4">
                        <div className="flex items-center bg-gray-50 px-2 py-1.5 rounded-md mb-2">
                          <Checkbox
                            title={groupKey}
                            onClick={() => handleGroupToggle(groupKey)}
                            checked={groupState.allSelected}
                          />
                          <p className="ml-2 font-medium text-body">{groupKey}</p>
                          <p className="ml-auto text-xs text-muted-foreground">
                            {groupState.selectedCount}/{groupState.totalCount}
                          </p>
                        </div>
                        <div className="pl-6 border-l-2 border-gray-200">
                          {groupItems.slice(0, itemsToShow).map((item) => (
                            <div key={item.label} className="flex items-center hover:bg-gray-50 px-2 py-1 rounded">
                              <Checkbox
                                title={item.label}
                                checked={item.checked}
                                onClick={() => handleGroupToggle(groupKey, item.label)}
                              />
                              <p className="ml-2 text-sm text-gray-600">{item.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Alphabetical view (new layout)
                <div>
                  {alphabet.map(letter => {
                    // Calculate how many items to show for this letter
                    const letterItems = groupedFilters[letter] || [];
                    const totalItemsBeforeThisLetter = alphabet
                      .slice(0, alphabet.indexOf(letter))
                      .reduce((sum, l) => sum + (groupedFilters[l]?.length || 0), 0);
                    
                    const itemsToShow = Math.max(
                      0,
                      Math.min(
                        letterItems.length,
                        visibleItems - totalItemsBeforeThisLetter
                      )
                    );
                    
                    if (itemsToShow <= 0) return null;
                    
                    return (
                      <div key={letter} id={`letter-${letter}`}>
                        <div className="sticky top-0 bg-background py-1 font-semibold">
                          {letter}
                        </div>
                        {letterItems.slice(0, itemsToShow).map((filter, index) => (
                          <span key={`${letter}-${index}`} className="flex items-center py-1">
                            <Checkbox
                              id={filter.label + index}
                              checked={filter.checked}
                              onClick={() => {
                                const filterIndex = state.filters.findIndex(f => f.label === filter.label);
                                if (filterIndex !== -1) {
                                  Dispatch(toggle(filterIndex));
                                }
                              }}
                            />
                            <EllipsisTooltip content={filter.label} className="ml-2 text-small-font max-w-[180px]" />
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {isLoadingMore && hasMoreItems && (
                <div className="flex justify-center py-4">
                  <MFSpinner />
                </div>
              )}
            </div>
            
            <div className="w-8 flex flex-col items-center py-2 border-l overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {grouped && getGroupData() ? (
                // Group navigation for grouped layout
                groupKeys.map((groupKey) => (
                  <button
                    key={groupKey}
                    className={`text-xs px-1 py-0.5 rounded ${
                      selectedLetter === groupKey ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                    onClick={() => handleGroupClick(groupKey)}
                  >
                    {groupKey.charAt(0)}
                  </button>
                ))
              ) : (
                // Alphabet navigation for alphabetical layout
                alphabet.map(letter => (
                  <button
                    key={letter}
                    className={`text-xs px-1 py-0.5 rounded ${
                      selectedLetter === letter ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => handleLetterClick(letter)}
                  >
                    {letter}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
        
        {loading && (
          <div className="grid h-32 place-items-center">
            <MFSpinner />
          </div>
        )}
        
        <hr className="my-2" />
        
        <div className="flex justify-between">
          <Button 
            variant="ghost" 
            className="mr-1 text-body" 
            onClick={() => Dispatch(unSelectAll())}
          >
            Clear All
          </Button>
          <PopoverClose>
            <Button className="w-5 h-5" size="icon-xs" title="Apply" onClick={handleSubmit}>
              <Check size={12} />
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}