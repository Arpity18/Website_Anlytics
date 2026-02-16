import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { EyeIcon, Loader2 } from "lucide-react"; // Using a spinner for loading state

interface MFCardProps {
  title: string;
  titleClass?: string;
  titleFontSize?: string;  // Font size for title
  titlePosition?: "left" | "center" | "right";  // Title alignment
  description?: string;
  descriptionClass?: string;
  loading?: boolean;
  children?: React.ReactNode;
  align?: "left" | "center" | "right";  // For text alignment of the entire card
  className?: string;  // Custom class for more control
  onClick?: () => void;  // Optional click handler for interactive cards
  contentData?: { 
    label: string; 
    views: number; 
    duration?: string; 
  }[]; // New prop for dynamic content
  viewsLabel?: string;  // Custom label for views (default "Views")
  durationLabel?: string;  // Custom label for duration (default "Duration")
  maxContentItems?: number;  // Max number of content items to show (default 5)
  layout?: "list" | "grid";  // Layout for content (default "list")
  showExpandCollapse?: boolean;  // Option to expand/collapse content
}

export default function MFCard({
  title,
  titleClass,
  titleFontSize,  // CSS font size value (e.g., "14px", "1rem") - use titleClass for Tailwind classes
  titlePosition = "left", // Default to "left" alignment
  loading = false,
  children,
  description,
  descriptionClass,
  align = "left",
  className = "",
  onClick,
  contentData = [],
  viewsLabel = "Views",
  durationLabel = "Duration",
  maxContentItems = 5,
  layout = "list",  // Default layout is list
  showExpandCollapse = false,  // Default is not expandable
}: MFCardProps) {
  // Loader component for the loading state
  const Loader = (
    <div className="flex justify-center items-center py-4">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  const [isExpanded, setIsExpanded] = useState(false);  // State for expandable content

  // If loading, display loader
  if (loading) {
    return (
      <Card className={`w-full ${className} p-2`}>
        {Loader}
      </Card>
    );
  }

  // Show all content items - make scrollable if there's more data
  const contentToShow = contentData;

  return (
    <Card 
      className={`w-full text-${align} ${className} border-none rounded-none p-2`}  // Removed border classes and reduced padding
      onClick={onClick}  // Add click functionality
    >
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-start p-1">  {/* Align to top */}
        <div className="flex-1">
          <CardTitle
            className={`${titleClass || ""} font-semibold`}
            style={{ 
              ...(titleFontSize ? { fontSize: titleFontSize } : {}),
              textAlign: titlePosition 
            }}  // Apply font size and alignment dynamically
          >
            {title}
          </CardTitle>
          {description && (
            <CardDescription className={descriptionClass}>
              {description}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent className={`max-h-[230px] overflow-y-auto scrollbar scroll-smooth p-0`}>  {/* Make scrollable for more data - matches Donut Chart height and scrollbar, no padding on container */}
        {contentToShow.length === 0 ? (
          <p className="p-2 text-center text-body text-small-font">No Data Found !</p>
        ) : (
          <div className="space-y-4 pl-2 pt-2 pb-2">
            {contentToShow.map((content, index) => (
              <div
                key={index}
                className={`flex justify-between items-center ${layout === "grid" ? "grid grid-cols-2" : "flex"}`}
              >
              {/* Align label to the left */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-md font-semibold sm:text-xs font-sm text-foreground truncate">{content.label}</p>
              </div>
              {/* Align values to the right */}
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 text-right ml-auto pr-6">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="inline-block rounded-md bg-orange-100 px-2 py-0.5 font-medium text-orange-700">

                    
                    <p className="text-xs sm:text-xs font-sm">{content.views.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{viewsLabel}</p>
                  </div>
                  {/* <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-xs">{content.duration}</p>
                    <p className="text-xs text-muted-foreground">{durationLabel}</p>
                  </div> */}
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
