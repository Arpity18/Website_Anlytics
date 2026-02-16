"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import HeaderRow from "@/components/mf/HeaderRow";
import { Loader2 } from "lucide-react";

interface ProgressBarChart1Item {
  label: string;
  visit: number;
  percentage: string; // e.g. "82.48%"
  fill: string; // color or gradient
}

interface ProgressBarChart1Props {
  chartData: ProgressBarChart1Item[];
  title?: string;
  onExpand?: () => void;
  onExport?: (format: string, title: string, key: string) => void;
  handleExport?: () => void;
  isLoading?: boolean;
}

export default function ProgressBarCahrt1({
  chartData,
  title,
  onExpand,
  onExport,
  handleExport,
  isLoading,
}: ProgressBarChart1Props) {
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  useEffect(() => {
    // Return early if no chart data or if it's not an array
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
      setAnimatedValues({});
      return;
    }

    // Initialize with 0 values
    const initialValues: { [key: string]: number } = {};
    chartData.forEach((item) => {
      initialValues[item.label] = 0;
    });
    setAnimatedValues(initialValues);

    // Animate to actual values with staggered timing
    chartData.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedValues((prev) => {
          // Add safety check for percentage value
          const percentageValue = item.percentage && typeof item.percentage === 'string' 
            ? parseFloat(item.percentage.replace("%", "")) 
            : 0;
          
          return {
            ...prev,
            [item.label]: percentageValue,
          };
        });
      }, 300 + index * 150);
    });
  }, [chartData]);

  return (
    <Card className="border-none h-full">
      <HeaderRow 
        title={title} 
        onExpand={onExpand} 
        onExport={onExport} 
        handleExport={handleExport}
      />
      <CardContent className="h-[calc(100%-48px)] overflow-y-auto scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !chartData || !Array.isArray(chartData) || chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              
              <span className="text-small-font font-medium">
                        No Data Found!
                      </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {chartData.map((item) => {
              const currentValue = animatedValues[item.label] || 0;
              const isHovered = hoveredLabel === item.label;
              const gradient = item.fill || "linear-gradient(135deg, #a855f7 0%, #c026d3 100%)";
              const color = item.fill || "#a855f7";
              const glowColor = item.fill || "#a855f7";

              return (
                <div
                  key={item.label}
                  onMouseEnter={() => setHoveredLabel(item.label)}
                  onMouseLeave={() => setHoveredLabel(null)}
                >
                  {/* Name section */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm  text-gray-800 group-hover:text-gray-900 transition-colors dark:text-white">
                        {item.label}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 ">
                      <span className="text-sm font-medium text-gray-600 dark:text-white">
                      {new Intl.NumberFormat('en-US').format(item.visit)}
                        </span>
                      <span className="text-sm font-medium text-gray-400 dark:text-white">•</span>
                      <span className="text-sm font-medium text-gray-600 dark:text-white">{currentValue.toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* 3D Progress bar container */}
                  <div className="relative perspective-1000">
                    <div
                      className={`h-3 bg-gray-100 rounded-full transition-all duration-500 transform ${
                        isHovered ? "rotateX-5 scale-y-110" : ""
                      }`}
                      style={{
                        boxShadow: isHovered
                          ? "inset 0 2px 4px rgba(0,0,0,0.15), 0 4px 15px rgba(0,0,0,0.1)"
                          : "inset 0 2px 4px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      {/* 3D Filled portion with unified gradient */}
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                          isHovered ? "shadow-2xl" : "shadow-lg"
                        }`}
                        style={{
                          width: `${currentValue}%`,
                          background: gradient,
                          boxShadow: isHovered
                            ? `0 0 25px ${glowColor}60, 0 6px 20px ${glowColor}40, inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2)`
                            : `0 0 15px ${glowColor}40, 0 4px 12px ${glowColor}30, inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)`,
                        }}
                      >
                        {/* Animated shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer" />

                        {/* Top highlight for 3D effect */}
                        <div
                          className="absolute top-0 left-0 right-0 h-1 rounded-t-full"
                          style={{
                            background: "linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))",
                          }}
                        />

                        {/* Bottom shadow for depth */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-full"
                          style={{
                            background: "linear-gradient(90deg, rgba(0,0,0,0.2), rgba(0,0,0,0.1))",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}