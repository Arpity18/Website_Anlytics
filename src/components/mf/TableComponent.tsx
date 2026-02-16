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
  MdRefresh,
  MdArrowDownward,
  MdArrowUpward,
  MdPause,
  MdPlayArrow,
} from "react-icons/md";
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
} from "@/components/ui/select"; // Import ShadCN Select components
import { Loader2 } from "lucide-react"; // Add this import
import { Button } from "../ui/button";

export type Column<T = void> =
  | { title: string; key: string }
  | { title: string; key: string; render: (data: T) => React.ReactNode };

interface ResizableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  headerColor?: string;
  isEdit?: boolean;
  isDelete?: boolean;
  isView?: boolean;
  isDownload?: boolean;
  isPaginated?: boolean;
  isSearchable?: boolean;
  isSelectable?: boolean;
  isCount?: boolean;
  isLoading?: boolean; // Add this prop
  isFile?:boolean;
  SearchTerm?:string;
  setSearchTerm: (term: string) => void;
  actionButton?: React.ReactNode | React.ReactNode[];
  onEdit?: (item: T) => void;
  onDownloadAll?: (item: T[]) => void;
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
  height?: number; // New height prop
  isSearchDelete?:boolean;
  isSearchDownload?:boolean;
}

const DropdownMenu: React.FC<{
  columns: Column<Record<string, string | number>>[];
  onToggle: (key: string) => void;
  visibleColumns: Column<Record<string, string | number>>[];
}> = ({ columns, onToggle, visibleColumns }) => {
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex w-56 items-center justify-between rounded border bg-card p-2 text-card-foreground">
          <span>Columns</span>
          <div className="ml-auto flex items-center space-x-2">
            {/* <div className="h-6 border-l-2 border-black" />  */}|
            <span className="ml-2 mt-1 text-sm text-primary">
              {columns.length === visibleColumns.length
                ? "All"
                : visibleColumns.length}
            </span>
            <MdArrowDropDown className="ml-2" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        {columns.map((column) => (
          <div key={column.key} className="flex items-center px-4 py-2">
            <Checkbox
              checked={visibleColumns.some((col) => col.key === column.key)}
              onCheckedChange={() => onToggle(column.key)}
            />
            <span className="ml-2">{column.title}</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

const ResizableTable: React.FC<
  ResizableTableProps<Record<string, string | number>>
> = ({
  columns,
  data,
  headerColor = "#ccc",
  isEdit = false,
  isDelete = false,
  isView = false,
  isPaginated = true,
  isDownload = false,
  isSearchable = false,
  isSelectable = false,
  isCount = false,
  isLoading = false, // Add this prop
  actionButton,
  onEdit,
  onDelete,
  onView,
  onDownload,
  SearchTerm="",
  setSearchTerm,
  onSelect,
  onDownloadAll,
  onRefresh,
  itemCount,
  isPause = false,
  isPlay = false,
  onPause,
  onPlay,
  isSearchDownload,
  height, // Accept the height prop
}) => {
 // const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<
    Record<string, string | number>[]
  >([]);
  const [isMounted, setIsMounted] = useState(false);
  const [visibleColumns, setVisibleColumns] =
    useState<Column<Record<string, string | number>>[]>(columns);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>(
    {},
  );
  const tableRef = useRef<HTMLTableElement>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerHeight, setContainerHeight] = useState<number>(0);


  useEffect(() => {
    setIsMounted(true);
    const initialWidths: { [key: string]: number } = {};
    columns.forEach((col) => {
      initialWidths[col.key] = 150;
    });
    setColumnWidths(initialWidths);
  }, [columns]);


  useEffect(() => {
    const calculateHeight = () => {
      if (!height) {
      const vh = window.innerHeight;
      const otherElementsHeight = 200;
      setContainerHeight(vh - otherElementsHeight);
      }else{
        setContainerHeight(height);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);

    return () => window.removeEventListener('resize', calculateHeight);
  }, [height]);

  const handleColumnToggle = (key: string) => {
    const newVisibleColumns = visibleColumns.some((col) => col.key === key)
      ? visibleColumns.filter((col) => col.key !== key)
      : [...visibleColumns, columns.find((col) => col.key === key)!];
    setVisibleColumns(newVisibleColumns);
  };

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

  const sortedData = React.useMemo(() => {
    const sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const filteredData = sortedData.filter((item) => {
    return visibleColumns.some((column) =>
      String(item[column.key]).toLowerCase().includes(SearchTerm.toLowerCase()),
    );
  });

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

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

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + moveEvent.clientX - startX;
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

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
  };

  if (!isMounted) return null;

  return (
    <div className="w-full">
      <div className="flex flex-wrap w-full items-center text-body space-x-2 rounded-lg border bg-card p-1.5">
        {isSearchable && (
          <div className="flex flex-grow items-center space-x-2 sm:w-full md:w-1/2 lg:w-1/2 p-2">
            <MdSearch className="text-xl text-card-foreground transition-colors duration-200 hover:text-primary" />
            <input
              type="text"
              placeholder="Search"
              value={SearchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card text-card-foreground outline-none "
            />
          </div>
        )}
        {/* Separator */}
        <div className="mx-2 h-6 sm:hidden md:block lg:block border-l" />
        <DropdownMenu
          columns={columns}
          onToggle={handleColumnToggle}
          visibleColumns={visibleColumns}
        />
        {actionButton && <div className="mx-2 h-6 sm:hidden md:block lg:block border-l" />}
        {actionButton}
        <div className="mx-2 h-6 sm:hidden md:block lg:block border-l" />
        {isCount && (
          <span
            title="Total Selected Rows"
            onClick={() =>
              typeof onDownloadAll === "function" ? onDownloadAll(data) : null
            }
            className="rounded-lg bg-purple-100 p-2 text-primary"
          >
            <span>{selectedItems.length}</span>
          </span>
        )}
        {/* Separator */}
        <div className="mx-2 h-6 sm:hidden md:block lg:block" />
        {isSearchDownload && (
          <MdFileDownload
            title="Table Data Download"
            className="cursor-pointer text-xl text-primary transition-colors duration-200 hover:text-gray-400"
          />
        )}
        {/* Separator */}

        {/* <div className="mx-2 h-6 border-l" />
        <Button variant="ghost" size="icon-xs" onClick={() => onRefresh()}>
          <MdRefresh
            title="Table Data Refresh"
            className="cursor-pointer text-xl text-primary transition-colors duration-200 hover:text-gray-400"
          />
        </Button> */}
        {/* Separator */}
         {/* New Action Buttons in the search row */}
      
        <div className="relative"></div>
      </div>

      <div 
        className="relative"
        style={{ 
          height: `${containerHeight}px`,
          overflowY: 'auto',
          overflowX: 'auto'
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/5">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <Table ref={tableRef} className="min-w-full border ">
          <TableHeader className="sticky top-0 z-10 ">
            <TableRow>
              {isSelectable && (
                <TableHead
                  className="border-r "
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
                  className="relative border-r"
                  style={{
                    backgroundColor: headerColor,
                    color: "black",
                    width: `${columnWidths[column.key]}px`,
                    whiteSpace: "nowrap",
                  }}
                >
                  <div className="flex items-center justify-center text-center text-body font-semibold">
                    <span
                      onClick={() => handleSort(column.key)}
                      className="cursor-pointer text-center"
                      style={{ width: "100%" }}
                    >
                      {column.title}
                      {sortConfig?.key === column.key &&
                        (sortConfig?.direction === "asc" ? (
                          <MdArrowUpward className="inline-block" />
                        ) : sortConfig?.direction === "desc" ? (
                          <MdArrowDownward className="inline-block" />
                        ) : null)}
                    </span>
                    <div
                      onMouseDown={(e) => handleMouseDown(e, column.key)}
                      className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-gray-400 "
                      style={{ backgroundColor: "transparent" }}
                    />
                  </div>
                </TableHead>
              ))}

              {(isEdit || isDelete || isView || isDownload || isPause || isPlay) && (
                <TableHead
                  className="border-r text-center"
                  style={{
                    backgroundColor: headerColor,
                    color: "black",
                    width: `${columnWidths}px`,
                    whiteSpace: "nowrap",
                  }}
                >
                  Action
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={index}>
                {isSelectable && (
                  <TableCell
                    className="border-r "
                    style={{
                      width: "20px",
                      minWidth: "20px",
                      maxWidth: "20px",
                    }}
                  >
                    <Checkbox
                      checked={selectedItems.includes(item)}
                      onCheckedChange={() => handleCheckboxChange(item)}
                    />
                  </TableCell>
                )}
                {visibleColumns.map((column) => (
                  <TableCell key={column.key} className="border-r text-center dark:text-white text-small-font">
                    {"render" in column ? column.render(item) : item[column.key]}
                  </TableCell>
                ))}
                {(isEdit || isDelete || isView || isDownload || isPause || isPlay) && (
                  <TableCell className="border-r dark:text-white">
                    <div className="flex space-x-2">
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
                      {isView && (
                        <button
                          onClick={() => onView?.(item)}
                          className="text-primary hover:text-gray-500"
                        >
                          <MdVisibility size={18} />
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
            ))}
          </TableBody>
        </Table>
      </div>

      {isPaginated && (
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center">
            <Select
              value={String(itemsPerPage)}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[90px] outline-none focus:ring-0 dark:text-white">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent className="border-none outline-none focus:ring-0">
              <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">50</SelectItem>
                <SelectItem value="40">200</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.length / itemsPerPage)}
            onPageChange={handlePageChange}
            showFirstLast={true}
          />
        </div>
      )}
    </div>
  );
};

export default ResizableTable;