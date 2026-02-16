
"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { formatValue, getXAxisAngle } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import HeaderRow from "../HeaderRow";
import { InformationCard } from "../InformationCard";
import { AreaChartSkeleton, LineChartSkeleton } from "./ChartSkeletons";

interface DoubleLineProps {
  chartData?: {
    label: string;
    [key: string]: string | number;
  }[];
  chartConfig?: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
  InformCard?: { title: string; desc: string }[];
  isInformCard?: boolean;
  handleExport?: () => void;
  onExpand: () => void;
  onExport?: (s: string, title: string, key: string) => void;
  title?: string;
  isSelect?: boolean;
  isRadioButton?: boolean;
  LinechartTitle?: string;
  AxisLabel?: string;
  isLoading: boolean;
  selectoptions?: string[];
  selectedFrequency?: string;
  placeholder?: string;
  isPercentage?: boolean;
  handleFrequencyChange?: (value: string) => void;
  showMenu?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  axisLine?: boolean;
}

const DoubleLineChart: React.FC<DoubleLineProps> = ({
  chartData = [],
  chartConfig = {},
  handleExport,
  onExport,
  onExpand,
  LinechartTitle,
  selectoptions,
  selectedFrequency,
  isPercentage,
  handleFrequencyChange,
  isLoading,
  placeholder,
  title,
  isSelect = false,
  isRadioButton = false,
  AxisLabel = "Value",
  InformCard = [],
  isInformCard = false,
  showMenu = true,
  xAxisLabel,
  yAxisLabel,
  axisLine = false,
}) => {
  const chartHeight = Math.min(chartData.length * 10, 400);
  const maxVisiblePoints = 7;
  const barWidth = 35;

  const chartWidth =
    chartData.length > maxVisiblePoints
      ? chartData.length * barWidth
      : undefined;

  const labels = chartData?.map((item) => item.label).filter(Boolean) || [];
  const xAxisAngle = getXAxisAngle(labels);

  const CustomTick = ({
    x,
    y,
    payload,
    chartConfig,
  }: {
    x: number;
    y: number;
    payload: { value: string };
    chartConfig: { [key: string]: { label: string; color: string } };
  }) => {
    const label = chartConfig[payload.value]?.label || payload.value;
    const displayLabel = label.length > 8 ? `${label.slice(0, 6)}...` : label;

    return (
      <g transform={`translate(${x},${y})`}>
        <title>{label}</title>
        <text
          x={0}
          y={0}
          dy={4}
          textAnchor="end"
          fontSize={8}
          className="truncate w-24"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "60px",
            cursor: "pointer",
          }}
        >
          {displayLabel}
        </text>
      </g>
    );
  };

  const CustomLegendContent = () => {
    const labels = Object.values(chartConfig).map((config) => config.label);
    const colors = Object.values(chartConfig).map((config) => config.color);

    return (
      <div className="flex space-x-4 justify-center pb-1">
        {labels.map((labelText: string, index) => (
          <div className="flex items-center space-x-2" key={index}>
            <span
              style={{ backgroundColor: colors[index] }}
              className="w-3 h-3 rounded-full"
            ></span>
            <span className="text-xs">{labelText}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-none relative">
      <HeaderRow
        title={title}
        onExpand={onExpand}
        handleExport={handleExport}
        isRadioButton={isRadioButton}
        isSelect={isSelect}
        handleFrequencyChange={handleFrequencyChange}
        selectoptions={selectoptions}
        selectedFrequency={selectedFrequency}
        onExport={onExport}
        placeholder={placeholder}
        showMenu={showMenu}
      />
      {isInformCard && (
        <div className="flex-1 px-4 flex flex-row ">
          {InformCard?.map((item, index) => (
            <InformationCard
              key={index}
              InformTitle={item.title}
              informDescription={item.desc}
            />
          ))}
        </div>
      )}
      <CardHeader className="items-center pt-0">
        <CardTitle className="text-body font-semibold">
          {LinechartTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <AreaChartSkeleton height="280px" />
        ) : (
          <div className="relative h-[300px] overflow-hidden">
            {/* Fixed Y-Axis Label */}
            {(yAxisLabel && chartData.length > 0) && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs font-medium text-gray-600 z-10 w-8 text-center">
                {yAxisLabel}
              </div>
            )}
            
            {/* Chart Container with Scroll */}
            <div className={`h-full w-full overflow-y-auto scrollbar p-0 pr-8 ${yAxisLabel ? 'ml-10' : ''} ${xAxisLabel ? 'pb-4' : ''}`}>
              <div className="overflow-x-auto">
                <ChartContainer
                  config={chartConfig}
                  style={{ height: "280px", width: "100%" }}
                >
                  {chartData.length > 0 ? (
                    <div
                      style={{
                        height: "280px",
                        ...(chartWidth
                          ? { minWidth: `${chartWidth}px` }
                          : { width: "100%" }),
                      }}
                    >
                      <ResponsiveContainer height={280} width="100%">
                        <LineChart
                          accessibilityLayer
                          data={chartData}
                          margin={{
                            left: 20,
                            right: 30,
                            top: 20,
                            bottom: 20,
                          }}
                          height={chartHeight}
                          barGap={10}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={axisLine}
                            interval={0}
                            tickMargin={20}
                            dy={8}
                            angle={xAxisAngle}
                            textAnchor="middle"
                            tickFormatter={(value) => {
                              return value.length > 3
                                ? value.slice(0, 3) + "..."
                                : value;
                            }}
                            className="text-body"
                            tick={(props) => (
                              <CustomTick {...props} chartConfig={chartConfig} />
                            )}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={axisLine}
                            tickMargin={15}
                            tickFormatter={(value) =>
                              formatValue(value as number, AxisLabel)
                            }
                            className="text-body"
                            style={{ fontSize: "9px" }}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                hideLabel
                                isPercentage={isPercentage}
                              />
                            }
                          />
                          {Object.keys(chartConfig).map((key, index) => {
                            return (
                              <Line
                                key={index}
                                dataKey={key}
                                type="linear"
                                stroke={chartConfig[key].color}
                                strokeWidth={2}
                                dot={{
                                  fill: chartConfig[key].color,
                                }}
                              >
                                <LabelList
                                  position="top"
                                  offset={8}
                                  className="fill-foreground"
                                  fontSize={7}
                                  formatter={(value: any) => isPercentage ? `${value}%` : value}
                                />
                              </Line>
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[280px]">
                      <span className="text-small-font">No Data Found.!</span>
                    </div>
                  )}
                </ChartContainer>
              </div>
            </div>
            
            {/* Fixed X-Axis Label */}
            {(xAxisLabel && chartData.length > 0) && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 z-10">
                {xAxisLabel}
              </div>
            )}
          </div>
        )}
        
        {/* Fixed Legend */}
        {
          chartData.length > 0 &&
          (
            <div className="w-full mt-6">
            <CustomLegendContent />
          </div>
          )
        }
         
      </CardContent>
    </Card>
  );
};

export default DoubleLineChart;
