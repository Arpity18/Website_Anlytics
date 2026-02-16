import React, { useMemo } from 'react';
import { StatsCardsSkeleton } from './charts/ChartSkeletons';
 
/**
 * Structure for individual stat card data
 */
export interface StatCardItem {
  count: string | number;
  percentage?: string;
  color_code?: string;
}
 
/**
 * Dynamic stats data structure - keys can be any string
 * Example: { "Total": { count: "1000", color_code: "#820d76" }, ... }
 */
export type StatsData = Record<string, StatCardItem>;
 
/**
 * Optional custom labels mapping - if not provided, keys from data will be used
 */
export interface CustomLabels {
  [key: string]: string;
}
 
/**
 * Props for StatsCards component
 */
export interface StatsCardsProps {
  /**
   * Dynamic stats data - accepts any number of keys
   * Each key should have: count (required), percentage (optional), color_code (optional)
   */
  data: StatsData;
 
  /**
   * Optional custom labels to override key names
   * Example: { "Total": "Total Installs", "Valid": "Valid Installs" }
   */
  customLabels?: CustomLabels;
 
  /**
   * Loading state
   */
  isLoading?: boolean;
 
  /**
   * Card height - defaults to 100px
   */
  cardHeight?: number | string;
 
  /**
   * Grid columns configuration
   * Defaults to responsive: 1 on mobile, 3 on desktop
   */
  gridCols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
 
  /**
   * Default border color if color_code is not provided
   */
  defaultBorderColor?: string;
 
  /**
   * Default text color for count if color_code is not provided
   */
  defaultCountColor?: string;
 
  /**
   * Show percentage badge - defaults to true if percentage exists
   */
  showPercentage?: boolean;
 
  /**
   * Custom className for the container
   */
  className?: string;
 
  /**
   * Number of skeleton cards to show when loading
   * If not provided, will use the number of keys in data or default to 3
   */
  skeletonCardCount?: number;
}
 
/**
 * StatsCards Component
 *
 * A fully dynamic component that renders stat cards based on the provided data structure.
 * Automatically handles any number of cards and uses color codes from the response.
 *
 * @example
 * ```tsx
 * <StatsCards
 *   data={{
 *     "Total": { count: "2189869", color_code: "#820d76" },
 *     "Valid": { count: "2153750", percentage: "98.35%", color_code: "#008000" },
 *     "Invalid": { count: "36119", percentage: "1.65%", color_code: "#FF0000" }
 *   }}
 *   customLabels={{ "Total": "Total Installs" }}
 *   isLoading={false}
 * />
 * ```
 */
const StatsCards: React.FC<StatsCardsProps> = ({
  data,
  customLabels = {},
  isLoading = false,
  cardHeight = 100,
  gridCols = {
    mobile: 1,
    tablet: 1,
    desktop: 3,
  },
  defaultBorderColor = '#7C3AED',
  defaultCountColor = '#000000',
  showPercentage = true,
  className = '',
  skeletonCardCount,
}) => {
  /**
   * Transform data into array of card items with proper ordering
   */
  const cardItems = useMemo(() => {
    if (!data || typeof data !== 'object') {
      return [];
    }
 
    return Object.entries(data)
      .filter(([_, value]) => value && typeof value === 'object')
      .map(([key, value]) => {
        const item = value as StatCardItem;
        return {
          key,
          label: customLabels[key] || key,
          count: item.count ?? 0,
          percentage: item.percentage,
          colorCode: item.color_code || defaultBorderColor,
        };
      });
  }, [data, customLabels, defaultBorderColor]);
 
  /**
   * Format number with locale string
   */
  const formatNumber = (value: string | number): string => {
    const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;
    if (Number.isNaN(numValue)) return '0';
    return Number(numValue).toLocaleString('en-US');
  };
 
  /**
   * Get grid columns class
   * Tailwind requires full class names, so we map common values
   */
  const getGridColsClass = () => {
    const mobile = gridCols.mobile ?? 1;
    const tablet = gridCols.tablet ?? gridCols.mobile ?? 1;
    const desktop = gridCols.desktop ?? 4;
   
    // Map to Tailwind classes
    const colsMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
    };
   
    const mobileClass = colsMap[mobile] || 'grid-cols-1';
    const tabletClass = colsMap[tablet] || 'grid-cols-1';
    const desktopClass = colsMap[desktop] || 'grid-cols-4';
   
    // Always include all breakpoint classes for proper responsive behavior
    return `${mobileClass} sm:${tabletClass} md:${desktopClass} lg:${desktopClass} xl:${desktopClass} 2xl:${desktopClass}`;
  };
 
  /**
   * Get card height style
   */
  const getCardHeightStyle = (): string => {
    if (typeof cardHeight === 'number') {
      return `${cardHeight}px`;
    }
    return cardHeight;
  };
 
  // Show skeleton when loading
  if (isLoading) {
    const count = skeletonCardCount ?? (cardItems.length > 0 ? cardItems.length : 3);
    return (
      <StatsCardsSkeleton
        cardCount={count}
        cardHeight={cardHeight}
        gridCols={gridCols}
        className={className}
      />
    );
  }
 
  // Return null if no data and not loading
  if (cardItems.length === 0) {
    return null;
  }
 
  const gridColsClass = getGridColsClass();
  
  return (
    <div 
      className={`grid w-full gap-2 rounded-lg ${gridColsClass} ${className}`.trim()}
    >
      {cardItems.map((item, index) => {
        const hasPercentage = showPercentage && item.percentage;
        const borderColor = item.colorCode;
        const countColor = item.colorCode !== defaultBorderColor ? item.colorCode : defaultCountColor;

        return (
          <div key={item.key} className="min-w-0">
            <div
              className="card border-0 relative overflow-hidden bg-white dark:bg-card rounded-lg w-full"
              style={{
                height: getCardHeightStyle(),
                borderRight: `5px solid ${borderColor}`,
              }}
            >
              <div className="p-3 px-4 h-full flex flex-col justify-center items-center">
                  <div className="flex flex-col gap-1 items-center w-full">
                    <div className="flex flex-row gap-2 items-center justify-center">
                      <div
                        className="text-3xl font-semibold text-center dark:text-white"
                        style={{ color: hasPercentage ? countColor : undefined }}
                      >
                        {formatNumber(item.count)}
                      </div>
                      {hasPercentage && (
                        <span
                          className="text-sm font-semibold rounded-md px-2 py-1"
                          style={{
                            backgroundColor: `${borderColor}20`,
                            color: borderColor,
                          }}
                        >
                          {item.percentage}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-card-foreground text-center">
                      {item.label}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
 
export default StatsCards;