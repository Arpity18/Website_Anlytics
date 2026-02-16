// import Endpoint from "@/common/endpoint";
// import { APICall } from "@/services";
// import { useRouter } from "next/navigation";
// import { useMutation } from "react-query";

// type ErrorResponse = {
//   message: string;
// };

// export type VerifySoftwareTokenBodyType = {
//   access_token: string;
//   user_code: string;
// };

// export function useVerifySoftwareToken(onSuccess: (data: unknown) => void) {
//   const url =
//     process.env.NEXT_PUBLIC_AUTH_DOMAIN + Endpoint.VERIFY_SOFTWARE_TOKEN;
//   return useMutation(
//     APICall({
//       url,
//       method: "POST",
//       headers: {
//         Authorization:
//           "92a2119fb3329486dd39b97464d4fe5a4f8ba763fa884b8ba2d689b0b67c4175d9eff7232acd828ad24db7e5ddf7cae32ebf6eadab9e4d6c7cdeb1bbbc82c273",
//       },
//     }),
//     { onSuccess },
//   );
// }






import Endpoint from "@/common/endpoint";
import { APICall } from "@/services";
import { useRouter } from "next/navigation";
import { useMutation } from "react-query";
 
type ErrorResponse = {
  message: string;
};
 
export type VerifySoftwareTokenBodyType = {
  access_token: string;
  user_code: string;
};

export function useVerifySoftwareToken(onSuccess: (data: unknown) => void) {
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://auth.mfilterit.com/";
  const url = authDomain + Endpoint.VERIFY_SOFTWARE_TOKEN;
  
  return useMutation(
    APICall({
      url,
      method: "POST",
      headers: {
        Authorization: typeof window !== "undefined" ? localStorage.getItem("IDToken") || "" : "",
      },
    }),
    {
      onSuccess: (data: any) => {
        // Call the original onSuccess callback
        onSuccess(data);
      },
    },
  );
}
