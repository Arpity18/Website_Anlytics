// app/layouts/UserSettingsLayout.tsx or similar
"use client";
import React, { useState } from "react";
import { useTheme } from "@/components/mf/theme-context";
import MFWebFraudAsideMenu from "@/components/mf/MFWebFraudAsideMenu";
import { MFTopBar } from "@/components/mf";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { SessionCheck } from "@/components/mf/SessionCheck";
import Sidebar from "./sidebar"; // your profile/team/billing sidebar

type UserSettingsLayoutProps = {
  children: React.ReactNode;
};

const UserSettingsLayout: React.FC<UserSettingsLayoutProps> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const [isHover, setIsHover] = useState(false);
  const [toggle, setToggle] = useState(false);

  const currentTheme = isDarkMode ? "dark" : "light";

  // const buttonNames = ["Profile", "Team", "Billing", "Notification", "Security"];
  const buttonNames = ["Security"]
  const [activeButton, setActiveButton] = useState("Security");

  // Detect if we're on the security page and update active button
  React.useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/user-details/security')) {
      setActiveButton("Security");
    }
  }, []);

  const buttonClasses =
    "w-full md:py-2 px-4 md:mb-4 text-center text-sm bg-transparent hover:bg-gray-200 rounded-[20px] border border-gray-300";

  const activeButtonStyle = {
    backgroundColor: "hsl(var(--primary))",
    color: "white",
  };

  return (
   <div className="flex h-screen flex-col w-full dark:bg-black">
  {/* Top Bar */}
  <MFTopBar
    isExpanded={toggle || isHover}
    isToggle={true}
     onToggle={() => setToggle(!toggle)}
    isCalender={true}
  />

  {/* Side + Content Area (Flex Row) */}
  <div className="flex flex-1 overflow-hidden">
    {/* MFWebFraudAsideMenu */}
    <MFWebFraudAsideMenu
      isExpanded={toggle || isHover}
      onHover={setIsHover}
      theme={currentTheme}
    />

    {/* Settings layout with Sidebar + Content */}
    <SessionCheck>
      <QueryClientProvider client={queryClient}>
        {/* <div className="flex flex-1 overflow-hidden"> */}
          {/* Settings Sidebar (Fixed width) - Hide when on Security page */}
          {/* {activeButton !== "Security" && (
            <div className="w-40 bg-gray-100 shadow-lg border-r-2 border-gray-200 dark:bg-muted/50 dark:border-gray-700 overflow-y-auto"> 
              <Sidebar
                buttonNames={buttonNames}
                activeButton={activeButton}
                activeButtonStyle={activeButtonStyle}
                buttonClasses={buttonClasses}
                handleButtonClick={setActiveButton}
              />
            </div> 
          )} */}

          {/* Main Content - Center when sidebar is hidden */}
          <div className={`flex-1  bg-gray-100  dark:bg-background overflow-auto ${activeButton === "Security" ? 'p-8' : 'p-4'}`}>
            {children}
          </div>
        {/* </div> */}
      </QueryClientProvider>
    </SessionCheck>
  </div>
</div>
  )
}

export default UserSettingsLayout;
