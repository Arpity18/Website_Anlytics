// // import React from "react";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { cn } from "@/lib/utils";

// // interface Item {
// //   title: string;
// //   value: string;
// // }

// // interface MFSingleSelectProps {
// //   items: Item[];
// //   placeholder?: string;
// //   title?: string;
// //   className?: string;
// //   value?: string;
// //   onValueChange?: (value: string) => void;
// // }

// // export function MFSingleSelect({
// //   items,
// //   placeholder,
// //   title,
// //   className,
// //   value,
// //   onValueChange,
// // }: MFSingleSelectProps) {
// //   return (
// //     <div className="flex flex-col gap-1">
// //       {/* {title && <p className="text-body">{title}</p>} */}
// //       <Select value={value} onValueChange={onValueChange}>
// //         <SelectTrigger className={className}>
// //           <SelectValue placeholder={items.length === 0 ? "loading..." : placeholder} />
// //         </SelectTrigger>
// //         <SelectContent>
// //           {items.map((item) => (
// //             <SelectItem key={item.value} value={item.value}>
// //               {item.title}
// //             </SelectItem>
// //           ))}
// //         </SelectContent>
// //       </Select>
// //     </div>
// //   );
// // }


// import React, { useState } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { cn } from "@/lib/utils";
// import { Input } from "@/components/ui/input";

// interface Item {
//   title: string;
//   value: string;
// }

// interface MFSingleSelectProps {
//   items: Item[];
//   placeholder?: string;
//   title?: string;
//   className?: string;
//   value?: string;
//   onValueChange?: (value: string) => void;
// }

// export function MFSingleSelect({
//   items,
//   placeholder,
//   title,
//   className,
//   value,
//   onValueChange,
// }: MFSingleSelectProps) {
//   const [searchQuery, setSearchQuery] = useState("");

//   const filteredItems = items.filter((item) =>
//     item.title && typeof item.title === 'string' && 
//     item.title.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="flex flex-col gap-1 ">
//       {/* {title && <p className="text-body">{title}</p>} */}
//       <Select value={value} onValueChange={onValueChange}>
//         <SelectTrigger className={className}>
//           <SelectValue placeholder={items.length === 0 ? "loading..." : placeholder} />
//         </SelectTrigger>
//         <SelectContent>
//           <div className="px-2 pb-2">
//             <Input
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="h-8"
//             />
//           </div>
//           {filteredItems.map((item) => (
//             <SelectItem key={item.value} value={item.value}>
//               {item.title}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>
//   );
// }



import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
 
interface Item {
  title: string;
  value: string;
}
 
interface MFSingleSelectProps {
  items: Item[];
  placeholder?: string;
  className?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  /* search state may be controlled by the parent, or we keep it internally */
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}
 
export function MFSingleSelect({
  items,
  placeholder = "Select…",
  className,
  value,
  onValueChange,
  searchQuery,
  setSearchQuery,
}: MFSingleSelectProps) {
  /* Uncontrolled (internal) search state when the parent doesn’t pass one */
  const [innerQuery, setInnerQuery] = React.useState("");
  const q = searchQuery ?? innerQuery;
  const setQ = setSearchQuery ?? setInnerQuery;
 
  /* Filter the list by the query */
  const filtered = items.filter((i) =>
(i?.title ?? "").toLowerCase().includes(q.toLowerCase())  );
 
  /* Make sure the currently‑selected item is always present */
  const selected = items.find((i) => i.value === value);
  const displayItems =
    selected && !filtered.some((i) => i.value === selected.value)
      ? [selected, ...filtered]
      : filtered;
 
  /* Ref so we can force‑focus the search box when the menu opens */
  const searchRef = React.useRef<HTMLInputElement>(null);
 
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        onValueChange?.(v);
        /* reset the query so the next open starts fresh */
        setQ("");
      }}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        requestAnimationFrame(() => searchRef.current?.focus());
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
 
      <SelectContent>
        <div className="px-2 pb-2">
          <Input
            ref={searchRef}
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="h-8"
          />
        </div>
 
        {displayItems.length ? (
          displayItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.title}
            </SelectItem>
          ))
        ) : (
          <div className="px-2 py-1 text-sm text-muted-foreground">No results</div>
        )}
      </SelectContent>
    </Select>
  );
}
 
