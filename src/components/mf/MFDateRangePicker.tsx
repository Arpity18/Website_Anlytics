
// "use client";

// import * as React from "react";
// import {
//   endOfMonth,
//   endOfWeek,
//   format,
//   startOfMonth,
//   startOfWeek,
//   subDays,
//   subMonths,
//   subWeeks,
// } from "date-fns";
// import { Calendar as CalendarIcon, Check } from "lucide-react";
// import { DateRange } from "react-day-picker";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import { useDateRange } from "./DateRangeContext";

// interface MFDateRangePickerProps {
//   className?: string;
//   onDateChange?: (range: DateRange | undefined) => void;
// }

// export function MFDateRangePicker({
//   className,
//   onDateChange,
// }: MFDateRangePickerProps) {
//   const { setDateRange } = useDateRange();
//   const [date, setDate] = React.useState<DateRange | undefined>({
//     from: subDays(new Date(), 7),
//     to: new Date(),
//   });
//   const [calendarSelection, setCalendarSelection] = React.useState<DateRange | undefined>(undefined);
//   const [open, setOpen] = React.useState(false);
//   const [calendarKey, setCalendarKey] = React.useState(0);

//   const handleDateSelect = (newDateRange: DateRange | undefined) => {
//     console.log('handleDateSelect called with:', newDateRange);
//     console.log('current date state:', date);
    
//     if (!newDateRange) {
//       // User cleared the selection
//       setDate(undefined);
//       setCalendarSelection(undefined);
//       return;
//     }
    
//     // If user clicks a new date when we already have a complete range, reset and start fresh
//     if (date?.from && date?.to && newDateRange?.from && !newDateRange?.to) {
//       console.log('Resetting for new selection');
//       setCalendarSelection({ from: newDateRange.from, to: undefined });
//       setDate({ from: newDateRange.from, to: undefined });
//       return;
//     }
    
//     if (newDateRange?.from && !newDateRange?.to) {
//       // User clicked a single date - start new selection
//       console.log('Setting single date:', newDateRange.from);
//       setCalendarSelection({ from: newDateRange.from, to: undefined });
//       setDate({ from: newDateRange.from, to: undefined });
//     } else if (newDateRange?.from && newDateRange?.to) {
//       // User has selected both dates - complete the range
//       console.log('Setting complete range:', newDateRange);
//       setCalendarSelection(newDateRange);
//       setDate(newDateRange); // Update the button display
//       setOpen(false);
//       setDateRange(
//         format(newDateRange.from, 'yyyy-MM-dd'),
//         format(newDateRange.to, 'yyyy-MM-dd')
//       );
//       onDateChange?.(newDateRange);
//     }
//   };

//   const handlePresetSelect = (value: string) => {
//     let newDateRange: DateRange | undefined;
    
//     switch (value) {
//       case "l_month":
//         newDateRange = {
//           from: startOfMonth(subMonths(new Date(), 1)),
//           to: endOfMonth(subMonths(new Date(), 1)),
//         };
//         break;
//       case "l_week":
//         newDateRange = {
//           from: startOfWeek(subWeeks(new Date(), 1)),
//           to: endOfWeek(subWeeks(new Date(), 1)),
//         };
//         break;
//       default:
//         newDateRange = {
//           from: subDays(new Date(), parseInt(value)),
//           to: new Date(),
//         };
//         break;
//     }
    
//     setDate(newDateRange);
//     setOpen(false);
    
//     if (newDateRange?.from && newDateRange?.to) {
//       setDateRange(
//         format(newDateRange.from, 'yyyy-MM-dd'),
//         format(newDateRange.to, 'yyyy-MM-dd')
//       );
//       onDateChange?.(newDateRange);
//     }
//   };

//   const resetCalendar = () => {
//     setCalendarKey(prev => prev + 1);
//     setCalendarSelection(undefined); // Clear calendar visual selection for fresh start
//   };

//   // Get the final selected range for display
//   const getSelectedRange = (): DateRange | undefined => {
//     return calendarSelection?.from && calendarSelection?.to ? calendarSelection : undefined;
//   };

//   return (
//     <div className={cn("grid gap-2", className)}>
//       <Popover open={open} onOpenChange={(isOpen) => {
//         setOpen(isOpen);
//         if (isOpen) {
//           // Reset calendar when opening
//           resetCalendar();
//         }
//       }}>
//         <PopoverTrigger asChild>
//           <Button
//             id="date"
//             variant="ghost"
//             className={cn(
//               "w-fit max-w-60   h-8 text-small-font justify-start text-left font-normal",
//               !date && "text-muted-foreground"
//             )}
//           >
//             <CalendarIcon className="mr-2 h-4 w-4" />
//             {date?.from ? (
//               date.to ? (
//                 <>
//                   {format(date.from, "LLL dd, y")} -{" "}
//                   {format(date.to, "LLL dd, y")}
//                 </>
//               ) : (
//                 format(date.from, "LLL dd, y")
//               )
//             ) : (
//               <span>Pick a date</span>
//             )}
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0" align="start">
//           <Select onValueChange={handlePresetSelect}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select Preset" />
//             </SelectTrigger>
//             <SelectContent position="popper">
//               <SelectItem value="7">Last 7 days</SelectItem>
//               <SelectItem value="l_week">Last week</SelectItem>
//               <SelectItem value="30">Last 30 days</SelectItem>
//               <SelectItem value="l_month">Last month</SelectItem>
//               <SelectItem value="90">Last 3 months</SelectItem>
//             </SelectContent>
//           </Select>
//           <Calendar
//             key={calendarKey}
//             initialFocus
//             mode="range"
//             defaultMonth={date?.from}
//             selected={calendarSelection}
//             onSelect={handleDateSelect}
//             numberOfMonths={2}
//             disabled={{ after: new Date() }}
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// }





"use client";

import * as React from "react";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useDateRange } from "./DateRangeContext";

interface MFDateRangePickerProps {
  className?: string;
  onDateChange?: (range: DateRange | undefined) => void;
}

export function MFDateRangePicker({
  className,
  onDateChange,
}: MFDateRangePickerProps) {
  const { setDateRange, minDate, maxDate, isDateDisabled } = useDateRange();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [calendarSelection, setCalendarSelection] = React.useState<DateRange | undefined>(undefined);
  const [open, setOpen] = React.useState(false);
  const [calendarKey, setCalendarKey] = React.useState(0);

  const handleDateSelect = (newDateRange: DateRange | undefined) => {
    console.log('handleDateSelect called with:', newDateRange);
    console.log('current date state:', date);
    
    if (!newDateRange) {
      // User cleared the selection
      setDate(undefined);
      setCalendarSelection(undefined);
      return;
    }
    
    // If user clicks a new date when we already have a complete range, reset and start fresh
    if (date?.from && date?.to && newDateRange?.from && !newDateRange?.to) {
      console.log('Resetting for new selection');
      setCalendarSelection({ from: newDateRange.from, to: undefined });
      setDate({ from: newDateRange.from, to: undefined });
      return;
    }
    
    if (newDateRange?.from && !newDateRange?.to) {
      // User clicked a single date - start new selection
      console.log('Setting single date:', newDateRange.from);
      setCalendarSelection({ from: newDateRange.from, to: undefined });
      setDate({ from: newDateRange.from, to: undefined });
    } else if (newDateRange?.from && newDateRange?.to) {
      // User has selected both dates - complete the range
      console.log('Setting complete range:', newDateRange);
      setCalendarSelection(newDateRange);
      setDate(newDateRange); // Update the button display
      setOpen(false);
      setDateRange(
        format(newDateRange.from, 'yyyy-MM-dd'),
        format(newDateRange.to, 'yyyy-MM-dd')
      );
      onDateChange?.(newDateRange);
    }
  };

  const handlePresetSelect = (value: string) => {
    let newDateRange: DateRange | undefined;
    
    switch (value) {
      case "l_month":
        newDateRange = {
          from: startOfMonth(subMonths(new Date(), 1)),
          to: endOfMonth(subMonths(new Date(), 1)),
        };
        break;
      case "l_week":
        newDateRange = {
          from: startOfWeek(subWeeks(new Date(), 1)),
          to: endOfWeek(subWeeks(new Date(), 1)),
        };
        break;
      case "90":
        // Select full previous 3 months, excluding current month
        newDateRange = {
          from: startOfMonth(subMonths(new Date(), 3)),
          to: endOfMonth(subMonths(new Date(), 1)),
        };
        break;
      default:
        newDateRange = {
          from: subDays(new Date(), parseInt(value)),
          to: new Date(),
        };
        break;
    }
    
    setDate(newDateRange);
    setOpen(false);
    
    if (newDateRange?.from && newDateRange?.to) {
      setDateRange(
        format(newDateRange.from, 'yyyy-MM-dd'),
        format(newDateRange.to, 'yyyy-MM-dd')
      );
      onDateChange?.(newDateRange);
    }
  };

  const resetCalendar = () => {
    setCalendarKey(prev => prev + 1);
    setCalendarSelection(undefined); // Clear calendar visual selection for fresh start
  };

  // Get the final selected range for display
  const getSelectedRange = (): DateRange | undefined => {
    return calendarSelection?.from && calendarSelection?.to ? calendarSelection : undefined;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          // Reset calendar when opening
          resetCalendar();
        }
      }}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="ghost"
            className={cn(
              "w-fit max-w-60   h-8 text-small-font justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Select onValueChange={handlePresetSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select Preset" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="l_week">Last week</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="l_month">Last month</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Calendar
            key={calendarKey}
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={calendarSelection}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            disabled={(date) => isDateDisabled(date)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
