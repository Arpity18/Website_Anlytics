
"use client"

import type React from "react"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Label, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import HeaderRow from "../HeaderRow"
import { Card, CardContent } from "@/components/ui/card"
import { InformationCard } from "../InformationCard"
import { Loader2 } from "lucide-react"

interface ChartBarStackedProps {
  handleExport?: () => void
  onExpand: () => void
  onExport?: (format: string, title: string, key: string) => void
  visitEventOptions?: { value: string; label: string }[]
  handleTypeChange?: (value: string) => void
  selectedType?: string
  title?: string
  isSelect?: boolean
  isRadioButton?: boolean
  heading?: string
  isInformCard?: boolean
  layoutDirection?: string
  isLegend?: boolean
  ischangeLegend?: boolean
  placeholder?: string
  isLoading?: boolean
  selectoptions?: string[]
  selectedFrequency?: string
  handleFrequencyChange?: (value: string) => void
  isCartesian?: boolean
  isPercentage?: boolean
  //sub_heading?:string
  InformCard?: { title: string; desc: string }[]
  chartData?: {
    label: string
    [key: string]: string | number
  }[]
  chartConfig?: {
    [key: string]: {
      label: string
      color: string
    }
  }
  xAxis?: {
    dataKey: string
    title: string
    tickFormatter?: (value: string | number) => string
    isPercentage?: boolean // Add this to control percentage display
  }
  yAxis?: {
    dataKey: string
    title?: string
    tickFormatter?: (value: string) => string
  }
  isHorizontal?: boolean
  AxisLabel?: string
  showMenu?: boolean
}

const ChartBarStacked: React.FC<ChartBarStackedProps> = ({
  heading = "heading",
  //sub_heading,
  handleTypeChange,
  visitEventOptions,
  isCartesian,
  selectedType,
  handleExport,
  onExport,
  selectoptions = [],
  onExpand,
  handleFrequencyChange,
  title,
  isSelect = false,
  isRadioButton = false,
  chartData = [],
  chartConfig,
  xAxis,
  yAxis,
  isPercentage = false,
  selectedFrequency,
  placeholder,
  isHorizontal,
  AxisLabel = "Value",
  InformCard = [],
  isInformCard = false,
  layoutDirection = "flex-col",
  isLegend = true,
  ischangeLegend = false,
  isLoading,
  showMenu = true,
}) => {
  const chartHeight = chartData.length > 0 ? (isHorizontal ? Math.min(chartData.length * 20, 500) : 400) : 300

  // Custom X-axis tick component for tooltip on hover
  const CustomXAxisTick = ({
    x,
    y,
    payload,
  }: {
    x: number
    y: number
    payload: { value: string }
  }) => {
    const fullValue = payload.value
    const displayValue = fullValue.length > 8 ? `${fullValue.slice(0, 6)}...` : fullValue

    return (
      <g transform={`translate(${x},${y})`}>
        <title>{fullValue}</title>
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
          {displayValue}
        </text>
      </g>
    )
  }

  const CustomTick = ({
    x,
    y,
    payload,
    chartConfig,
  }: {
    x: number
    y: number
    payload: { value: string | number }
    chartConfig: { [key: string]: { label: string; color: string } }
  }) => {
    // Function to format numbers
    const formatTickValue = (value: number) => {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
      } else if (value >= 1000) {
        return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k"
      }
      return value.toString()
    }

    // Determine if the value is a number or string and format accordingly
    let displayValue: string
    let fullValue: string = payload.value.toString()

    if (typeof payload.value === "number") {
      // For numeric values (Y-axis), apply number formatting
      displayValue = formatTickValue(payload.value)
      fullValue = payload.value.toString()
    } else {
      // For string values, check if it can be converted to a number
      const numericValue = Number.parseFloat(payload.value as string)
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        // If it's a numeric string, format it as a number
        displayValue = formatTickValue(numericValue)
        fullValue = payload.value as string
      } else {
        // For non-numeric strings (like publisher names), truncate if needed
        fullValue = payload.value as string
        displayValue =
          (payload.value as string).length > 12
            ? `${(payload.value as string).slice(0, 10)}...`
            : (payload.value as string)
      }
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <title>{fullValue}</title>
        <text
          x={0}
          y={0}
          dy={4}
          textAnchor="end"
          fontSize={12}
          className="cursor-pointer"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "80px",
          }}
        >
          {displayValue}
        </text>
      </g>
    )
  }

  // const CustomLegendContent = () => {
  //   const labels = Object.values(chartConfig || {}).map((config) => config.label)
  //   const colors = Object.values(chartConfig || {}).map((config) => config.color)

  //   return (
  //     <div className="flex space-x-4 justify-center ">
  //       {labels.map((labelText: string, index) => (
  //         <div className="flex items-center space-x-2 " key={index}>
  //           <span style={{ backgroundColor: colors[index] }} className="w-4 h-4 rounded-full"></span>
  //           <span className="text-xs">{labelText}</span>
  //         </div>
  //       ))}
  //     </div>
  //   )
  // }
 const CustomLegendContent = () => {
    const labels = Object.values(chartConfig || {}).map((config) => config.label)
    const colors = Object.values(chartConfig || {}).map((config) => config.color)

    return (
      <div className="w-full px-4">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="flex gap-4 min-w-max py-2 justify-center">
            {labels.map((labelText: string, index) => (
              <div className="flex items-center gap-2 flex-shrink-0" key={index}>
                <span style={{ backgroundColor: colors[index] }} className="w-3 h-3 rounded-full flex-shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">{labelText}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Number formatting function
  const formatTickValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k"
    }
    return value.toString()
  }

  return (
    <Card className="border-none" roundedBottomOnly={true}>
      <HeaderRow
        visitEventOptions={visitEventOptions}
        handleTypeChange={handleTypeChange}
        selectoptions={selectoptions}
        selectedType={selectedType}
        title={title}
        handleFrequencyChange={handleFrequencyChange}
        selectedFrequency={selectedFrequency}
        onExpand={onExpand}
        handleExport={handleExport}
        isRadioButton={isRadioButton}
        isSelect={isSelect}
        onExport={onExport}
        heading={heading}
        placeholder={placeholder}
        showMenu={showMenu}
      />

      {isInformCard && (
        <div className="flex-1 px-4 flex flex-row">
          {InformCard?.map((item, index) => (
            <InformationCard key={index} InformTitle={item.title} informDescription={item.desc} />
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-[300px] sm:h-[300px] lg:h-[400px]">
          <Loader2 className=" h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <CardContent className={`w-full ${isLegend ? "h-[350px]" : "h-[300px]"} scrollbar p-0`}>
          {chartData.length > 0 ? (
            <div className="flex flex-col w-full ">
              {/* Chart Container */}
              <div className="flex flex-col w-full ">
                <ChartContainer config={chartConfig || {}} style={{ height: "280px", width: "100%" }}>
                  <div className="">
                    <div className="w-full">
                      <div className="overflow-x-auto">
                        <div style={{ minWidth: Math.max(chartData.length * 80, 600) }}>
                          <ResponsiveContainer height={270} width="100%">
                            <BarChart
                              data={chartData}
                              layout={isHorizontal ? "horizontal" : "vertical"}
                              margin={{ left: 20, right: 40, top: 10, bottom: 20 }}
                              barSize={40}
                              barGap={15}
                              barCategoryGap={40}
                              height={chartHeight}
                            >
                              {isCartesian && (
                                <CartesianGrid
                                  strokeDasharray="2 2"
                                  stroke="#555"
                                  strokeWidth={0.5}
                                  horizontal={isHorizontal}
                                  vertical={!isHorizontal}
                                />
                              )}
                              <XAxis
                                className="text-small-font"
                                dataKey={isHorizontal ? yAxis?.dataKey : "label"}
                                type={isHorizontal ? "category" : "category"}
                                tickLine={false}
                                axisLine={true}
                                interval={0}
                                angle={0}
                                textAnchor="middle"
                                height={60}
                                minTickGap={5}
                                tickMargin={10}
                                tick={(props) => <CustomXAxisTick {...props} />}
                              >
                                {isHorizontal && (
                                  <Label
                                    style={{ fontSize: "12px" }}
                                    value={yAxis?.title || ""}
                                    offset={-20}
                                    position="insideBottom"
                                  />
                                )}
                              </XAxis>

                              {yAxis && (
                                <YAxis
                                  className="text-body"
                                  dataKey={isHorizontal ? undefined : yAxis.dataKey}
                                  type={isHorizontal ? "number" : "number"}
                                  tickLine={false}
                                  axisLine={true}
                                  tickFormatter={
                                    isHorizontal
                                      ? (value: number) => {
                                          if (isPercentage) {
                                            return `${(value * 1).toFixed(0)}%`
                                          }
                                          return formatTickValue(value)
                                        }
                                      : (value: string | number) => {
                                          // For vertical charts, if the value is a number, format it
                                          if (typeof value === "number") {
                                            return formatTickValue(value)
                                          }
                                          // For string values (publisher names), truncate if needed
                                          return value.length > 15 ? value.substring(0, 12) + "..." : value
                                        }
                                  }
                                  width={isHorizontal ? 60 : 120}
                                  tickMargin={12}
                                  interval={0}
                                  height={isHorizontal ? 80 : 500}
                                  tick={(props) => <CustomTick {...props} chartConfig={chartConfig || {}} />}
                                >
                                  {!isHorizontal && (
                                    <Label
                                      style={{ fontSize: "12px" }}
                                      value={yAxis.title}
                                      angle={-90}
                                      position="left"
                                      offset={-10}
                                    />
                                  )}
                                </YAxis>
                              )}

                              <ChartTooltip content={<ChartTooltipContent isPercentage={isPercentage} />} />

                              {/* Chart Bars */}
                              {chartConfig &&
                                Object.keys(chartConfig).map((key) => (
                                  <Bar key={key} dataKey={key} stackId="a" fill={chartConfig[key].color} />
                                ))}
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </ChartContainer>
              </div>

              {isLegend && (
                <div className="w-full mt-5">
                  <CustomLegendContent />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[350px]">
              <span className="text-small-font">No Data Found!</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default ChartBarStacked
