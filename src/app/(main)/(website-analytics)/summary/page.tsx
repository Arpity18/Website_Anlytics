"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Filter } from "@/components/mf/Filters";
import type { FilterStateMap } from "@/components/mf/Filters";
import StatsCards from "@/components/mf/StatsCards";
import DoubleLineChart from "@/components/mf/charts/DoubleLineChart";
import DonutChart from "@/components/mf/charts/DonutChart";
import MFCard from "@/components/mf/MFCard";
import { Card, CardContent } from "@/components/ui/card";
import domToImage from "dom-to-image";
import { downloadURI, onExpand } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ResizableTable from "@/components/mf/ReportingToolTable";
import { useDateRange } from "@/components/mf/DateRangeContext";
import { usePackage } from "@/components/mf/PackageContext";
import {
  useSummaryStats,
  useVisitorsStats,
  usePageViewsStats,
  useDeviceBreakdown,
  useTrafficSources,
  useTopPages,
  useDeadLinks,
} from "../hooks/useSummary";


export default function SummaryPage() {
  const { startDate, endDate } = useDateRange();
  const { selectedPackage } = usePackage();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const onExport = useCallback(
    async (s: string, title: string, key: string) => {
      const ref = cardRefs.current[key];
      if (!ref) return;

      switch (s) {
        case "png":
          const screenshot = await domToImage.toPng(ref);
          downloadURI(screenshot, title + ".png");
          break;
        default:
      }
    },
    []
  );

  const handleExpand = (key: string) => {
    onExpand(key, cardRefs, expandedCard, setExpandedCard);
  };

  const [filterState, setFilterState] = useState<FilterStateMap>({
    Device: {
      filters: [
        { label: "Mobile", checked: true },
        { label: "Desktop", checked: true },
        { label: "Tablet", checked: true },
      ],
      is_select_all: true,
      selected_count: 3,
      loading: false,
    },
  });

  const [VisitorsConfig] = useState({
    Visitors: {
      label: "Visitors",
      color: "#3B82F6",
    },
  });

  const [PageViewsConfig] = useState({
    PageViews: {
      label: "Page Views",
      color: "#10B981",
    },
  });

  const [searchTermDeadLinks, setSearchTermDeadLinks] = useState("");
  const [deadLinksPage, setDeadLinksPage] = useState(1);
  const [deadLinksLimit, setDeadLinksLimit] = useState(10);
  const [deadLinksPagination, setDeadLinksPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null>(null);

  const [toggleValue, setToggleValue] = useState(false);
  const selectedDevices = useMemo(() => {
    const deviceFilters = filterState.Device?.filters || [];
    const isSelectAll = filterState.Device?.is_select_all;
    
    if (isSelectAll) {
      return "all";
    }
    
    return deviceFilters
      .filter((f) => f.checked)
      .map((f) => f.label.toLowerCase());
  }, [filterState.Device?.filters, filterState.Device?.is_select_all]);

  const basePayload = useMemo(
    () => ({
      startDate: startDate,
      endDate: endDate,
      package_name: selectedPackage,
    }),
    [startDate, endDate, selectedPackage]
  );

  const summaryStatsPayload = useMemo(
    () => ({
      ...basePayload,
      includeBots: toggleValue,
    }),
    [basePayload, toggleValue]
  );

  // const visitorsStatsPayload = useMemo(
  //   () => ({
  //     ...basePayload,
  //   }),
  //   [basePayload]
  // );

  const pageViewsStatsPayload = useMemo(
    () => ({
      ...basePayload,
      deviceType: selectedDevices,
    }),
    [basePayload, selectedDevices]
  );

  const topPagesPayload = useMemo(
    () => ({
      ...basePayload,
      includeBots: toggleValue,
      // deviceType: selectedDevices,
    }),
    [basePayload, toggleValue, selectedDevices]
  );

  // const trafficSourcesPayload = useMemo(
  //   () => ({
  //     ...basePayload,
  //   }),
  //   [basePayload]
  // );

  // const deviceBreakdownPayload = useMemo(
  //   () => ({
  //     ...basePayload,
  //   }),
  //   [basePayload]
  // );

  const deadLinksPayload = useMemo(
    () => ({
      ...basePayload,
      page: deadLinksPage,
      limit: deadLinksLimit,
    }),
    [basePayload, deadLinksPage, deadLinksLimit]
  );

  const { data: summaryStatsResponse, isLoading: isSummaryStatsLoading } =
    useSummaryStats(summaryStatsPayload, true);
  const { data: visitorsStatsResponse, isLoading: isVisitorsStatsLoading } =
    useVisitorsStats(basePayload, true);
  const { data: pageViewsStatsResponse, isLoading: isPageViewsStatsLoading } =
    usePageViewsStats(pageViewsStatsPayload, true);
  const { data: deviceBreakdownResponse, isLoading: isDeviceBreakdownLoading } =
    useDeviceBreakdown(basePayload, true);
  const { data: trafficSourcesResponse, isLoading: isTrafficSourcesLoading } =
    useTrafficSources(basePayload, true);
  const { data: topPagesResponse, isLoading: isTopPagesLoading } = useTopPages(
    topPagesPayload,
    true
  );
  const { data: deadLinksResponse, isLoading: isDeadLinksLoading } =
    useDeadLinks(deadLinksPayload, true);

  const visitorsData = useMemo(() => {
    if (!visitorsStatsResponse?.data) return [];
    return visitorsStatsResponse.data.map((item: any) => ({
      label: item.date,
      Visitors: item.totalVisits || 0,
    }));
  }, [visitorsStatsResponse]);

  const pageViewsData = useMemo(() => {
    if (!pageViewsStatsResponse?.data) return [];
    return pageViewsStatsResponse.data.map((item: any) => ({
      label: item.date,
      PageViews: item.views || 0,
    }));
  }, [pageViewsStatsResponse]);

  const trafficSourcesConfig = useMemo(() => {
    if (!trafficSourcesResponse?.data) return {};
    return trafficSourcesResponse.data.reduce((acc: any, item: any) => {
      const label = item.source || item.label || "Unknown";
      acc[label] = {
        label,
        color: item.colorCode || "",
        visit: item.visit || 0,
        percentage: item.percentage || "",
      };
      return acc;
    }, {});
  }, [trafficSourcesResponse]);

  const deviceBreakdownConfig = useMemo(() => {
    if (!deviceBreakdownResponse?.data) return {};
    return deviceBreakdownResponse.data.reduce((acc: any, item: any) => {
      const label = item.label || "Unknown";
      acc[label] = {
        label,
        color: item.colorCode || "",
        visit: item.visit || 0,
        percentage: item.percentage || "",
      };
      return acc;
    }, {});
  }, [deviceBreakdownResponse]);

  const topPagesData = useMemo(() => {
    if (!topPagesResponse?.data) return [];
    return topPagesResponse.data.map((item: any) => ({
      label: item.page_name,
      views: item.views || item.pageViews || item.visit || 0,
    }));
  }, [topPagesResponse]);

  const deadLinksData = useMemo(() => {
    if (!deadLinksResponse?.data?.links) return [];
    return deadLinksResponse.data.links.map((item: any) => ({
      id: String(item.id ?? ""),
      site_domain: item.site_domain ?? "",
      referrer: item.referrer ?? "",
      url: item.url ?? "",
      httpCode: item.httpCode ?? item.http_code ?? "",
      error_message: item.error_message ?? "",
      isBroken: item.isBroken ?? item.is_broken ?? false,
      detectedAt: item.detectedAt ?? item.detected_at ?? "",
      lastChecked: item.lastChecked ?? item.last_checked ?? "",
      package_name: item.package_name ?? "",
    }));
  }, [deadLinksResponse]);

  const handleFilterChange = (newState: FilterStateMap) => {
    setFilterState(newState);
  };

  const handleToggleChange = (checked: boolean) => {
    setToggleValue(checked);
  };

  const handleChartExpand = () => {
    console.log("Chart expanded");
  };

  const handleDeadLinksPageChange = (page: number) => {
    setDeadLinksPage(page);
  };

  const handleDeadLinksLimitChange = (limit: number) => {
    setDeadLinksLimit(limit);
    setDeadLinksPage(1);
  };

  useEffect(() => {
    setDeadLinksPage(1);
  }, [startDate, endDate, selectedPackage]);

  // Dead Links Columns
  const DeadLinksColumns = useMemo(() => [
    { title: "ID", key: "id" },
    { title: "Site Domain", key: "site_domain" },
    { title: "Referrer", key: "referrer" },
    { title: "URL", key: "url" },
    { title: "HTTP Code", key: "httpCode" },
    { title: "Error Message", key: "error_message" },
    { title: "Is Broken", key: "isBroken" },
    { title: "Detected At", key: "detectedAt" },
    { title: "Last Checked", key: "lastChecked" },
    { title: "Package Name", key: "package_name" },
  ], []);

  return (
    <div className="flex flex-col gap-2 w-full p-1 sm:p-1">
     
      {/* Filter Section */}
      <div className="w-full bg-white dark:bg-card p-2 rounded-md shadow-md flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <Filter
              filter={filterState}
              onChange={handleFilterChange}
              isSearchable={true}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="toggle-switch"
              className="text-sm font-medium cursor-pointer"
            >
              Include Bots
            </Label>
            <Switch
              id="toggle-switch"
              checked={toggleValue}
              onCheckedChange={handleToggleChange}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="w-full bg-white dark:bg-card rounded-md shadow-md p-2 sm:p-4">
        <StatsCards
          data={summaryStatsResponse?.data}
          customLabels={{
            totalSessions: "Total Visitors",
            uniqueVisitors: "Unique Visitors",
            pageViews: "Page Views",
            deadLinksDetected: "Total Dead Links",
          }}
          isLoading={isSummaryStatsLoading}
          skeletonCardCount={4}
          gridCols={{
            mobile: 1,
            tablet: 2,
            desktop: 4,
          }}
        />
      </div>

      {/* Visitors and Page Views Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 w-full min-h-[320px]">
        {/* Visitors Double Line Chart */}
        <Card
          ref={(el) => {
            if (el) cardRefs.current["visitors"] = el;
          }}
          className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md dark:bg-card h-full min-h-[280px] "
        >
          <CardContent className="w-full h-full sm:p-2">
            <DoubleLineChart
              chartData={visitorsData}
              chartConfig={VisitorsConfig}
              isLoading={isVisitorsStatsLoading}
              showMenu={true}
              title="Visitors"
              isPercentage={false}
              onExpand={() => handleExpand("visitors")}
              onExport={() => onExport("png", "Visitors", "visitors")}
            />
          </CardContent>
        </Card>

        {/* Page Views Double Line Chart */}
        <Card
          ref={(el) => {
            if (el) cardRefs.current["page-views"] = el;
          }}
          className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md dark:bg-card h-full min-h-[280px] "
        >
          <CardContent className="w-full h-full sm:p-2">
            <DoubleLineChart
              chartData={pageViewsData}
              chartConfig={PageViewsConfig}
              isLoading={isPageViewsStatsLoading}
              showMenu={true}
              title="Page Views"
              isPercentage={false}
              onExpand={() => handleExpand("page-views")}
              onExport={() => onExport("png", "Page Views", "page-views")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Pages Card and Two Donut Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full min-h-[320px]">
        {/* Top Pages Card */}
        <Card
          ref={(el) => {
            if (el) cardRefs.current["top-pages"] = el;
          }}
          className="w-full shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md dark:bg-card h-full min-h-[320px]"
        >
          <CardContent>
            <MFCard
              title="Top Pages"
              titleClass="text-sm"
              titlePosition="left"
              contentData={topPagesData}
              viewsLabel="Views"
              durationLabel="Duration"
              layout="grid"
              showExpandCollapse={true}
              loading={isTopPagesLoading}
            />
          </CardContent>
        </Card>

        {/* Traffic Sources Donut Chart */}
        <Card
          ref={(el) => {
            if (el) cardRefs.current["traffic-sources"] = el;
          }}
          className="w-full shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md dark:bg-card h-full min-h-[320px]"
        >
          <CardContent className="w-full sm:p-1 min-h-[300px]">
            <DonutChart
              chartData={trafficSourcesResponse?.data}
              chartConfig={trafficSourcesConfig}
              dataKey="visit"
              nameKey="label"
              isLoading={isTrafficSourcesLoading}
              isdonut={true}
              title="Traffic Sources"
              isView={true}
              direction="flex-col"
              marginTop="mt-0"
              position="items-start"
              isPercentage={false}
              isPercentageValue={true}
              onExpand={() => handleExpand("traffic-sources")}
              onExport={() =>
                onExport("png", "Traffic Sources", "traffic-sources")
              }
            />
          </CardContent>
        </Card>

        {/* Device Breakdown Donut Chart */}
        <Card
          ref={(el) => {
            if (el) cardRefs.current["device-breakdown"] = el;
          }}
          className="w-full shadow-md rounded-lg bg-white gap-2 dark:bg-card dark:text-white text-header h-full"
        >
          <CardContent className="w-full sm:p-1 min-h-[300px]">
            <DonutChart
              chartData={deviceBreakdownResponse?.data}
              chartConfig={deviceBreakdownConfig}
              dataKey="visit"
              nameKey="label"
              isLoading={isDeviceBreakdownLoading}
              isdonut={true}
              title="Device Breakdown"
              isView={true}
              direction="flex-col"
              marginTop="mt-0"
              position="items-start"
              isPercentage={false}
              isPercentageValue={true}
              onExpand={() => handleExpand("device-breakdown")}
              onExport={() =>
                onExport("png", "Device Breakdown", "device-breakdown")
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Table Card Section - Separate */}
      <div className="w-full bg-white dark:bg-card rounded-md shadow-md">
        <div className="w-full p-0.5 sm:p-1 md:p-1.5 dark:bg-gray-600">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-center bg-primary text-white p-0.5 sm:p-1 md:p-1.5 rounded-md dark:bg-card dark:text-foreground">
            Dead Links
          </h2>
        </div>
        <Card
          ref={(el) => {
            if (el) cardRefs.current["dead-links"] = el;
          }}
          className="border-none shadow-none"
        >
          <ResizableTable
            columns={DeadLinksColumns}
            data={deadLinksData}
            headerColor="#DCDCDC"
            height={400}
            isSearchable={true}
            isPaginated={true}
            isLoading={isDeadLinksLoading}
            isUserTable={false}
            isTableDownload={false}
            SearchTerm={searchTermDeadLinks}
            setSearchTerm={setSearchTermDeadLinks}
            isView={false}
            onPageChangeP={handleDeadLinksPageChange}
            onLimitChange={handleDeadLinksLimitChange}
            pageNo={deadLinksPage}
            limit={deadLinksLimit}
            totalPages={deadLinksPagination?.pages || 1}
            totalRecords={deadLinksPagination?.total || 0}
          />
        </Card>
      </div>
    </div>
  );
}
