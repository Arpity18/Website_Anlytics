"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
 
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: { id: string; label: string } | null;
  onSave: (data: { field: string; value: string[]; searchValue?: string }) => void;
  filterData: any;
  filterloading: boolean;
  savedFilters?: Array<{ field: string; value: string[] }>;
  mode?: any;
  onSearchChange?: (searchQuery: string) => void;
  searchValue?: string;
}
 
const FilterModal = ({
  isOpen,
  onClose,
  selectedItem,
  onSave,
  filterData,
  filterloading,
  savedFilters = [],
  mode,
  onSearchChange, // New prop for search
  searchValue,
}: FilterModalProps) => {
  // Find any existing saved filters for this specific dimension
  const existingSavedFilters = React.useMemo(() => {
    if (!selectedItem) return [];
    const savedFilterForItem = savedFilters.find(
      (filter) => filter.field === selectedItem.id
    );
    return savedFilterForItem ? savedFilterForItem.value : [];
  }, [selectedItem, savedFilters]);
 
  // Initialize selectedItems state based on existing saved filters when modal opens or selectedItem changes
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedItemNames, setSelectedItemNames] = useState<string[]>([]); // Track selected item names
  const [leftColumnSearch, setLeftColumnSearch] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [initialData, setInitialData] = useState<any[]>([]); // Store initial data for right side
  const [hasManuallyToggled, setHasManuallyToggled] = useState(false); // Track if user has manually toggled
  const lastQueryRef = React.useRef<string>(""); // Track last search query across renders
 
  // Check if the filterData has nested structure (like publisher_name response)
  const isNestedData = React.useMemo(() => {
    if (!filterData || typeof filterData !== 'object') return false;
    
    // Check if it's an array (normal structure) or object with nested categories
    const hasNestedStructure = !Array.isArray(filterData) && Object.keys(filterData).some(key =>
      Array.isArray(filterData[key])
    );
    
    // Also check if this is a specific field that should always show nested view
    const shouldShowNested = selectedItem?.id === 'publisher_name' || selectedItem?.id === 'event_publisher_name';
    
    return hasNestedStructure || shouldShowNested;
  }, [filterData, selectedItem?.id]);

  // Get nested categories if data is nested
  const nestedCategories = React.useMemo(() => {
    if (!isNestedData || !filterData) return [];
    
    // If filterData is already in nested format (object with arrays), use it directly
    if (!Array.isArray(filterData) && Object.keys(filterData).some(key => Array.isArray(filterData[key]))) {
      return Object.keys(filterData).map(category => ({
        name: category,
        items: filterData[category] || []
      }));
    }
    
    // For specific fields that should show nested view but might have flat data
    // This allows for future nested data structure for these fields
    return [];
  }, [isNestedData, filterData]);

  // Check if we should show nested view (only when filterData is nested)
  const shouldShowNestedView = React.useMemo(() => {
    // Show nested view if we have nested data structure
    if (isNestedData && nestedCategories.length > 0) {
      return true;
    }
    
    // Also show nested view for specific fields that should always use nested display
    const shouldShowNested = selectedItem?.id === 'publisher_name' || selectedItem?.id === 'event_publisher_name';
    
    return shouldShowNested;
  }, [isNestedData, nestedCategories.length, selectedItem?.id]);
 
  // Left column data - changes with search
  const searchItems = React.useMemo(() => {
    if (!filterData) return [];
    
    // For nested data structure, flatten all items
    if (isNestedData && !Array.isArray(filterData)) {
      const allItems = Object.values(filterData).flat() as string[];
      return allItems.map((item) => ({
        id: item,
        name: item,
        selected: existingSavedFilters.includes(item),
      }));
    }
    
    // For regular flat array data
    if (Array.isArray(filterData)) {
      return filterData.map((item) => ({
        id: item,
        name: item,
        selected: existingSavedFilters.includes(item),
      }));
    }
    
    return [];
  }, [filterData, existingSavedFilters, isNestedData]);
 
  // Right column data - stable, based on initial data
  const originalItems = React.useMemo(() => {
    if (initialData.length === 0) return [];
    return initialData.map((item) => ({
      id: item,
      name: item,
      selected: existingSavedFilters.includes(item),
    }));
  }, [initialData, existingSavedFilters]);
 
  // Reset state when the modal opens with new selected item
  useEffect(() => {
    if (isOpen && selectedItem) {
      // Reset all state when switching to a different filter or modal first opens
      const isNewFilter = initialData.length === 0 || selectedItemNames.length === 0;
     
      if (isNewFilter) {
        if (Array.isArray(filterData) && filterData.length > 0) {
          // For regular filters, use filterData
          setInitialData(filterData);
         
          // Reset selected items based on saved filters for this specific filter
          setSelectedItems(existingSavedFilters);
          setSelectedItemNames(existingSavedFilters);
         
          // Calculate selectAll based on current filter's data and saved filters
          const isAllSelected = existingSavedFilters.length > 0 && existingSavedFilters.length === filterData.length;
          setSelectAll(isAllSelected);
        } else if (isNestedData && filterData) {
          // For nested data, flatten all items for initialization
          const allNestedItems = Object.values(filterData).flat() as string[];
          setInitialData(allNestedItems);
         
          // Reset selected items based on saved filters for this specific filter
          setSelectedItems(existingSavedFilters);
          setSelectedItemNames(existingSavedFilters);
         
          // Calculate selectAll based on current filter's data and saved filters
          const isAllSelected = existingSavedFilters.length > 0 && existingSavedFilters.length === allNestedItems.length;
          setSelectAll(isAllSelected);
        } else if (selectedItem.id === 'publisher_name' || selectedItem.id === 'event_publisher_name') {
          // For specific fields that should show nested view but might have flat data
          // Initialize with empty data - they will be populated by search/API
          setInitialData([]);
          setSelectedItems(existingSavedFilters);
          setSelectedItemNames(existingSavedFilters);
          setSelectAll(false);
        }
       
        // Don't clear search content here - let the search preservation logic handle it
      }
    }
  }, [isOpen, selectedItem?.id, filterData, existingSavedFilters, isNestedData])
 
  // Separate effect to handle data updates without clearing search
  useEffect(() => {
    // TEMPORARILY DISABLED - This was causing the toggle override!
    return;
   
    if (isOpen && selectedItem && Array.isArray(filterData) && filterData.length > 0 && selectedItemNames.length === 0) {
      // Set selected items based on saved filters when data is available
      setSelectedItems(existingSavedFilters);
      setSelectedItemNames(existingSavedFilters);
      setSelectAll(existingSavedFilters.length === filterData.length);
    }
  }, [isOpen, selectedItem, filterData, existingSavedFilters, selectedItemNames.length]);
 
  useEffect(() => {
    if (filterloading) {
      setSelectAll(false);
    }
  }, [filterloading]);
 
  // Update selectAll state when selectedItems changes (only during initialization)
  useEffect(() => {
    // TEMPORARILY DISABLED - Testing if this is causing the toggle issue
    return;
   
    // Don't auto-update if user has manually toggled the switch
    if (hasManuallyToggled) {
      return;
    }
   
    // Use originalItems if available, otherwise use searchItems
    const itemsToCheck = originalItems.length > 0 ? originalItems : searchItems;
    if (itemsToCheck.length > 0 && selectedItem && initialData.length > 0) {
      // Calculate selectAll based on whether all items in current filter are selected
      const availableItemNames = itemsToCheck.map(item => item.name);
      const selectedInThisFilter = selectedItemNames.filter(name =>
        availableItemNames.includes(name)
      );
      const isAllSelected = selectedInThisFilter.length === availableItemNames.length && availableItemNames.length > 0;
     
     
     
      // Only auto-update selectAll during initialization phase
      setSelectAll(isAllSelected);
    }
  }, [selectedItemNames, originalItems, searchItems, selectedItem, initialData, hasManuallyToggled]);
 
 
  // Note: We don't update selectedItems when search results change
  // This ensures the right side remains completely independent of search
  // The right side will always show what was selected based on selectedItemNames
 
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInitialData([]);
      setLeftColumnSearch("");
      setSelectedItems([]);
      setSelectedItemNames([]);
      setIsSearching(false);
      setValidationError(null);
      setSelectAll(false);
      setHasManuallyToggled(false); // Reset manual toggle flag
      lastQueryRef.current = ""; // Reset search query tracking
    }
  }, [isOpen]);
 
  // Reset state when switching between different filters (selectedItem changes)
  useEffect(() => {
    if (isOpen && selectedItem) {
      // Only clear state if we're actually switching to a different filter
      const currentFilterId = selectedItem.id;
      const previousFilterId = Object.keys(searchStateRef.current).find(id => id !== currentFilterId);
      
      if (previousFilterId && previousFilterId !== currentFilterId) {
        // We're switching to a different filter, clear everything
        setInitialData([]);
        setSelectedItems([]);
        setSelectedItemNames([]);
        setSelectAll(false);
        setHasManuallyToggled(false);
        setLeftColumnSearch("");
        lastQueryRef.current = "";
      } else {
        // We're reopening the same filter, don't clear search
        setInitialData([]);
        setSelectedItems([]);
        setSelectedItemNames([]);
        setSelectAll(false);
        setHasManuallyToggled(false);
        // Don't clear search state for the same filter
      }
    }
  }, [selectedItem?.id, isOpen]);
 
  const filteredItems = React.useMemo(() => {
    return searchItems
    // Left column should show search results from API
    // return searchItems.filter((item) => {
    //   // Use external search value if available, otherwise use local search
    //   const searchTerm = searchValue || leftColumnSearch;
    //   const matchesSearch = item.name
    //     .toLowerCase()
    //     .includes(searchTerm.toLowerCase());
    //   return matchesSearch;
    // });
  }, [searchItems]);
 
  // DISABLED: Don't automatically calculate selectAll state to prevent issues with search results
  // The selectAll toggle should only be controlled manually by the user
  // 
  // // Calculate selectAll state based on ALL AVAILABLE items, not just filtered/search results
  // useEffect(() => {
  //   if (!hasManuallyToggled) {
  //     // Get all available items from the complete dataset
  //     let allAvailableItems: string[] = [];
  //     
  //     if (isNestedData && filterData) {
  //       // For nested data, flatten all items
  //       allAvailableItems = Object.values(filterData).flat() as string[];
  //     } else if (Array.isArray(filterData)) {
  //       // For regular filters, use filterData
  //       allAvailableItems = filterData;
  //     } else if (selectedItem?.id === 'publisher_name' || selectedItem?.id === 'event_publisher_name') {
  //       // For specific fields that should show nested view but might have flat data
  //       // Use initialData if available, otherwise use searchItems
  //       allAvailableItems = initialData.length > 0 ? initialData : searchItems.map(item => item.name);
  //     }
  //     
  //     // Only set selectAll to true if ALL available items are selected, not just the filtered ones
  //     const allItemsSelected = allAvailableItems.length > 0 && 
  //       allAvailableItems.every(name => selectedItemNames.includes(name));
  //    
  //     setSelectAll(allItemsSelected);
  //   }
  // }, [selectedItemNames, hasManuallyToggled, isNestedData, filterData, selectedItem?.id, initialData, searchItems]);
 
  const selectedFilteredItems = React.useMemo(() => {
    // Right side should show selected items based on selectedItemNames, not dependent on search results
    // This ensures the right side is always stable and shows what was selected
    return selectedItemNames.map((itemName) => ({
      id: itemName,
      name: itemName,
      selected: true,
    }));
  }, [selectedItemNames]);
 
  const handleSelectAllToggle = (checked: boolean) => {
    // Mark that user has manually toggled - this prevents auto-updates
    setHasManuallyToggled(true);
   
    setSelectAll(checked);
   
    if (checked) {
      // Select ALL available items from the complete dataset, not just filtered results
      let allAvailableItems: string[] = [];
      
      if (isNestedData && filterData) {
        // For nested data, use all items from filterData
        allAvailableItems = Object.values(filterData).flat() as string[];
      } else if (Array.isArray(filterData)) {
        // For regular filters, use filterData
        allAvailableItems = filterData;
      } else if (selectedItem?.id === 'publisher_name' || selectedItem?.id === 'event_publisher_name') {
        // For specific fields that should show nested view but might have flat data
        allAvailableItems = initialData.length > 0 ? initialData : searchItems.map((item) => item.name);
      }
      
      // Select all available items
      setSelectedItems(allAvailableItems);
      setSelectedItemNames(allAvailableItems);
    } else {
      // When deselecting all, clear all selections completely
      setSelectedItems([]);
      setSelectedItemNames([]);
    }
  };
 
  const handleSave = () => {
    // Always send the selected items as they are
    // The logic of "empty array means no filter" should only apply when user explicitly uses "Select All"
    // and has selected ALL available items from the complete dataset
    
    let selectedFilters: string[] = [];
    
    // Only send empty array if user explicitly selected all via the "Select All" toggle
    // and we can confirm they selected everything from the complete dataset
    if (selectAll) {
      // User used "Select All" toggle - send empty array to indicate no filtering
      selectedFilters = [];
    } else {
      // User manually selected specific items - send those items
      selectedFilters = selectedItems;
    }
    
    console.log(selectedFilters, "selectedFilters");
    console.log("selectAll state:", selectAll);
    console.log("selectedItems:", selectedItems);
    
    // Send both selected filters and search value in payload
    onSave({
      field: selectedItem?.id || "",
      value: selectedFilters,
      searchValue: leftColumnSearch, // Include search value in payload
    });
    
    onClose();
  };
 
  const toggleItem = (id: string) => {
   
    // Mark that user has manually interacted (prevents auto-updates)
    setHasManuallyToggled(true);
   
    // Since id is now the item name, we can use it directly
    setSelectedItems((prev) => {
      const newSelectedItems = prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id];
      return newSelectedItems;
    });
   
    // Also update selectedItemNames to maintain consistency
    setSelectedItemNames((prev) => {
      const newSelectedItemNames = prev.includes(id)
        ? prev.filter((name) => name !== id)
        : [...prev, id];
     
      // Update selectAll state based on the new selection
      // Check if all available items are now selected
      let allAvailableItems: string[] = [];
      if (isNestedData && filterData) {
        allAvailableItems = Object.values(filterData).flat() as string[];
      } else if (Array.isArray(filterData)) {
        allAvailableItems = filterData;
      } else if (selectedItem?.id === 'publisher_name' || selectedItem?.id === 'event_publisher_name') {
        // For specific fields that should show nested view but might have flat data
        // Use initialData if available, otherwise use searchItems (but this should be the complete dataset)
        allAvailableItems = initialData.length > 0 ? initialData : searchItems.map(item => item.name);
      }
      
      // If user unchecks an item and Select All was previously true, turn it false
      // This ensures Select All toggle reflects the actual state
      if (prev.includes(id) && selectAll) {
        // User is unchecking an item and Select All was true, so turn it false
        setSelectAll(false);
      }
     
      return newSelectedItemNames;
    });
  };
 
  // Handle nested category selection
  const toggleCategory = (categoryName: string, checked: boolean) => {
    setHasManuallyToggled(true);
   
    // Get items from either hardcoded data or filterData
    let categoryItems: string[] = [];
    if (isNestedData && filterData) {
      categoryItems = filterData[categoryName] || [];
    }
   
    if (checked) {
      // Add all items from this category
      setSelectedItems(prev => {
        const combined = [...prev, ...categoryItems];
        const uniqueItems = Array.from(new Set(combined));
        return uniqueItems;
      });
      setSelectedItemNames(prev => {
        const combined = [...prev, ...categoryItems];
        const uniqueItems = Array.from(new Set(combined));
        
        // Don't automatically update selectAll when user manually selects categories
        // This prevents the toggle from showing true when only partial data is selected
        // The user must explicitly use the "Select All" toggle
        //
        // // Check if all items are now selected after adding this category
        // if (isNestedData && filterData) {
        //   const allAvailableItems = Object.values(filterData).flat() as string[];
        //   const allSelected = allAvailableItems.every(item => uniqueItems.includes(item));
        //   if (allSelected) {
        //     setSelectAll(true);
        //   }
        // } else if (selectedItem?.id === 'publisher_name' || selectedItem?.id === 'event_publisher_name') {
        //   // For specific fields that should show nested view but might have flat data
        //   // Use initialData if available, otherwise use searchItems (but this should be the complete dataset)
        //   const allAvailableItems = initialData.length > 0 ? initialData : searchItems.map(item => item.name);
        //   const allSelected = allAvailableItems.every(item => uniqueItems.includes(item));
        //   if (allSelected) {
        //     setSelectAll(true);
        //   }
        // }
        
        return uniqueItems;
      });
    } else {
      // Remove all items from this category
      setSelectedItems(prev => prev.filter(item => !categoryItems.includes(item)));
      setSelectedItemNames(prev => {
        const newSelectedItems = prev.filter(name => !categoryItems.includes(name));
        
        // Since we're removing items, selectAll should definitely be false
        setSelectAll(false);
        
        return newSelectedItems;
      });
    }
  };
 
  // Check if a category is fully selected
  const isCategoryFullySelected = (categoryName: string) => {
    let categoryItems: string[] = [];
    if (isNestedData && filterData) {
      categoryItems = filterData[categoryName] || [];
    }
    return categoryItems.length > 0 && categoryItems.every(item => selectedItemNames.includes(item));
  };
  
  // Check if a category is partially selected
  const isCategoryPartiallySelected = (categoryName: string) => {
    let categoryItems: string[] = [];
    if (isNestedData && filterData) {
      categoryItems = filterData[categoryName] || [];
    }
    const selectedCount = categoryItems.filter(item => selectedItemNames.includes(item)).length;
    return selectedCount > 0 && selectedCount < categoryItems.length;
  };
 
  // Debounced search function to call API
  const debouncedSearch = React.useMemo(() => {
    let timeoutId: NodeJS.Timeout;
   
    return (searchQuery: string) => {
      clearTimeout(timeoutId);

      const trimmedQuery = searchQuery.trim();
      const currentLastQuery = lastQueryRef.current;
     
      // Handle empty search (clearing) - reset lastQuery and call API
      if (trimmedQuery === "" && currentLastQuery !== "") {
        lastQueryRef.current = "";
        if (onSearchChange) {
          setIsSearching(true);
          onSearchChange(""); // Send empty string to reset data
          setTimeout(() => setIsSearching(false), 1000);
        }
        return;
      }

      // Don't make API call if search query is empty or same as last query
      if (!trimmedQuery || trimmedQuery === currentLastQuery) {
        return;
      }

      timeoutId = setTimeout(() => {
        if (onSearchChange && trimmedQuery !== lastQueryRef.current) {
          setIsSearching(true);
          lastQueryRef.current = trimmedQuery;
          onSearchChange(searchQuery);
          setTimeout(() => setIsSearching(false), 1000);
        }
      }, 500);
    };
  }, [onSearchChange]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLeftColumnSearch(value);
   
    // Always call debouncedSearch - it will handle both search and clearing internally
    debouncedSearch(value);
  };

  // Preserve search content when reopening the same filter
  useEffect(() => {
    if (isOpen && selectedItem && lastQueryRef.current) {
      // If we have a previous search query, restore it
      setLeftColumnSearch(lastQueryRef.current);
    }
  }, [isOpen, selectedItem]);

  // Track search state per filter to prevent unnecessary clearing
  const searchStateRef = React.useRef<{ [key: string]: string }>({});

  // Save search state when it changes
  useEffect(() => {
    if (selectedItem?.id && leftColumnSearch !== "") {
      searchStateRef.current[selectedItem.id] = leftColumnSearch;
    }
  }, [leftColumnSearch, selectedItem?.id]);

  // Restore search state when opening a filter
  useEffect(() => {
    if (isOpen && selectedItem?.id && searchStateRef.current[selectedItem.id]) {
      const savedSearch = searchStateRef.current[selectedItem.id];
      setLeftColumnSearch(savedSearch);
      lastQueryRef.current = savedSearch;
    }
  }, [isOpen, selectedItem?.id]);
 
  if (!isOpen) return null;
 
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-100"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-[90%] flex-col rounded-lg bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Filter {selectedItem?.label}
            </h2>
            <X
              className="h-4 w-4 cursor-pointer hover:text-gray-700"
              onClick={onClose}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="select-all" className="text-sm">
                Select All
              </Label>
              <Switch
                id="select-all"
                checked={selectAll}
                onCheckedChange={(checked) => {
                  setSelectAll(checked);
                  setHasManuallyToggled(true);
                  
                  if (checked) {
                    // Select ALL available items from the complete dataset, not just filtered results
                    let allAvailableItems: string[] = [];
                    
                    if (isNestedData && filterData) {
                      // For nested data, use all items from filterData
                      allAvailableItems = Object.values(filterData).flat() as string[];
                    } else if (Array.isArray(filterData)) {
                      // For regular filters, use filterData
                      allAvailableItems = filterData;
                    } else if (selectedItem?.id === 'publisher_name' || selectedItem?.id === 'event_publisher_name') {
                      // For specific fields that should show nested view but might have flat data
                      allAvailableItems = initialData.length > 0 ? initialData : searchItems.map((item) => item.name);
                    }
                    
                    // Select all available items
                    setSelectedItems(allAvailableItems);
                    setSelectedItemNames(allAvailableItems);
                  } else {
                    // Deselect all items completely
                    setSelectedItems([]);
                    setSelectedItemNames([]);
                  }
                }}
                disabled={mode === "view"}
              />
             
             
            </div>
          </div>
        </div>
 
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-6 h-full">
              {/* Left Column - All Values */}
              <div className="border rounded-lg p-4">
                <div className="mb-3">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search items..."
                      value={leftColumnSearch}
                      onChange={handleSearchChange}
                      className="mb-2 pr-8"
                      disabled={mode === "view"}
                    />
                   
                  </div>
               
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filterloading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : shouldShowNestedView ? (
                    // Render nested data structure or publisher_name
                    nestedCategories.map((category) => (
                      <div key={category.name} className="border rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`category-${category.name}`}
                            checked={isCategoryFullySelected(category.name)}
                            ref={(ref) => {
                              if (ref && 'indeterminate' in ref) {
                                (ref as any).indeterminate = isCategoryPartiallySelected(category.name);
                              }
                            }}
                            onCheckedChange={(checked) => toggleCategory(category.name, checked as boolean)}
                            disabled={mode === "view"}
                          />
                          <Label
                            htmlFor={`category-${category.name}`}
                            className="font-semibold text-gray-700 cursor-pointer"
                          >
                            {category.name}
                          </Label>
                        </div>
                        <div className="ml-6 space-y-1">
                          {category.items.map((item: string) => (
                            <div
                              key={item}
                              className="flex items-center space-x-2 rounded p-1 hover:bg-gray-50"
                            >
                              <Checkbox
                                id={`nested-item-${item}`}
                                checked={selectedItemNames.includes(item)}
                                onCheckedChange={() => toggleItem(item)}
                                disabled={mode === "view"}
                              />
                              <Label
                                htmlFor={`nested-item-${item}`}
                                className="flex-1 cursor-pointer truncate text-sm"
                                title={item}
                              >
                                {item.length > 25 ? `${item.substring(0, 25)}...` : item}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : filteredItems.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No data found.
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-2 rounded p-2 hover:bg-gray-50"
                      >
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={selectedItemNames.includes(item.name)}
                          onCheckedChange={() => toggleItem(item.id)}
                          disabled={mode === "view"}
                        />
                        <Label
                          htmlFor={`item-${item.id}`}
                          className="flex-1 cursor-pointer truncate"
                          title={item.name}
                        >
                          {item.name.length > 25 ? `${item.name.substring(0, 25)}...` : item.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column - Selected Values */}
              <div className="border rounded-lg p-4">
                <h3 className="text-md font-semibold mb-3 text-gray-700">
                  Selected Values ({selectedFilteredItems.length})
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {selectedFilteredItems.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      {/* No items selected. */}
                      {mode==="view" || mode==="edit" ? "No Filters Applied" : "No items selected."}
                    </div>
                  ) : (
                    selectedFilteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-2 rounded p-2 bg-blue-50 border border-blue-200"
                      >
                        <Checkbox
                          id={`selected-item-${item.id}`}
                          checked={selectedItemNames.includes(item.name)}
                          onCheckedChange={() => toggleItem(item.id)}
                          disabled={mode === "view"}
                        />
                        <Label
                          htmlFor={`selected-item-${item.id}`}
                          className="flex-1 cursor-pointer truncate"
                          title={item.name}
                        >
                          {item.name.length > 25 ? `${item.name.substring(0, 25)}...` : item.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
        </div>

        <div className="border-t p-4">
          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              className="text-white bg-primary hover:bg-primary"
              disabled={mode === "view"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="text-white bg-primary hover:bg-primary"
              disabled={mode === "view"}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FilterModal;