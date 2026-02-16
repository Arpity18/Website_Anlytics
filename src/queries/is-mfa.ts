// "use client";
// import Endpoint from "@/common/endpoint";
// import { fetchData } from "@/services";
// import { useEffect, useState } from "react";
// import { useQuery } from "react-query";

// export function useIsMFA() {
//   const [Body, setBody] = useState({});
//   const url = process.env.NEXT_PUBLIC_AUTH_DOMAIN + Endpoint.IS_MFA;
//   useEffect(() => {
//     setBody({
//       access_token:
//         typeof window === "object" ? localStorage.getItem("AccessToken") : "",
//     });
//   }, []);
//   let t = true;
//   if (typeof window === "undefined") t = false;

//   return useQuery({
//     queryKey: [
//       "IS_MFA",
//       {
//         url,
//         method: "POST",
//         headers: {
//           Authorization:
//             "92a2119fb3329486dd39b97464d4fe5a4f8ba763fa884b8ba2d689b0b67c4175d9eff7232acd828ad24db7e5ddf7cae32ebf6eadab9e4d6c7cdeb1bbbc82c273",
//         },
//         data: Body,
//       },
//     ],
//     queryFn: fetchData,
//     enabled: t,
//     staleTime: Number.POSITIVE_INFINITY,
//     retry: 5,
//   });
// }






"use client";
import Endpoint from "@/common/endpoint";
import { useMutation, useQueryClient } from "react-query";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
 
export function useIsMFA() {
  const [accessToken, setAccessToken] = useState("");
  const [idToken, setIdToken] = useState("");
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.mfilterit.com/";
  const url = authDomain + Endpoint.IS_MFA;
  const hasTriggeredRef = useRef(false);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("AccessToken");
      const idTokenValue = localStorage.getItem("IDToken");
      setAccessToken(token || "");
      setIdToken(idTokenValue || "");
    }
  }, []);
  
  let t = true;
  if (typeof window === "undefined") t = false;
 
  const mutation = useMutation({
    mutationKey: ["IS_MFA"],
    mutationFn: async () => {
      const response = await axios.post(url, {
        access_token: accessToken,
      }, {
        headers: {
          Authorization: idToken,
          "Content-Type": "application/json",
           
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Cache the result
      queryClient.setQueryData(["IS_MFA"], data);
    },
    onError: (error) => {
      console.error("Is MFA API error:", error);
    },
  });
  
  // Check if we already have cached data
  const cachedData = queryClient.getQueryData(["IS_MFA"]);
  
  // Trigger the API call when conditions are met, but only once and only if no cached data
  useEffect(() => {
    if (t && accessToken && idToken && !hasTriggeredRef.current && !mutation.isLoading && !cachedData) {
      hasTriggeredRef.current = true;
      mutation.mutate();
    }
  }, [t, accessToken, idToken, mutation.isLoading, cachedData]);
  
  // Reset the trigger flag when conditions change
  useEffect(() => {
    if (!t || !accessToken || !idToken) {
      hasTriggeredRef.current = false;
    }
  }, [t, accessToken, idToken]);
  
  return {
    data: cachedData || mutation.data,
    error: mutation.error,
    isLoading: mutation.isLoading,
    refetch: () => {
      hasTriggeredRef.current = false;
      queryClient.removeQueries(["IS_MFA"]);
      mutation.mutate();
    },
  };
}
