import Endpoint from "@/common/endpoint";
import { fetchData } from "@/services";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

export function useGetSoftwareToken(enabled: boolean) {
  const url = process.env.NEXT_PUBLIC_AUTH_DOMAIN + Endpoint.GET_SOFTWARE_TOKEN;
  const [Body, setBody] = useState({});
  useEffect(() => {
    setBody({
      access_token: localStorage.getItem("AccessToken"),
    });
  }, []);
  return useQuery({
    queryKey: ["GET_UAM_KEYWORD_OVERVIEW", { url, method: "POST", data: Body }],
    queryFn: fetchData,
    enabled: true,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
