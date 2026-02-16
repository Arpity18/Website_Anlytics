import Endpoint from "@/common/endpoint";
import { APICall } from "@/services";
import { useMutation } from "react-query";

export type SignOutError = {
  message: string;
};

export type SignOutBodyType = {
  access_token: string;
};

/**
 * TODO
 */
export function useSignOut(
  onError: (error: SignOutError) => void,
  onSuccess: (data: any) => void,
) {
  const url = process.env.NEXT_PUBLIC_AUTH_DOMAIN + Endpoint.SIGN_OUT;
  // return useMutation(
  //   APICall({
  //     url,
  //     method: "POST",
  //     headers: {
  //       Authorization:
  //         "92a2119fb3329486dd39b97464d4fe5a4f8ba763fa884b8ba2d689b0b67c4175d9eff7232acd828ad24db7e5ddf7cae32ebf6eadab9e4d6c7cdeb1bbbc82c273",
  //     },
  //   }),
  //   { onError, onSuccess },
  // );
  return useMutation(
    (accessToken: string) => {
      // Get ID token from localStorage for Authorization header
      const idToken = typeof window !== "undefined" 
        ? localStorage.getItem("IDToken") || localStorage.getItem("IdToken")
        : null;
      const authToken = idToken || accessToken; // Fallback to access token if ID token not found
console.log(authToken,accessToken);
console.log(idToken,"idToken");
      
      return APICall({
        url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
      })({
        body: { access_token: accessToken },
      });
    },
    { onError, onSuccess }
  );
}
