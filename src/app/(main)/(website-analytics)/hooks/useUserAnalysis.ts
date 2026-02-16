import { useApi } from "@/lib/api_base";
import Endpoint from "@/common/endpoint";

const baseApiUrl = `${process.env.NEXT_PUBLIC_WEB_DEV_API}`;


export const useUserIntent = (
    payload: any,
    enabled: boolean = false
) => {
    return useApi<any>(
        `${baseApiUrl}${Endpoint.WEBSITE_ANALYTICS.USER_ANALYSIS.GET_USER_INTENT}`,
        "GET",
        payload,
        {
            queryKey: ["user-intent", JSON.stringify(payload)],
            enabled: enabled,
        }
    );
};

export const useEngangementSessions = (
    payload: any,
    enabled: boolean = false
) => {
    return useApi<any>(
        `${baseApiUrl}${Endpoint.WEBSITE_ANALYTICS.USER_ANALYSIS.GET_ENGAGEMENT_SESSIONS}`,
        "GET",
        payload,
        {
            queryKey: ["engagement-sessions", payload],
            enabled: enabled,
        }
    );
};