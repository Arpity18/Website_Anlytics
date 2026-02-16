import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EngagementCardProps {
  sessionId: string;
  device: string;
  dateTime: string;
  isSelected?: boolean;
  onPlay?: () => void;
  onClick?: () => void;
  height?: string; // Custom height (e.g., "80px", "100px", "5rem")
  className?: string; // Additional custom classes
  isLoading?: boolean;
}

export default function EngagementCard({
  sessionId,
  device,
  dateTime,
  isSelected = false,
  onPlay,
  onClick,
  height,
  className,
  isLoading = false,
}: EngagementCardProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLoading) return;
    onClick?.();
  };

  const handlePlayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) return;
    e.stopPropagation();
    onPlay?.();
  };

  return (
    <Card
      className={cn(
        "w-full p-2 sm:p-3 md:p-4 cursor-pointer transition-all hover:shadow-md",
        isSelected && !isLoading && "border-2 border-purple-500",
        isLoading && "opacity-80 cursor-default",
        className
      )}
      style={height ? { height } : undefined}
      onClick={handleClick}
      aria-busy={isLoading || undefined}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center md:items-center justify-between gap-2 sm:gap-3 md:gap-4">
          {/* Left Section */}
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            {/* Session ID */}
            <div className="mb-1 sm:mb-1.5 md:mb-2">
              {isLoading ? (
                <Skeleton className="h-4 w-32 sm:w-40 md:w-48" />
              ) : (
                <p className="text-xs sm:text-sm md:text-base font-semibold text-foreground truncate">
                  {sessionId}
                </p>
              )}
            </div>

            {/* Device & Date/Time */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
              {isLoading ? (
                <>
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-0.5 md:py-1"
                  >
                    {device}
                  </Badge>
                  <div className="hidden sm:block">
                    <span>{dateTime}</span>
                  </div>
                  <div className="block sm:hidden text-[9px]">
                    <span>{dateTime.split(" ")[0]}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0 self-end sm:self-center md:self-center mt-2 sm:mt-0">
            {isLoading ? (
              <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-md" />
            ) : (
              <Button
                size="icon"
                variant="default"
                className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 rounded-md dark:bg-gray-300 dark:text-black text-primary hover:text-primary-foreground flex-shrink-0"
                onClick={handlePlayClick}
              >
                <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-white dark:text-black" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

