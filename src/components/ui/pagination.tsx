import React from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = false,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 6) {
      // Show all pages if total pages are 6 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first 2 pages
      pages.push(1, 2);
      
      if (currentPage > 4) {
        pages.push("...");
      }
      
      // Show current page and surrounding pages
      if (currentPage > 3 && currentPage < totalPages - 2) {
        pages.push(currentPage);
      }
      
      if (currentPage < totalPages - 3) {
        pages.push("...");
      }
      
      // Always show last 2 pages
      pages.push(totalPages - 1, totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center  flex-wrap space-x-2 ">
      <Button
        variant="outline"
        size="xs"
        className="text-small-font"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-2 w-2" />
      </Button>

      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {typeof page === "string" ? (
            <span className="px-2">...</span>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="xs"
              className={`text-small-font ${currentPage === page ? 'text-white' : 'text-black'}`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button
        variant="outline"
        size="xs"
        className="text-small-font"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-2 w-2" />
      </Button>
    </div>
  );
};

export default Pagination;