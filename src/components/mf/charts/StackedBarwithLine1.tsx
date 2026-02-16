
"use client"

import type * as React from "react"
import { useMemo, useState } from "react"
import { Bar, CartesianGrid, XAxis, YAxis, Line, ComposedChart, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getXAxisAngle, formatNumber } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface TrafficTrendData {
  label?: string
  clean_count?: number
  fraud_count?: number
  fraud_percentage?: string | number
  visit?: number
  price?: number | string
}

interface StackBarLineProps {
  chartData?: TrafficTrendData[]
  chartConfig?: {
    [key: string]: {
      label: string
      color: string
    }
  }
  onExport?: (s: string, title: string, index: number) => void
  onExpand: () => void
  title?: string
  isLoading?: boolean
  isLegend?: boolean
  rightAxisType?: "percentage" | "price" | "number" // New prop to control right Y-axis format
  height?: number // New prop to control chart height
}

// Custom tick component with tooltip
const CustomXAxisTick = ({ x, y, payload, angle }: any) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const originalLabel = payload.value
  const isLabelTruncated = originalLabel && originalLabel.length > 11
  const displayLabel = isLabelTruncated ? originalLabel.substring(0, 3) + "..." : originalLabel

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (isLabelTruncated) {
      setTooltipPosition({ x: event.clientX, y: event.clientY })
      setShowTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  return (
   <g transform={`translate(${x},${y})`} pointerEvents="all">
      <title>{originalLabel}</title>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fontSize={12}
        className="cursor-pointer"
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {displayLabel}
      </text>
    </g>
  )
}

const StackedBarWithLine1: React.FC<StackBarLineProps> = ({
  chartData = [],
  chartConfig = {},
  onExport,
  onExpand,
  title,
  isLoading,
  isLegend = true,
  rightAxisType = "percentage", // Default to percentage for backward compatibility
  height = 180, // Default height
}) => {
  const maxVisiblePoints = 7
  const barWidth = 80

  // 🔄 Convert fraud_percentage string to number and parse price strings
  const cleanedChartData = useMemo(() => {
    return chartData.map((item) => {
      const processedItem = {
        ...item,
        fraud_percentage:
          typeof item.fraud_percentage === "string" ? Number.parseFloat(item.fraud_percentage) : item.fraud_percentage,
      }
      
      // Parse price string if it exists (handles formats like "₹211", "$123", etc.)
      if (typeof item.price === "string") {
        // Remove currency symbols and convert to number
        const priceString = item.price.replace(/[₹$€£¥,]/g, '')
        processedItem.price = Number.parseFloat(priceString) || 0
      }
      
      return processedItem
    })
  }, [chartData])

  const chartWidth = chartData.length > maxVisiblePoints ? chartData.length * barWidth : undefined

  const labels = Object.values(chartConfig).map((item) => item.label)
  const colors = Object.values(chartConfig).map((item) => item.color)
  const months = cleanedChartData?.map((item) => item.label).filter(Boolean) || []
  const xAxisAngle = getXAxisAngle(months)

  // Determine which key should be used for the line (right Y-axis)
  const getLineKey = () => {
    if (rightAxisType === "price" && chartConfig.price) {
      return "price"
    }
    if (rightAxisType === "percentage" && chartConfig.fraud_percentage) {
      return "fraud_percentage"
    }
    // Fallback: find any key that's not used for bars
    const barKeys = Object.keys(chartConfig).filter(key => key !== "fraud_percentage" && key !== "price")
    const lineKeys = Object.keys(chartConfig).filter(key => !barKeys.includes(key))
    return lineKeys[0] || "fraud_percentage"
  }

  const lineKey = getLineKey()

  // Right Y-axis tick formatter based on type
  const getRightAxisTickFormatter = (value: number) => {
    switch (rightAxisType) {
      case "price":
        return `₹${formatNumber(value)}` // Use Indian Rupee symbol
      case "percentage":
        return `${Number.parseFloat(value.toString()).toFixed(2)}%`
      case "number":
        return formatNumber(value)
      default:
        return `${Number.parseFloat(value.toString()).toFixed(2)}%`
    }
  }

  const CustomLegendContent = ({
    labels,
    colors,
  }: {
    labels: string[]
    colors: string[]
  }) => {
    return (
      <div className="flex space-x-4 justify-center">
        {labels.map((labelText: string, index) => (
          <div className="flex items-center space-x-2" key={index}>
            <span style={{ backgroundColor: colors[index] }} className="w-4 h-4 rounded-full"></span>
            <span>{labelText}</span>
          </div>
        ))}
      </div>
    )
  }

  console.log(chartConfig, chartData, "iiiiiiiiiiiiii")

  return (
    <Card className="border-none w-full p-0" roundedBottomOnly={true}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-[210px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <CardContent className="sm:w-full p-0">
          <ChartContainer config={chartConfig} className="relative h-[210px] sm:w-full lg:w-full p-0">
            <div className="overflow-x-auto">
              <div
                style={{
                  height: height,
                  ...(chartWidth ? { minWidth: `${chartWidth}px` } : { width: "100%" }),
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  {cleanedChartData.length > 0 ? (
                    <ComposedChart
                      data={cleanedChartData}
                      margin={{ top: 30, right: 2, left: 2, bottom: 20 }}
                      barGap={20}
                    >
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                      <CartesianGrid vertical={false} />

                      <XAxis
                        dataKey="label"
                        angle={xAxisAngle}
                        interval={0}
                        tickLine
                        tickMargin={10}
                        axisLine
                        dy={10}
                        textAnchor="middle"
                        tick={<CustomXAxisTick angle={xAxisAngle} />}
                      />

                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="hsl(var(--chart-1))"
                        tickFormatter={(value: number) => formatNumber(value)}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="hsl(var(--chart-3))"
                        tickFormatter={getRightAxisTickFormatter}
                      />

                      {Object.keys(chartConfig).map((key, index) => {
                        if (key !== lineKey) {
                          return (
                            <Bar
                              key={index}
                              dataKey={key}
                              stackId="a"
                              fill={chartConfig[key].color}
                              radius={index % 2 === 0 ? [0, 0, 4, 4] : [4, 4, 0, 0]}
                              yAxisId="left"
                              barSize={60}
                            />
                          )
                        }

                        return (
                          <Line
                            key={index}
                            type="monotone"
                            dataKey={key}
                            stroke={chartConfig[key].color}
                            strokeWidth={2}
                            dot={{
                              fill: chartConfig[key].color,
                              r: 1,
                            }}
                            yAxisId="right"
                          />
                        )
                      })}
                    </ComposedChart>
                  ) : (
                    <div className="flex items-center justify-center h-full w-full">
                      <span className="text-small-font font-medium">No Data Found!</span>
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {cleanedChartData.length > 0 && isLegend && (
              <div className="w-full mt-5">
                <CustomLegendContent labels={labels} colors={colors} />
              </div>
            )}
          </ChartContainer>
        </CardContent>
      )}
    </Card>
  )
}

export default StackedBarWithLine1
