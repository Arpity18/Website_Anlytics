import React from 'react';
import { cn } from "@/lib/utils";

export interface ToggleOption {
  label: string;
  value: string;
}

interface ToggleButtonProps {
  options: ToggleOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  options,
  selectedValue,
  onChange,
  className,
}) => {
  const selectedIndex = options.findIndex(opt => opt.value === selectedValue);
  const buttonCount = options.length;

  return (
    <div
      className={cn(
        "relative inline-flex items-center bg-background border border-muted-foreground rounded-md",
        className
      )}
    >
      {/* Sliding background - perfectly aligned */}
      <div
        className="absolute top-0 bottom-0 bg-primary rounded-sm transition-all duration-300 ease-out"
        style={{
          width: `calc(100% / ${buttonCount})`,
          left: `calc(100% / ${buttonCount} * ${selectedIndex})`,
        }}
      />
      
      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative z-10 flex-1 px-6 py-2 text-sm font-medium transition-colors duration-200",
            "hover:bg-transparent text-center",
            selectedValue === option.value
              ? "text-white"
              : "text-foreground"
          )}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `calc(100% / ${buttonCount})`
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}; 