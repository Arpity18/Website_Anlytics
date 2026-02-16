import { useApi } from "@/lib/api_base";
import Endpoint from "@/common/endpoint";

const baseApiUrl = `${process.env.NEXT_PUBLIC_WEB_DEV_API}`;



export const useSummaryStats = (
    payload: any,
    enabled: boolean = false
) => {
    return useApi<any>(
        `${baseApiUrl}${Endpoint.WEBSITE_ANALYTICS.SUMMARY.GET_SUMMARY_STATS}`,
        "GET",
        payload,
        {
            queryKey: ["summary-stats", JSON.stringify(payload)],
            enabled: enabled,
        }
    );
};

export const useVisitorsStats = (
  payload: any,
  enabled: boolean = false
) => {
  return useApi<any>(
    `${baseApiUrl}${Endpoint.WEBSITE_ANALYTICS.SUMMARY.GET_VISITORS_STATS}`,
    "GET",
    payload,
    {
      queryKey: ["visitors-stats", JSON.stringify(payload)],
      enabled: enabled,
    }
  );
};


export const usePageViewsStats = (
    payload: any,
    enabled: boolean = false
  ) => {
    return useApi<any>(
      `${baseApiUrl}${Endpoint.WEBSITE_ANALYTICS.SUMMARY.GET_PAGE_VIEWS_STATS}`,
      "GET",
      payload,
      {
        queryKey: ["page-views-stats", JSON.stringify(payload)],
        enabled: enabled,
      }
    );
  };


export const useTopPages =(
    payload: any,
    enabled: boolean = false
) => {
    return useApi<any>(
        `${baseApiUrl}${Endpoint.WEBSITE_ANALYTICS.SUMMARY.GET_TOP_PAGES}`,
        "GET",
        payload,
        {
            queryKey: ["top-pages", JSON.stringify(payload)],
            enabled: enabled,
        }
    );
};


export const useTrafficSources = (
  payload: any,
  enabled: boolean = false
) => {
  return useApi<any>(
    `${baseApiUrl}${Endpoint.WEBSITE_ANALYTICS.SUMMARY.GET_TRAFFIC_SOURCES}`,
    "GET",
    payload,
    {
      queryKey: ["traffic-sources", JSON.stringify(payload)],
      enabled: enabled,
    }
  );
};

export const useDeviceBreakdown = (
    payload: any,
    enabled: boolean = false
  ) => {
    return useApi<any>(
      `${baseApiUrl}${Endpoint.WEBSITE_ANALYTICS.SUMMARY.GET_DEVICE_BREAKDOWN}`,
      "GET",
      payload,
      {
        queryKey: ["device-breakdown", JSON.stringify(payload)],
        enabled: enabled,
      }
    );
  };

export const useDeadLinks = (
    payload: any,
    enabled: boolean = false
  ) => {
    return useApi<any>(
      `${baseApiUrl}${Endpoint.WEBSITE_ANALYTICS.SUMMARY.GET_DEAD_LINKS}`,
      "GET",
      payload,
      {
        queryKey: ["dead-links", JSON.stringify(payload)],
        enabled: enabled,
      }
    );
  };