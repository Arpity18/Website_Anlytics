import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Dispatch, SetStateAction } from 'react';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const session = {
  set: (k: string, d: object) => {
    const b = Buffer.from(JSON.stringify(d));
    localStorage.setItem(k, b.toString("base64"));
  },
  get: (k: string) => {
    const b = localStorage.getItem(k);
    if (!b) return {};
    return JSON.parse(Buffer.from(b ?? "", "base64").toString() ?? "{}");
  },
};

export function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const getXAxisAngle = (data: string[]): number => {
  if (data.length === 0) {
    return 0; // or handle this case however you prefer
  }
  return data.length > 10 ? 1 : 0;
};
export const formatNumber = (value: number): string => {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B';
  }
  if (value >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M';
  }
  if (value >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K';
  }
  return value.toString();
};


export const onExpand = (
  key: string,
  cardRefs: React.MutableRefObject<Record<string, HTMLElement | null>>,
  expandedCard: string | null,
  setExpandedCard: Dispatch<SetStateAction<string | null>>
) => {
  const card = cardRefs.current[key];

  if (card) {
    if (!document.fullscreenElement) {
      card.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen mode:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Error attempting to exit fullscreen mode:", err);
      });
    }

    setExpandedCard(expandedCard === key ? null : key);
  }
};

export const handleExportData = (
  headers: string[],
  rows: (string | number)[][],
  fileName: string
) => {
  const escapeCSV = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatValue = (value: number, labelType: string) => {
  if (labelType === "Percentage") {
    return `${Math.round(value * 100 / 1000) * 10}%`; 
  }
  return value.toLocaleString(); 
};

 export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

export const parsePercentage = (percentage: string | number): number => {
  // Check if it's a string and has the percentage sign
  if (typeof percentage === 'string') {
    return parseFloat(percentage.replace('%', '').trim());
  }
  // If it's already a number, return it as is
  if (typeof percentage === 'number') {
    return percentage;
  }
  // If it's not a valid type, return NaN or handle as needed
  return NaN;
};

 export const formatBlacklistLabel = (value: string) => {
  if (!value) return "";

  // Split by underscores
  const words = value.split("_");

  // Capitalize first letter of each word
  const formattedWords = words.map(word => 
    word.length === 2 && word === word.toLowerCase()
      ? word.toUpperCase() // If it's 2-letter lowercase (like "ip"), uppercase it
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  // Join with space
  return formattedWords.join(" ");
};


