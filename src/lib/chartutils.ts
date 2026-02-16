export interface FraudDataVisits {
    fraud_sub_category: string;
    total_count: number;
    percentage:string;
  
  }
  
  export interface ColorConfi {
    [key: string]: {
      label: string;
      color: string;
    };
  }
  
  export interface ChartConfi {
    [key: string]: {
      label: string;
      color: string;
    };
  }
  
  export interface ChartData {
    label: string;
    visit: number;
    percentage:string;
    fill: string;
  }
  
  
  export const generateChartConfig = (
    existingData: FraudDataVisits[],
    colorConfig: ColorConfi
  ): { chartData: ChartData[]; chartConfig: ChartConfi } => {
    // Ensure existingData is an array
    const dataArray = Array.isArray(existingData) ? existingData : [];

    const chartData = dataArray.map((item) => ({
      label: item.fraud_sub_category,
      visit: item.total_count,
      percentage: item.percentage,
      fill: colorConfig[item.fraud_sub_category.replace(/\s+/g, '')]?.color || "#000000",
    }));

    // Create chartConfig
    const chartConfig: ChartConfi = {};
    Object.entries(colorConfig).forEach(([key, value]) => {
      chartConfig[key] = {
        label: value.label,
        color: value.color,
      };
    });

    return { chartData, chartConfig };
  };
  
