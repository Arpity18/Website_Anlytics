"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import RadialBar from "@/components/mf/charts/RadialChart";
import EngagementCard from "@/components/mf/EngagementCard";
import { useDateRange } from "@/components/mf/DateRangeContext";
import { usePackage } from "@/components/mf/PackageContext";
import {
  useUserIntent,
  useEngangementSessions,
} from "../hooks/useUserAnalysis";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import RrwebReplayer from "@/components/mf/RrwebReplayer";

const toNumber = (value?: string) =>
  parseFloat(value?.replace("%", "").trim() || "0");

type EngagementSession = {
  sessionId: string;
  device: string;
  dateTime: string;
};

type IntentKey = "High_Intent" | "Medium_Intent" | "Low_Intent";
type IntentData = {
  label: string;
  "Visit %": number;
  "Event %": number;
};

type UserIntentItem = {
  intent_status: IntentKey;
  visit_percentage: string;
  event_percentage: string;
};

const dynamicChartConfigR = {
  "Visit %": { label: "Visit %", color: "#3B82F6" },
  "Event %": { label: "Event %", color: "#10B981" },
};

const INTENT_CARDS = [
  {
    key: "High_Intent" as const,
    fallbackLabel: "High Intent User",
    textColor: "#2a9d90",
  },
  {
    key: "Medium_Intent" as const,
    fallbackLabel: "Medium Intent User",
    textColor: "#e76e50",
  },
  {
    key: "Low_Intent" as const,
    fallbackLabel: "Low Intent User",
    textColor: "#ff0000",
  },
];

export default function UserAnalysisPage() {
  const { startDate, endDate } = useDateRange();
  const { selectedPackage } = usePackage();

  const basePayload = useMemo(
    () => ({
      startDate,
      endDate,
      package_name: selectedPackage,
    }),
    [startDate, endDate, selectedPackage]
  );

  const { data: engagementSessionsResponse, isLoading: isLoadingSessions } =
    useEngangementSessions(basePayload, true);

  const { data: userIntentResponse, isLoading: isLoadingUserIntent } =
    useUserIntent(basePayload, true);

  const intentMap = useMemo<Record<IntentKey, IntentData>>(() => {
    const data: UserIntentItem[] = Array.isArray(userIntentResponse)
      ? userIntentResponse
      : userIntentResponse?.data || [];

    return data.reduce<Record<IntentKey, IntentData>>(
      (acc, item) => {
        acc[item.intent_status] = {
          label: item.intent_status.replace("_", " "),
          "Visit %": toNumber(item.visit_percentage),
          "Event %": toNumber(item.event_percentage),
        };
        return acc;
      },
      {} as Record<IntentKey, IntentData>
    );
  }, [userIntentResponse]);

  const engagementSessions: EngagementSession[] = useMemo(() => {
    const raw = Array.isArray(engagementSessionsResponse)
      ? engagementSessionsResponse
      : engagementSessionsResponse?.data || [];

    return raw.map((item: any, i: number) => ({
      sessionId: item.trackingNo ?? `SESSION-${i + 1}`,
      device: item.deviceType ?? "Unknown",
      dateTime: item.visitDateTime ?? "",
    }));
  }, [engagementSessionsResponse]);

  const [rrwebEvents, setRrwebEvents] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const [isLoadingReplay, setIsLoadingReplay] = useState(false);
  const [replayError, setReplayError] = useState<string | null>(null);

  const handlePlay = async (session: EngagementSession) => {
    try {
      setCurrentSessionId(session.sessionId);
      setIsReplayOpen(true);
      setIsLoadingReplay(true);
      setRrwebEvents([]);
      setReplayError(null);

      if (!session.sessionId || !selectedPackage || !session.dateTime) {
        throw new Error("Missing session details");
      }

      const datePart = session.dateTime.split(" ")[0]; // YYYY-MM-DD

      const url = new URL(
        "https://session-recording-worker.dhiraj7045.workers.dev/recordings-events"
      );
      url.searchParams.append("mf_bh_tracking_no", session.sessionId);
      url.searchParams.append("mf_package_name", selectedPackage);
      url.searchParams.append("inserted_date", datePart);

      console.log("Fetching replay from:", url.toString());

      const res = await fetch(url.toString());

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Server error ${res.status}: ${text || "Unknown error"}`
        );
      }

      const data = await res.json();
      console.log("API Response:", data);

      let events: any[] = [];
      if (Array.isArray(data)) events = data;
      else if (data?.events) events = data.events;
      else if (data?.data) events = data.data;
      else if (data?.recording) events = data.recording;

      if (events.length === 0) {
        throw new Error("No recording events found for this session");
      }

      setRrwebEvents(events);
    } catch (err: any) {
      console.error("Replay load failed:", err);
      setReplayError(err.message || "Failed to load recording");
    } finally {
      setIsLoadingReplay(false);
    }
  };

  const downloadReplay = () => {
    if (rrwebEvents.length === 0) return;
    const blob = new Blob([JSON.stringify(rrwebEvents, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentSessionId}-recording.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-2 w-full p-1 overflow-hidden">
      {/* Intent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {INTENT_CARDS.map(({ key, fallbackLabel, textColor }) => {
          const intent = intentMap[key];
          return (
            <Card
              key={key}
              className="min-h-[220px] shadow-md hover:shadow-lg transition-shadow"
            >
              <RadialBar
                chartData={intent ? [intent] : []}
                chartConfig={dynamicChartConfigR}
                Device={intent?.label || fallbackLabel}
                Vname="Visits"
                Vvalue={intent?.["Visit %"] ?? 0}
                Oname="Events"
                Ovalue={intent?.["Event %"] ?? 0}
                textcolors={textColor}
                value1="Visit %"
                value2="Event %"
                isLoading={isLoadingUserIntent}
                isPercentage
                isCardTitle
                isHeader={false}
                onExpand={() => {}}
              />
            </Card>
          );
        })}
      </div>

      {/* Sessions List */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-center bg-primary text-white py-2 rounded-t-lg">
          Engagement Sessions
        </h2>

        <div className="flex flex-col gap-1 max-h-[calc(100vh-420px)] overflow-y-auto p-2 bg-muted/30 rounded-b-lg">
          {isLoadingSessions ? (
            Array.from({ length: 6 }).map((_, i) => (
              <EngagementCard
                key={i}
                sessionId=""
                device=""
                dateTime=""
                isLoading
              />
            ))
          ) : engagementSessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              No sessions found.
            </div>
          ) : (
            engagementSessions.map((session) => (
              <EngagementCard
                key={session.sessionId}
                sessionId={session.sessionId}
                device={session.device}
                dateTime={session.dateTime}
                onPlay={() => handlePlay(session)}
              />
            ))
          )}
        </div>
      </div>

      {/* Replay Dialog */}
      <Dialog open={isReplayOpen} onOpenChange={setIsReplayOpen}>
        <DialogContent className="max-w-7xl w-full h-[100vh] p-0 bg-transparent border-0 shadow-none overflow-hidden">
          <div className="w-full h-full relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm p-4 flex justify-between items-center border-b">
              <DialogTitle className="text-xl font-bold">
                Session Replay — {currentSessionId || "Loading..."}
              </DialogTitle>
              <div className="flex gap-3">
                {rrwebEvents.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={downloadReplay}
                  >
                    Download JSON
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsReplayOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>

            {/* Loading / Error */}
            {isLoadingReplay && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-40">
                <div className="text-center">
                  <div className="spinner mx-auto mb-4"></div>
                  <p>Loading session...</p>
                </div>
              </div>
            )}

            {replayError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-40">
                <p className="text-red-600 text-xl">{replayError}</p>
              </div>
            )}

            {/* Iframe with your working HTML */}
            {rrwebEvents.length > 0 && !isLoadingReplay && !replayError && (
              <iframe
                src="/replay.html"
                className="w-full h-full border-0"
                title="Session Replay"
                sandbox="allow-scripts allow-same-origin"
                onLoad={(e) => {
                  const iframe = e.target as HTMLIFrameElement;
                  // Send events when iframe loads
                  iframe.contentWindow?.postMessage(
                    { type: "PLAY_EVENTS", events: rrwebEvents },
                    "*"
                  );
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
