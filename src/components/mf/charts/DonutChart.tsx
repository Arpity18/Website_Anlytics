
"use client";
import React, { useState, useEffect } from 'react';
import { useFullscreen } from '@/hooks/full-screen';
import { Label, Pie, PieChart, ResponsiveContainer, LabelList, Cell } from "recharts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatNumber } from "@/lib/utils";
import HeaderRow from "../HeaderRow";
import { DonutChartSkeleton } from "./ChartSkeletons";

interface DonutChartProps {
  chartData?: { label?: string;[key: string]: string | number | undefined }[];
  dataKey: string;  // Dynamic key for chart data
  nameKey?: string;  // Dynamic key for name
  chartConfig?: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
  marginTop?: string;
  isdonut?: boolean;
  isLoading?: boolean;
  isView: boolean;
  handleExport?: () => void;
  onExpand: () => void;
  onExport?: (s: string, title: string, index: number) => void;
  visitEventOptions?: { value: string; label: string }[];
  handleTypeChange?: (value: string) => void;
  selectedType?: string;
  title?: string;
  isSelect?: boolean;
  isRadioButton?: boolean;
  selectoptions?: string[];
  placeholder?: string;
  DonutTitle?: string;
  isPercentageValue?: boolean;
  isLabelist?: boolean;
  direction?: string;
  totalV?: number;
  position?: string;
  isPercentage?: boolean;
  istotalvistors?: boolean;
  isExpand?: boolean;
    onSegmentClick?: (data: any) => void;
}

const DonutChart: React.FC<DonutChartProps> = ({
  chartData = [],
  chartConfig,
  handleTypeChange,
  visitEventOptions,
  selectedType,
  selectoptions = [],
  handleExport,
  onExport,
  onExpand,
  title,
  isSelect = false,
  isRadioButton = false,
  placeholder = "",
  dataKey,
  nameKey,
  totalV,
  DonutTitle,
  isView = true,
  isPercentageValue = true,
  isLabelist = false,
  direction = "flex-col",
  isLoading = false,
  isdonut = false,
  marginTop,
  position,
  isPercentage,
  istotalvistors = true,
   onSegmentClick,
  isExpand = false,
}) => {


  const formatVisitors = React.useMemo(() => (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  }, []);

  const [innerRadius, setInnerRadius] = React.useState(60);
  const [outerRadius, setOuterRadius] = React.useState(70);
  
  // Calculate responsive radii for expanded mode
  const getExpandedRadii = () => {
    if (window.innerWidth < 640) {
      return { inner: 35, outer: 70 }; // Mobile
    } else if (window.innerWidth >= 640 && window.innerWidth <= 1024) {
      return { inner: 80, outer: 140 }; // Tablet
    } else if (window.innerWidth > 1024 && window.innerWidth < 1280) {
      return { inner: 80, outer: 140 }; // Desktop
    } else {
      return { inner: 80, outer: 140 }; // Large screens
    }
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setInnerRadius(30);
      } else if (window.innerWidth >= 640 && window.innerWidth <= 1024) {
        setInnerRadius(35);
      } else {
        setInnerRadius(50);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setOuterRadius(60); // Mobile size
      } else if (window.innerWidth >= 640 && window.innerWidth <= 1024) {
        setOuterRadius(55); // Tablet size
      } else if (window.innerWidth > 1024 && window.innerWidth < 1280) {
        setOuterRadius(70); // Default for medium to large screens
      } else {
        setOuterRadius(90); // XL size
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // if (!chartData || chartData.length === 0) {
  //   return <div>No data available</div>;
  // }
    const isFullscreen = useFullscreen();

  // Get current radii based on screen size and fullscreen state
  const currentRadii = isFullscreen ? getExpandedRadii() : { inner: innerRadius, outer: outerRadius };


  console.log(chartData, "chartData");

  return (
    <Card className="flex flex-wrap justify-between border-none w-full h-full">

      <HeaderRow
        visitEventOptions={visitEventOptions}
        handleTypeChange={handleTypeChange}
        selectedType={selectedType}
        title={title}
        onExpand={onExpand}
        handleExport={handleExport}
        isRadioButton={isRadioButton}
        isSelect={isSelect}
        onExport={onExport}
        selectoptions={selectoptions}
        placeholder={placeholder}

      />
      {isdonut && (
        <CardHeader className=" w-full  p-1 t-0">

          <CardTitle className="text-body  p-0 font-semibold">{DonutTitle}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={`h-full w-full relative p-0 ${isFullscreen ? 'h-[500px]' : 'h-[220px]'}`}>
        {isLoading ? (
          <DonutChartSkeleton height={isFullscreen ? '500px' : '220px'} />
        ) : chartData?.length > 0 ? (
          <div className="grid grid-cols-2">
            <div className="h-full w-full flex justify-center items-center">
              {chartConfig ? (
                <ChartContainer
                  config={chartConfig}
                  className="mt-0 flex lg:justify-center items-center w-full h-full"
                >
                  <ResponsiveContainer 
                    width="100%" 
                    height={isFullscreen ? 400 : 300}
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel isPercentage={isPercentage} />}
                      />
                      <Pie
                        data={chartData}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        innerRadius={currentRadii.inner}
                        outerRadius={currentRadii.outer}
                        strokeWidth={2}
                        fill="#8884d8"
                         onClick={(data) => onSegmentClick?.(data)}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill || chartConfig[entry.label || '']?.color}
                            style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
                          />
                        ))}
                        {isLabelist && (
                          <LabelList
                            dataKey={dataKey}
                            position="inside"
                            style={{
                              fontSize: '8px',
                              fill: '#fff',
                              fontWeight: 'bold'
                            }}
                            stroke="none"
                            formatter={(value: number) => `${value}%`}
                          />
                        )}
                         {istotalvistors && totalV && (
                        <Label
                          content={({ viewBox }) => {
                            const displayedVisitors = totalV || 0;
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              if (displayedVisitors > 0) {
                                return (
                                  <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                  >
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      className="fill-foreground lg:text-2xl md:text-text-body font-bold sm:text-body"
                                      style={{ fontSize: isFullscreen ? '24px' : '15px' }}
                                    >
                                      {formatNumber(displayedVisitors.toFixed(0))}
                                    </tspan>
                                  </text>
                                );
                              }
                              return null;
                            }
                            return null;
                          }}
                        />
                      )}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-body">No chart configuration available</span>
                </div>
              )}
            </div>

            {/* Legend Container */}{chartData.length > 0 && (
               <div className={`flex flex-col justify-start sm:col-span-1 md:col-span-1 lg:col-span-1 sm:text-body border-none ${marginTop} ${isFullscreen ? 'h-full overflow-visible' : 'h-[230px] overflow-y-auto scrollbar'} w-full`}>
                 <div className={`flex ${direction} md:${direction} sm:${direction} lg:flex-col xl:flex-col mt-6 ${position} ${isFullscreen ? 'mt-8 gap-4' : ''}`}>
                   {chartData?.map((item) => (
                     <div key={item.label} className={`flex items-center gap-2 p-2 text-sub-header ${isFullscreen ? 'p-3 text-lg' : ''}`}>
                      <span
                        className={`inline-block rounded-full border-r ${isFullscreen ? 'w-4 h-4 p-1' : 'w-3 h-3 p-0.5'}`}
                        style={{ backgroundColor: item?.fill || chartConfig?.[item.label || '']?.color }}
                      />
                       <p className={`${isFullscreen ? 'text-base' : 'text-xs'}`}>
                         {String(item?.label).charAt(0).toUpperCase() + String(item?.label).slice(1)}
                        {isPercentageValue ? (
                          <span>
                            :{" "}
                            {formatVisitors(Number(item?.visit))}
                            {item?.percentage ? ` (${item?.percentage})` : ""}
                          </span>
                        ) : (
                          <span>
                            : {formatVisitors(Number(item?.visit))}
                          </span>
                        )}
                       </p>
                     </div>
                   ))}
                 </div>
               </div>
             )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-small-font">No Data Found!</span>
            </div>
          )}
        </CardContent>
       
      </Card>
    );
  };

  export default DonutChart;