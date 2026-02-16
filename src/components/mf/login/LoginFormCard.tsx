"use client";

import { Button } from "@/components/ui/button";
import React, { useCallback, useState } from "react";
import LoginForm from "../forms/login";
import { OTPForm } from "../forms/OTP";
import {
  LoginBodyType,
  MFAVerifyBodyType,
  MFAVerifyError,
  useLogin,
  useMFAVerify,
} from "@/queries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { SocialLogin } from "../SocialLogin";

type FormType = "login" | "otp";

const LoginFormCardContainer = () => {
  const router = useRouter();
  const [FormType, setFormType] = useState<FormType>("login");

  const onSuccess = (res: any) => {
    // MFA login
    if (res?.data?.challenge_name === "SOFTWARE_TOKEN_MFA") setFormType("otp");
    // Normal login
    else if (res.data?.auth_response?.AuthenticationResult?.IdToken) {
      //   TODO: Fetch menu redirect route
      router.push("/app-analytics/Dashboard/overall-summary");
      localStorage.setItem(
        "IdToken", 
        res.data?.auth_response?.AuthenticationResult?.IdToken,
      );
      localStorage.setItem(
        "IDToken",
        res.data?.auth_response?.AuthenticationResult?.IdToken,
      );
    }
  };

  const loginFn = useLogin(console.debug, onSuccess);

  const onMFAVerifySuccess = (d: any) => {
    const IdToken =
      d?.data?.auth_response?.AuthenticationResult?.IdToken;
    if (IdToken) {
      router.push("/app-analytics/Dashboard/overall-summary");
      localStorage.setItem("AccessToken", IdToken);
      localStorage.setItem(
        "IDToken",
        d?.data?.auth_response?.AuthenticationResult?.IdToken,
      );
      localStorage.removeItem("username");
    }
  };

  const onMFAVerifyError = (e: MFAVerifyError) => {
    toast({ title: e.message, variant: "destructive" });
  };

  const MFAVerify = useMFAVerify(onMFAVerifyError, onMFAVerifySuccess);

  const handleSubmit = useCallback((body: LoginBodyType) => {
    localStorage.setItem("username", body.username);
    loginFn.mutate({ body });
  }, []);

  const handleOTPSubmit = (otp: string) => {
    const body: MFAVerifyBodyType = {
      challenge_name: loginFn.data?.data.challenge_name,
      user_code: otp,
      session_token: loginFn.data?.data.session_token,
      username: localStorage.getItem("username") ?? "",
    };
    MFAVerify.mutate({ body });
  };

  return (
    <div className="flex flex-col items-center justify-center px-0 py-0 md:w-5/12">
      <div className="z-10 w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
        {FormType === "login" && (
          <LoginFormCard
            buttonText={loginFn.isLoading ? "Logging in..." : "Login"}
            onSubmit={handleSubmit}
            errorMessage={loginFn.error?.message ?? ""}
          />
        )}
        {FormType === "otp" && (
          <OTPForm
            title="MFA Verification"
            description="Enter MFA code"
            buttonText="Verify"
            onSubmit={handleOTPSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default LoginFormCardContainer;

const LoginFormCard: React.FC<{
  buttonText: string;
  errorMessage: string | null;
  onSubmit: (data: LoginBodyType) => void;
}> = ({ onSubmit, errorMessage, buttonText }) => {
  return (
    <>
      <LoginForm
        beforeForm={<SocialLogin />}
        buttonText={buttonText}
        onSubmit={onSubmit}
        errorMessage={errorMessage}
        afterForm={
          <div className="mt-4 flex flex-col items-center space-y-2 text-sm">
            <Link href="/forgot-password">
              <Button variant="link" size="sm" className="m-0 h-fit p-0">
                Forgot Password
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <span>Don&apos;t have an account?</span>
              <Link href="/sign-up" replace>
                <Button variant="link" size="sm" className="m-0 h-fit p-0">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        }
      />
    </>
  );
};
