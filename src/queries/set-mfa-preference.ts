// import Endpoint from "@/common/endpoint";
// import { APICall } from "@/services";
// import { useMutation } from "react-query";

// export type ErrorResponse = {
//   message: string;
// };

// export type SetMFAPreferenceBodyType = {
//   access_token: string;
//   user_code: string;
// };

// export function useSetMFAPreference(
//   onError: (err: ErrorResponse) => void,
//   onSuccess: (data: unknown) => void,
// ) {
//   const url = process.env.NEXT_PUBLIC_AUTH_DOMAIN + Endpoint.SET_MFA_PREFERENCE;
//   return useMutation(
//     APICall({
//       url,
//       method: "POST",
//       headers: {
//         Authorization:
//           "92a2119fb3329486dd39b97464d4fe5a4f8ba763fa884b8ba2d689b0b67c4175d9eff7232acd828ad24db7e5ddf7cae32ebf6eadab9e4d6c7cdeb1bbbc82c273",
//       },
//     }),
//     { onSuccess, onError },
//   );
// }




import Endpoint from "@/common/endpoint";
import { APICall } from "@/services";
import { useMutation } from "react-query";
 
export type ErrorResponse = {
  message: string;
};
 
export type SetMFAPreferenceBodyType = {
  access_token: string;
  enable_sms_mfa?: boolean;
  enable_software_token_mfa?: boolean;
  enable_email_mfa?: boolean;
 
};
 
export function useSetMFAPreference(
  onError: (err: ErrorResponse) => void,
  onSuccess: (data: unknown) => void,
) {
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.mfilterit.com/";
  const url = authDomain + Endpoint.SET_MFA_PREFERENCE;
  return useMutation(
    APICall({
      url,
      method: "POST",
      headers: {
        Authorization: typeof window !== "undefined" ? localStorage.getItem("IDToken") || "" : "",
      },
    }),
    { onSuccess, onError },
  );
}