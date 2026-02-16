"use client"

import { TrendingUp, Loader2 } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import HeaderRow from "@/components/mf/HeaderRow"

export const description = "An area chart with gradient fill"
interface chartData {
  label?: string;
  [key: string]: string | number | undefined;
}

interface chartconfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface AreagradientChart {
  chartData?: chartData[];
  chartConfig?: chartconfig;
  XaxisLine?: boolean;
  Xdatakey?: string;
  CartesianGridVertical?: boolean;
  isSelect?: boolean;
  isRadioButton?: boolean;
  title?: string;
  handleExport?: () => void;
  onExpand: () => void;
  onExport?: (s: string, title: string, index: number) => void;
  handleFrequencyChange?: (value: string) => void;
  selectoptions?: string[];
  selecteedFrequency?: string;
  placeholder?: string;
  isLoading?: boolean;
}

const ChartAreaGradient: React.FC<AreagradientChart> = ({
  chartData ,

  chartConfig ,
  Xdatakey = "month",
  CartesianGridVertical = true,
  XaxisLine = true,
  isSelect,
  isRadioButton,
  title,
  onExpand,
  handleExport,
  handleFrequencyChange,
  onExport,
  placeholder,
  selectoptions,
  selecteedFrequency,
  isLoading = false,
}) => {
  const maxVisiblePoints = 7;
  const barWidth = 100;
  const chartWidth = chartData && chartData.length > maxVisiblePoints
    ? chartData.length * barWidth
    : undefined;

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
                <span className="text-xs font-medium whitespace-nowrap ">{labelText}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-none h-full">
      <HeaderRow
        title={title}
        onExpand={onExpand}
        handleExport={handleExport}
        isRadioButton={isRadioButton}
        isSelect={isSelect}
        onExport={onExport}
        selectoptions={selectoptions}
        handleFrequencyChange={handleFrequencyChange}
        selectedFrequency={selecteedFrequency}
        placeholder={placeholder || ""}
      />
      <CardContent className="h-[calc(100%-48px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              
            </div>
          </div>
        ) : !chartData || chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
            <span className="text-small-font font-medium">
                        No Data Found!
                      </span>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig || {}}>
            <div>
              <div className="w-full overflow-x-auto">
                <div style={{ 
                  minWidth: chartWidth ? `${chartWidth}px` : '800px',
                  width: chartData && chartData.length <= 7 ? '100%' : undefined,
                  
                }}
                >
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 40,
                      left: 20,
                      bottom: 20,
                    }}
                    height={280}
                    width={chartWidth || 800}
                  >
                    <CartesianGrid vertical={CartesianGridVertical} strokeDasharray="3 3" />
                    <XAxis
                      dataKey={Xdatakey}
                      tickLine={false}
                      axisLine={XaxisLine}
                      tickMargin={8}
                      height={60}
                      interval={0}
                      angle={0}
                      textAnchor="end"
                      style={{ fontSize: '12px' }}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const value = payload.value;
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text
                              x={0}
                              y={0}
                              dy={16}
                              textAnchor="middle"
                              fill="#666"
                              style={{ 
                                fontSize: '12px',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                maxWidth: '100px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {typeof value === 'string' && value.length > 10 
                                ? `${value.slice(0, 8)}...` 
                                : value}
                            </text>
                          </g>
                        );
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={true}
                      tickMargin={8}
                      tickCount={5}
                      style={{ fontSize: '12px' }}
                      domain={[0, 'dataMax + 100']}
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                        } else if (value >= 1000) {
                          return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
                        }
                        return value.toString();
                      }}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

                    <defs>
                      {chartConfig && Object.entries(chartConfig).map(([key, config]) => (
                        <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={config.color}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={config.color}
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      ))}
                    </defs>

                    {chartConfig && Object.entries(chartConfig).map(([key, config]) => (
                      <Area
                        key={key}
                        dataKey={key}
                        type="monotone"
                        fill={`url(#fill${key})`}
                        fillOpacity={0.7}
                        stroke={config.color}
                        stackId="a"
                      />
                    ))}
                  </AreaChart>
                </div>
              </div>
              <div className="w-full mt-4">
                <CustomLegendContent />
              </div>
            </div>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default ChartAreaGradient;
 