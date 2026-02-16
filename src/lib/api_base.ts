"use client";

import { useEffect, useMemo, useState } from "react";
import {
  QueryObserverResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const handleUnauthorized = () => {
  // Handle unauthorized access
  // You can add redirect logic here if needed
};

export interface UseApiOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  gcTime?: number;
  queryKey?: string[];
  headers?: Record<string, string>;
  refetchOnMount?: boolean | "always";
  refetchInterval?: number;
}

/**
 * Generic API hook using React Query
 */
export const useApi = <T = any>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  payload?: any,
  options?: UseApiOptions,
) => {
  const [isMounted, setIsMounted] = useState(false);
  const [token, setToken] = useState<string>("");
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsMounted(true);
    const storedToken = localStorage.getItem("IDToken") || "";
    setToken(storedToken);
  }, []);

  // Include payload in queryKey if not provided, so React Query refetches when payload changes
  // Use useMemo to ensure queryKey is stable but updates when payload changes
  const queryKey = useMemo(() => {
    if (options?.queryKey) {
      return options.queryKey;
    }
    // Include payload in queryKey so React Query knows to refetch when it changes
    return [url, method, payload ? JSON.stringify(payload) : null];
  }, [url, method, payload, options?.queryKey]);

  const query = useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const controller = new AbortController();

      let finalUrl = url;

      // Extract payload from queryKey to ensure we use the latest value
      // The queryKey includes the serialized payload, so we use the payload parameter
      // which will be the current value when the query runs
      const currentPayload = payload;

      const config: RequestInit = {
        method,
        headers: {
          // "Content-Type": "application/json",
          ...(token && { Authorization: token }),
          ...options?.headers,
        },
        signal: controller.signal,
      };

      if (method === "GET" && currentPayload) {
        const queryParams = new URLSearchParams();
        Object.entries(currentPayload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
        finalUrl = `${url}?${queryParams.toString()}`;
      } else if (method !== "GET" && currentPayload) {
        config.body = JSON.stringify(currentPayload);
      }

      const response = await fetch(finalUrl, config);

      if (!response.ok) {
        if (response.status === 401) handleUnauthorized();

        // Try to extract error message from response body
        let errorMessage = `HTTP ${response.status} - ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.log("API Error Response:", errorData);

          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === "string") {
            errorMessage = errorData;
          }

          // Throw the error with the extracted message
          throw new Error(errorMessage);
        } catch (parseError) {
          console.log("Failed to parse error response:", parseError);
          console.log("Response status:", response.status);
          console.log("Response statusText:", response.statusText);
          // If it's our own error (with the message), re-throw it
          if (
            parseError instanceof Error &&
            parseError.message !== "Failed to parse error response"
          ) {
            throw parseError;
          }

          // Try to get response as text if JSON parsing fails
          try {
            const responseText = await response.text();
            console.log("Response text:", responseText);
            if (responseText) {
              throw new Error(responseText);
            }
          } catch (textError) {
            console.log("Failed to get response as text:", textError);
          }

          // Final fallback
          throw new Error(errorMessage);
        }
      }

      return response.json();
    },
    enabled:
      options?.enabled !== false && isMounted && (method === "GET" ? true : !!token),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 min default
    gcTime: options?.gcTime ?? options?.cacheTime ?? 10 * 60 * 1000, // 10 min default
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchInterval: options?.refetchInterval,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("401")) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }) as QueryObserverResult<T, Error>;

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  return { ...query, invalidate };
};