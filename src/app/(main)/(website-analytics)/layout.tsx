"use client";
import React, { useState } from "react";
import { useTheme } from "@/components/mf/theme-context";
import MFWebFraudAsideMenu from "@/components/mf/MFWebFraudAsideMenu";
import { MFTopBar } from "@/components/mf";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { SessionCheck } from "@/components/mf/SessionCheck";
import { ScrollToTop } from "@/components/mf/ScrollToTop";
import { ScrollProgress } from "@/components/mf/ScrollProgress";
import { cn } from "@/lib/utils";

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const [isHover, setIsHover] = useState(false);
  const [toggle, setToggle] = useState(false); 
  const mainContentScrollId = "main-content-scroll-container";

  const currentTheme = isDarkMode ? "dark" : "light";

  return (
    <div className="flex h-screen flex-col w-full dark:bg-black">
      {/* Top Bar */}
      <ScrollProgress
        scrollContainer={`#${mainContentScrollId}`}
        height={4}
        className="sticky"
      />
      <MFTopBar
        isExpanded={toggle || isHover}
        isToggle={true}
        onToggle={() => setToggle(!toggle)}
        isCalender={true}
      />

      {/* Side + Content Area (Flex Row) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Menu */}
        <MFWebFraudAsideMenu
          isExpanded={toggle || isHover}
          onHover={setIsHover}
          theme={currentTheme}
        />

        {/* Main Content */}
        <SessionCheck>
          <QueryClientProvider client={queryClient}>
            <div
              id={mainContentScrollId}
              className="flex-1 bg-gray-100 dark:bg-background overflow-auto p-1"
            >
              
              {children}
              <ScrollToTop scrollContainer={`#${mainContentScrollId}`} />
            </div>
          </QueryClientProvider>
        </SessionCheck>
      </div>
    </div>
  );
};

export default AppLayout;

