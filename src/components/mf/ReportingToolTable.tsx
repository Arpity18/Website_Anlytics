"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  MdEdit,
  MdDelete,
  MdVisibility,
  MdFileDownload,
  MdArrowDropDown,
  MdSearch,
  MdArrowDownward,
  MdArrowUpward,
  MdPause,
  MdPlayArrow,
  MdClose,
  MdUnfoldMore,
} from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";
import { FaClone } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Pagination from "../ui/pagination";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import JSZip from "jszip";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EllipsisTooltip from "@/components/mf/EllipsisTooltip";

export type Column<T = void> =
  | { title: string; key: string }
  | { title: string; key: string; render: (data: T) => React.ReactNode };

// ✅ NEW: Action Button Configuration Interface
export interface ActionButtonConfig {
  title: string;
  action: () => void;
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}

interface ResizableTableProps<T> {
  buttonTextName?: string;
  columns: Column<T>[];
  data: T[];
  headerColor?: string;
  isEdit?: boolean;
  isDelete?: boolean;
  isClone?: boolean;
  isUserTable?: boolean;
  isUserPackage?: boolean;
  isMappingPackage?: boolean;
  isgenerateTable?: boolean;
  isRefetch?: boolean;
  isSend?: boolean;
  isView?: boolean;
  isTableDownload: boolean;
  isDownload?: boolean;
  onRefetch?: (params?: { startDate?: Date; endDate?: Date }) => void;
  isPaginated?: boolean;
  isSearchable?: boolean;
  isSelectable?: boolean;
  isCount?: boolean;
  isLoading?: boolean;
  isFile?: boolean;
  SearchTerm?: string;
  setSearchTerm: (term: string) => void;

  // ✅ NEW: Action Button Configurations from Parent
  actionButtons?: ActionButtonConfig[];

  // Keep old props for backward compatibility
  actionButton?: React.ReactNode | React.ReactNode[];
  onEdit?: (item: T) => void;
  onDownloadAll?: (item: T[]) => void;
  handleAddUser?: () => void;
  handleAddPackage?: () => void;
  handleAddProductMapping?: () => void;
  handleProductMapping?: () => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onDownload?: (item: T) => void;
  onRefresh?: () => void;
  onSelect?: (selectedItems: T[]) => void;
  itemCount?: (count: number) => void;
  isPause?: boolean;
  isPlay?: boolean;
  onPause?: (item: T) => void;
  onPlay?: (item: T) => void;
  onClone?: (item: T) => void;
  onSend?: (item: T) => void;
  onGenerateReport?: () => void;
  height?: number;
  emptyStateMessage?: string;
  // New pagination props
  onPageChangeP?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageNo?: number;
  limit?: number;
  totalPages?: number;
  totalRecords?: number;
  isRadioButton?: boolean;
  onSelectedRadioButton?: (data: any) => void;
  selectedRadioValue?: string;
  tableBody?: string;
  tableHeader?: string;
  isRuleConfiguration?: boolean;
  handleAddRuleConfiguration?: () => void;
  isGeoConfiguration?: boolean;
  handleAddGeoConfiguration?: () => void;
  isCustomRuleConfiguration?: boolean;
  handleAddCustomRuleConfiguration?: () => void;
}

const ColumnToggleMenu: React.FC<{
  columns: Column<Record<string, string | number>>[];
  onToggle: (key: string) => void;
  visibleColumns: Column<Record<string, string | number>>[];
}> = ({ columns, onToggle, visibleColumns }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-between gap-2 h-9 px-3"
        >
          <span>Columns</span>
          <div className="flex items-center">
            <span className="text-xs text-primary">
              {columns.length === visibleColumns.length
                ? "All"
                : visibleColumns.length}
            </span>
            <MdArrowDropDown className="ml-1" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <div className="max-h-[300px] overflow-auto">
          {columns.map((column) => (
            <div
              key={column.key}
              className="flex items-center px-4 py-2 hover:bg-muted"
            >
              <Checkbox
                checked={visibleColumns.some((col) => col.key === column.key)}
                onCheckedChange={() => onToggle(column.key)}
                id={`column-${column.key}`}
              />
              <Label
                htmlFor={`column-${column.key}`}
                className="ml-2 cursor-pointer flex-1"
              >
                {column.title}
              </Label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ResizableTable: React.FC<
  ResizableTableProps<Record<string, string | number>>
> = ({
  buttonTextName = "New Report",
  columns,
  data,
  headerColor = "#ccc",
  isEdit = false,
  isDelete = false,
  isClone = false,
  isUserTable = true,
  isUserPackage = false,
  isMappingPackage = false,
  isgenerateTable = false,
  isRefetch = false,
  onRefetch,
  isSend = false,
  isView = false,
  isPaginated = true,
  isDownload = false,
  isTableDownload = false,
  isSearchable = false,
  isSelectable = false,
  isCount = false,
  isLoading = false,

  // ✅ NEW: Action Button Configurations from Parent
  actionButtons = [],

  // Keep old props for backward compatibility
  actionButton,
  onEdit,
  onDelete,
  onView,
  onDownload,
  handleAddUser,
  handleAddPackage,
  handleAddProductMapping,
  handleProductMapping,
  SearchTerm = "",
  setSearchTerm,
  onSelect,
  onDownloadAll,
  onRefresh,
  itemCount,
  isPause = false,
  isPlay = false,
  onPause,
  onPlay,
  onClone,
  onSend,
  onGenerateReport,
  height,
  emptyStateMessage = "No Data Found!",
  // New pagination props
  onPageChangeP,
  onLimitChange,
  pageNo = 1,
  limit,
  totalPages = 1,
  totalRecords = 0,
  isRadioButton = false,
  onSelectedRadioButton,
  selectedRadioValue,
  tableBody,
  tableHeader,
  isRuleConfiguration = false,
  handleAddRuleConfiguration,
  isGeoConfiguration = false,
  handleAddGeoConfiguration,
  isCustomRuleConfiguration = false,
  handleAddCustomRuleConfiguration,
}) => {
  const [selectedItems, setSelectedItems] = useState<
    Record<string, string | number>[]
  >([]);
  const [isMounted, setIsMounted] = useState(false);
  const [visibleColumns, setVisibleColumns] =
    useState<Column<Record<string, string | number>>[]>(columns);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>(
    {}
  );
  const [selectedOption, setSelectedOption] = useState<string>("option1");
  const tableRef = useRef<HTMLTableElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // ✅ IMPROVED SORTING STATE
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // ✅ IMPROVED PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [isRefetchModalOpen, setIsRefetchModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const router = useRouter();

  // Refs for measuring element heights
  const headerRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const initialWidths: { [key: string]: number } = {};
    columns.forEach((col) => {
      initialWidths[col.key] = 150;
    });
    setColumnWidths(initialWidths);
  }, [columns]);

  // ✅ UPDATE VISIBLE COLUMNS WHEN COLUMNS PROP CHANGES
  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);

  // ✅ SYNC EXTERNAL PAGE CHANGES
  useEffect(() => {
    if (pageNo && pageNo !== currentPage) {
      setCurrentPage(pageNo);
    }
  }, [pageNo]);

  // ✅ SYNC EXTERNAL LIMIT CHANGES
  useEffect(() => {
    if (limit && limit !== itemsPerPage) {
      setItemsPerPage(limit);
    }
  }, [limit]);

  useEffect(() => {
    const calculateHeight = () => {
      if (
        tableContainerRef.current &&
        headerRef.current &&
        paginationRef.current
      ) {
        const viewportHeight = window.innerHeight;
        const headerHeight = headerRef.current.offsetHeight;
        const paginationHeight = paginationRef.current.offsetHeight;
        const otherElementsHeight = 40;

        const availableHeight =
          height ||
          viewportHeight -
            headerHeight -
            paginationHeight -
            otherElementsHeight;
        setContainerHeight(availableHeight);
      }
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    const timer = setTimeout(calculateHeight, 100);

    return () => {
      window.removeEventListener("resize", calculateHeight);
      clearTimeout(timer);
    };
  }, [height]);

  const handleColumnToggle = (key: string) => {
    const newVisibleColumns = visibleColumns.some((col) => col.key === key)
      ? visibleColumns.filter((col) => col.key !== key)
      : [...visibleColumns, columns.find((col) => col.key === key)!];
    setVisibleColumns(newVisibleColumns);
  };

  // ✅ IMPROVED SORTING HANDLER
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // ✅ IMPROVED SORTING LOGIC - HANDLES BOTH ALPHABETICAL AND NUMERIC
  const sortedData = React.useMemo(() => {
    if (!Array.isArray(data)) {
      console.error("Data is not an array:", data);
      return [];
    }

    const sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
        if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

        // Check if both values are numeric
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        const aIsNumeric = !isNaN(aNum) && aValue !== "";
        const bIsNumeric = !isNaN(bNum) && bValue !== "";

        // If both values are numeric, sort numerically
        if (aIsNumeric && bIsNumeric) {
          if (aNum < bNum) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aNum > bNum) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        }

        // If one is numeric and the other isn't, treat numeric as smaller (or handle as needed)
        if (aIsNumeric && !bIsNumeric) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (!aIsNumeric && bIsNumeric) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }

        // Both are non-numeric, sort alphabetically (case-insensitive)
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (aStr < bStr) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  // ✅ IMPROVED FILTERING
  //   const filteredData = React.useMemo(() => {
  //     if (!SearchTerm.trim()) return sortedData
  // console.log(sortedData,"sortedData")
  //     return sortedData.filter((item) => {
  //       return visibleColumns.some((column) => {
  //         const cellValue = String(item[column.key] || "").toLowerCase()
  //         return cellValue.includes(SearchTerm.toLowerCase())
  //       })
  //     })
  //   }, [sortedData, visibleColumns, SearchTerm])

  // ... existing code ...

  // ✅ SIMPLIFIED - JUST RETURN SORTED DATA WITHOUT FILTERING
  const filteredData = React.useMemo(() => {
    console.log("sortedData:", sortedData);
    return sortedData; // Just return the sorted data directly
  }, [sortedData]);

  // ... existing code ...

  console.log(filteredData, "filteredData");
  // Remove these useEffects as they cause infinite loops
  // The handlers should only be called from user interactions, not state changes

  // ✅ IMPROVED PAGINATION DATA
  // const paginatedData = React.useMemo(() => {
  //   // If external pagination is used, return all filtered data
  //   if (onPageChangeP) {
  //     return filteredData
  //   }

  //   // Internal pagination
  //   const startIndex = (currentPage - 1) * itemsPerPage
  //   return filteredData.slice(startIndex, startIndex + itemsPerPage)
  // }, [filteredData, currentPage, itemsPerPage, onPageChangeP])

  const handleCheckboxChange = (item: Record<string, string | number>) => {
    if (selectedItems.includes(item)) {
      const items = selectedItems.filter((i) => i !== item);
      setSelectedItems(items);
      if (onSelect) onSelect(items);
    } else {
      const items = [...selectedItems, item];
      setSelectedItems(items);
      if (onSelect) onSelect(items);
    }
  };

  // Column Resize Handlers
  const handleMouseDown = (e: React.MouseEvent, key: string) => {
    const startX = e.clientX;
    const startWidth = columnWidths[key];
    const minWidth = 100;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(
        minWidth,
        startWidth + moveEvent.clientX - startX
      );
      setColumnWidths((prevWidths) => ({
        ...prevWidths,
        [key]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    if (typeof itemCount === "function") itemCount(selectedItems.length);
  }, [selectedItems.length]);

  // ✅ IMPROVED PAGE CHANGE HANDLER
  const handlePageChange = (newPage: number) => {
    //  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
    if (onPageChangeP) {
      onPageChangeP(validPage); // API call only on user change
    }
  };
  // ✅ IMPROVED ITEMS PER PAGE HANDLER
  // const handleItemsPerPageChange = (newItemsPerPage: number) => {
  //   setItemsPerPage(newItemsPerPage)
  //   setCurrentPage(1)

  //   // Call external limit change handler if provided
  //   if (onLimitChange) {
  //     onLimitChange(newItemsPerPage)
  //   }
  // }

  const handleRefetch = () => {
    if (startDate && endDate) {
      onRefetch?.({ startDate, endDate });
      setIsRefetchModalOpen(false);
    }
  };

  const downloadTableAsCSV = async () => {
    try {
      const zip = new JSZip();
      const response = await fetch("/dummy.csv");
      const csvData = await response.blob();
      zip.file("dummy.csv", csvData);
      const zipContent = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      const currentDate = format(new Date(), "yyyyMMdd");
      const fileName = `web.mfilterit.cpv_${currentDate}.zip`;
      link.href = URL.createObjectURL(zipContent);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  if (!isMounted) return null;

  const handleBack = () => {
    router.back();
  };

  // Calculate colspan for empty state and loading state
  const colSpan =
    visibleColumns.length +
    (isSelectable ? 1 : 0) +
    (isEdit ||
    isDelete ||
    isView ||
    isDownload ||
    isPause ||
    isPlay ||
    isRefetch ||
    isSend ||
    isClone
      ? 1
      : 0);

  // ✅ CALCULATE TOTAL PAGES
  //const calculatedTotalPages = onPageChangeP ? totalPages : Math.ceil(filteredData.length / itemsPerPage)

  // Use the prop value if provided, otherwise fall back to internal state
  const currentSelectedOption = selectedRadioValue || selectedOption;

  return (
    <div className="w-full mt-[10px] flex flex-col h-full">
      {/* Table Controls - Top Bar */}
      <div
        ref={headerRef}
        className="flex flex-col md:flex-row w-full gap-2 rounded-lg border bg-card p-2 text-body"
      >
        {/* Left Side Controls */}
        <div className="flex flex-1 flex-wrap md:flex-nowrap items-center gap-2">
          {/* Search Bar - Responsive */}
          {isSearchable && (
            <div
              className={cn(
                "flex items-center space-x-2 p-2 border rounded-md",
                isSearchExpanded ? "w-full" : "w-full md:flex-1"
              )}
            >
              {isSearchExpanded ? (
                <>
                  <MdSearch className="text-xl text-card-foreground" />
                  {/* <input
                    type="text"
                    placeholder="Search"
                    value={SearchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-card text-card-foreground outline-none"
                    autoFocus
                  />
                  <button onClick={() => {setIsSearchExpanded(false)
                    setSearchTerm("");}
                  } className="md:hidden">
                    <MdClose className="text-xl" />
                  </button> */}

                  <input
                    type="text"
                    placeholder="Search"
                    value={SearchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-card text-card-foreground outline-none"
                  />
                  <Button
                    title="Clear"
                    className="cursor-pointer  text-xs px-0 py-0 w-5 h-5 text-white "
                    onClick={() => {
                      setSearchTerm("");
                    }}
                  >
                    <X size={15} />
                  </Button>
                </>
              ) : (
                <>
                  <MdSearch
                    className="text-xl text-card-foreground md:hidden"
                    onClick={() => {
                      setIsSearchExpanded(true);
                      setSearchTerm("");
                    }}
                  />
                  <span className="md:hidden">Search</span>
                  <div className="hidden md:flex w-full items-center">
                    <MdSearch className="text-xl text-card-foreground" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={SearchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-card text-card-foreground outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Radio Buttons */}
          {isRadioButton && (
            <div className="flex items-center gap-4 px-2  rounded-md">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="all"
                  name="all"
                  value="all"
                  checked={currentSelectedOption === "all"}
                  onChange={(e) => {
                    setSelectedOption(e.target.value);
                    onSelectedRadioButton?.(e.target.value);
                  }}
                  className="h-4 w-4 border-gray-300 accent-primary focus:ring-primary "
                />
                <label
                  htmlFor="option1"
                  className="text-sm font-medium text-gray-700 text-black dark:text-white"
                >
                  All
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="valid"
                  name="valid"
                  value="valid"
                  checked={currentSelectedOption === "valid"}
                  onChange={(e) => {
                    setSelectedOption(e.target.value);
                    onSelectedRadioButton?.(e.target.value);
                  }}
                  className="h-4 w-4 border-gray-300 accent-primary focus:ring-primary "
                />
                <label
                  htmlFor="option2"
                  className="text-sm font-medium text-gray-700 text-black dark:text-white"
                >
                  Valid
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="invalid"
                  name="invalid"
                  value="invalid"
                  checked={currentSelectedOption === "invalid"}
                  onChange={(e) => {
                    setSelectedOption(e.target.value);
                    onSelectedRadioButton?.(e.target.value);
                  }}
                  className="h-4 w-4 border-gray-300 accent-primary focus:ring-primary "
                />
                <label
                  htmlFor="option3"
                  className="text-sm font-medium text-gray-700 text-black dark:text-white"
                >
                  Invalid
                </label>
              </div>
            </div>
          )}

          {/* Column Toggle */}
          <ColumnToggleMenu
            columns={columns}
            onToggle={handleColumnToggle}
            visibleColumns={visibleColumns}
          />

          {/* Selected Count */}
          {isCount && (
            <div
              title="Total Selected Rows"
              onClick={() =>
                typeof onDownloadAll === "function" ? onDownloadAll(data) : null
              }
              className="rounded-lg bg-purple-100 p-2 text-primary text-center min-w-[40px] cursor-pointer"
            >
              <span>{selectedItems.length}</span>
            </div>
          )}

          {/* Download Button */}
          {/* {isDownload && (
            <Button
              variant="outline"
              size="icon"
              onClick={downloadTableAsCSV}
              title="Download Table Data as CSV"
              className="h-9 w-9"
            >
              <MdFileDownload className="h-4 w-4" />
            </Button>
          )} */}

          {/* Table Download Button */}
          {isTableDownload && (
            <Button
              variant="outline"
              size="icon"
              onClick={downloadTableAsCSV}
              title="Download Table Data as CSV"
              className="h-9 w-9"
            >
              <MdFileDownload className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex md:justify-end gap-2 flex-wrap">
          <div className="hidden md:flex gap-2 flex-wrap justify-end">
            {isgenerateTable && (
              <Button
                variant="default"
                className="bg-primary text-white hover:bg-secondary h-9"
                onClick={() => onGenerateReport?.()}
              >
                {buttonTextName}
              </Button>
            )}

            {isUserTable && (
              <>
                <Button
                  variant="default"
                  className="bg-primary text-white hover:bg-secondary h-9"
                  onClick={handleAddUser}
                >
                  Create User
                </Button>
                <Button
                  variant="default"
                  className="bg-primary text-white hover:bg-secondary h-9"
                  onClick={handleProductMapping}
                >
                  Product Mapping
                </Button>
              </>
            )}

            {isUserPackage && (
              <Button
                variant="default"
                className="bg-primary text-white hover:bg-secondary h-9"
                onClick={() => handleAddPackage?.()}
              >
                Add Package
              </Button>
            )}
            {isRuleConfiguration && (
              <Button
                variant="default"
                className="dark:text-white rounded-md"
                onClick={() => handleAddRuleConfiguration?.()}
              >
                Add Rule Configuration
              </Button>
            )}
            {isGeoConfiguration && (
              <Button
                variant="default"
                className="dark:text-white rounded-md"
                onClick={() => handleAddGeoConfiguration?.()}
              >
                Add Geo Configuration
              </Button>
            )}
            {isCustomRuleConfiguration && (
              <Button
                variant="default"
                className="bg-primary text-white hover:bg-secondary h-9"
                onClick={() => handleAddCustomRuleConfiguration?.()}
              >
                Add Configuration
              </Button>
            )}

            {isMappingPackage && (
              <>
                <Button
                  variant="default"
                  className="bg-primary text-white hover:bg-secondary h-9"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="default"
                  className="bg-primary text-white hover:bg-secondary h-9"
                  onClick={() => handleAddProductMapping?.()}
                >
                  Add Product Mapping
                </Button>
              </>
            )}
            {actionButton}
          </div>

          {/* ✅ NEW: Action Buttons from Parent Configuration - Mobile */}
          <div className="md:hidden w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="h-9 w-full">
                  Actions
                  <MdArrowDropDown className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {/* ✅ RENDER ACTION BUTTONS IN MOBILE DROPDOWN */}
                {actionButtons.map((buttonConfig, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={buttonConfig.action}
                    className="cursor-pointer"
                    disabled={buttonConfig.disabled}
                  >
                    {buttonConfig.icon && (
                      <span className="mr-2">{buttonConfig.icon}</span>
                    )}
                    {buttonConfig.title}
                  </DropdownMenuItem>
                ))}

                {/* ✅ LEGACY BUTTONS (for backward compatibility) */}
                {isgenerateTable && (
                  <DropdownMenuItem
                    onClick={onGenerateReport}
                    className="cursor-pointer"
                  >
                    {buttonTextName}
                  </DropdownMenuItem>
                )}
                {isUserTable && (
                  <>
                    <DropdownMenuItem
                      onClick={handleAddUser}
                      className="cursor-pointer"
                    >
                      Add User
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleProductMapping}
                      className="cursor-pointer"
                    >
                      Product Mapping
                    </DropdownMenuItem>
                  </>
                )}
                {isUserPackage && (
                  <DropdownMenuItem
                    onClick={handleAddPackage}
                    className="cursor-pointer"
                  >
                    Add Package
                  </DropdownMenuItem>
                )}
                {isMappingPackage && (
                  <>
                    <DropdownMenuItem
                      onClick={handleBack}
                      className="cursor-pointer"
                    >
                      Back
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleAddProductMapping}
                      className="cursor-pointer"
                    >
                      Add Product Mapping
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Table Container with fixed height and scrollable content */}
      <div
        ref={tableContainerRef}
        className="relative flex-1 border border-t-0 rounded-b-lg overflow-hidden"
        style={{ height: `${containerHeight}px` }}
      >
        <div
          className="overflow-auto h-full w-full"
          style={{ height: `${height}px` }}
        >
          <Table ref={tableRef} className="min-w-full">
            <TableHeader className={`sticky top-0 z-10 ${tableHeader} p-0`}>
              <TableRow>
                {isSelectable && (
                  <TableHead
                    className={`border-r ${tableHeader}`}
                    style={{
                      width: "50px",
                      minWidth: "50px",
                      maxWidth: "50px",
                      backgroundColor: headerColor,
                    }}
                  >
                    <Checkbox
                      onCheckedChange={(checked) => {
                        const allItems = checked ? filteredData : [];
                        setSelectedItems(allItems);
                        if (onSelect) {
                          onSelect(allItems);
                        }
                      }}
                    />
                  </TableHead>
                )}
                {visibleColumns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="relative border-r p-0"
                    style={{
                      backgroundColor: headerColor,
                      color: "black",
                      width: `${columnWidths[column.key]}px`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div className="flex items-center justify-between px-2">
                      {/* ✅ IMPROVED HEADER WITH SORTING */}
                      <div className="flex-1 overflow-hidden">
                        <span
                          className="block truncate text-sm font-bold"
                          title={column.title}
                        >
                          {column.title}
                        </span>
                      </div>

                      {/* ✅ IMPROVED SORTING ICON */}
                      <div className="flex items-center ml-2">
                        <button
                          onClick={() => handleSort(column.key)}
                          className="cursor-pointer p-1 hover:bg-gray-200 rounded"
                          title={`Sort by ${column.title}`}
                        >
                          {sortConfig?.key === column.key ? (
                            sortConfig.direction === "asc" ? (
                              <MdArrowUpward className="text-primary text-sm" />
                            ) : (
                              <MdArrowDownward className="text-primary text-sm" />
                            )
                          ) : (
                            <MdUnfoldMore className="text-gray-400 text-sm hover:text-gray-600" />
                          )}
                        </button>
                      </div>

                      {/* Column Resize Handle */}
                      <div
                        onMouseDown={(e) => handleMouseDown(e, column.key)}
                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-gray-400"
                        style={{ backgroundColor: "transparent" }}
                      />
                    </div>
                  </TableHead>
                ))}

                {(isEdit ||
                  isDelete ||
                  isView ||
                  isDownload ||
                  isPause ||
                  isPlay ||
                  isRefetch ||
                  isSend ||
                  isClone) && (
                  <TableHead
                    className="border-r"
                    style={{
                      backgroundColor: headerColor,
                      color: "black",
                      width: "100px",
                      minWidth: "100px",
                      whiteSpace: "nowrap",
                      fontWeight: "bold",
                    }}
                  >
                    Action
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody className="border border-border">
              {isLoading ? (
                <TableRow className="h-16">
                  <TableCell colSpan={colSpan} className={`h-32 ${tableBody}`}>
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className={`h-32 ${tableBody}`}>
                    <div className="flex justify-center items-center h-full">
                      <span className="text-small-font">
                        {SearchTerm.trim()
                          ? "No matching results found"
                          : emptyStateMessage}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow key={index} className="h-8">
                    {isSelectable && (
                      <TableCell
                        className={`border-r p-4 ${tableBody}`}
                        style={{
                          width: "20px",
                          minWidth: "20px",
                          maxWidth: "20px",
                          height: "24px",
                          lineHeight: "24px",
                        }}
                      >
                        <Checkbox
                          checked={selectedItems.includes(item)}
                          onCheckedChange={() => handleCheckboxChange(item)}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={`border-r dark:text-white text-base-font p-2 ${tableBody}`}
                        style={{
                          maxWidth: `${columnWidths[column.key]}px`,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {/* ✅ IMPROVED CELL CONTENT WITH RENDER FUNCTION */}
                        {/* {"render" in column
                          ? column.render(item)
                          : typeof item[column.key] === "number"
                            ? item[column.key].toLocaleString()
                            : String(item[column.key] || "")} */}

                        {"render" in column ? (
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {column.render(item)}
                          </div>
                        ) : (
                          <EllipsisTooltip
                            content={
                              typeof item[column.key] === "number"
                                ? item[column.key].toLocaleString()
                                : String(item[column.key] || "")
                            }
                          />
                        )}
                      </TableCell>
                    ))}
                    {(isEdit ||
                      isDelete ||
                      isView ||
                      isDownload ||
                      isPause ||
                      isPlay ||
                      isRefetch ||
                      isSend ||
                      isClone) && (
                      <TableCell
                        className="border-r dark:text-white p-2"
                        style={{ height: "24px", lineHeight: "24px" }}
                      >
                        <div className="flex space-x-2 justify-center">
                          {isClone && (
                            <button
                              onClick={() => onClone?.(item)}
                              className="text-primary hover:text-gray-500"
                            >
                              <FaClone size={18} />
                            </button>
                          )}
                          {isView && (
                            <button
                              onClick={() => onView?.(item)}
                              className="text-primary hover:text-gray-500"
                            >
                              <MdVisibility size={18} />
                            </button>
                          )}
                          {isEdit && (
                            <button
                              onClick={() => onEdit?.(item)}
                              className="text-primary hover:text-gray-500"
                            >
                              <MdEdit size={18} />
                            </button>
                          )}
                          {isDelete && (
                            <button
                              onClick={() => onDelete?.(item)}
                              className="text-primary hover:text-gray-500"
                            >
                              <MdDelete size={18} />
                            </button>
                          )}
                          {isRefetch && (
                            <button
                              onClick={() => setIsRefetchModalOpen(true)}
                              className="text-primary hover:text-gray-500"
                            >
                              <FiRefreshCw size={18} />
                            </button>
                          )}
                          {isSend && (
                            <button
                              onClick={() => onSend?.(item)}
                              className="text-primary hover:text-gray-500"
                            >
                              <IoIosSend size={18} />
                            </button>
                          )}
                          {isDownload && (
                            <button
                              onClick={() => onDownload?.(item)}
                              className="text-primary hover:text-gray-500"
                            >
                              <MdFileDownload size={18} />
                            </button>
                          )}
                          {isPause && (
                            <button
                              onClick={() => onPause?.(item)}
                              className="text-primary hover:text-gray-500"
                            >
                              <MdPause size={18} />
                            </button>
                          )}
                          {isPlay && (
                            <button
                              onClick={() => onPlay?.(item)}
                              className="text-primary hover:text-gray-500"
                            >
                              <MdPlayArrow size={18} />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ✅ IMPROVED PAGINATION CONTROLS */}
      {isPaginated && data.length > 0 && (
        <div
          ref={paginationRef}
          className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-2 p-2 border rounded-lg bg-card"
        >
          <div className="flex items-center gap-2">
            {/* <span className="text-sm text-muted-foreground">Rows per page:</span> */}
            <Select
              value={String(itemsPerPage)}
              onValueChange={(value) => {
                const newLimit = Number(value);
                setItemsPerPage(newLimit);
                setCurrentPage(1);
                // Call parent handler for external pagination
                if (onLimitChange) {
                  onLimitChange(newLimit);
                }
              }}
            >
              <SelectTrigger className="w-[70px]  h-[30px] outline-none focus:ring-0  text-small-font dark:text-white">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent className="border-none outline-none focus:ring-0">
                {/* <SelectItem value="5">5</SelectItem> */}
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
            {/* Show records count when totalRecords is provided */}
            {totalRecords > 0 && (
              <span className="text-sm text-muted-foreground dark:text-gray-400">
                Showing {((currentPage - 1) * (limit || itemsPerPage)) + 1} - {Math.min(currentPage * (limit || itemsPerPage), totalRecords)} of {totalRecords.toLocaleString()} records
              </span>
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showFirstLast={true}
          />
        </div>
      )}

      {/* Date Range Modal */}
      <Dialog open={isRefetchModalOpen} onOpenChange={setIsRefetchModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              onClick={handleRefetch}
              disabled={!startDate || !endDate}
              className="w-full sm:w-auto"
            >
              Refetch Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ✅ EXPORT AS DEFAULT TO MATCH YOUR IMPORT PATTERN
export default ResizableTable;
