// import Endpoint from "@/app/(main)/webfraud/common/endpoint";
// import { useApiCall } from "@/app/(main)/webfraud/queries/api_base";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { X } from "lucide-react";
// import { useEffect, useState } from "react";

// interface ThresholdModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   selectedItem: { id: string; label: string } | null;
//   onSave: (thresholdData: {
//     field: string;
//     operator: string;
//     value: string;
//   }) => void;
//   metricsthresholds?: Array<{ field: string; operator: string; value: string }>;
//   mode:any
// }

// const ThresholdModal = ({
//   isOpen,
//   onClose,
//   selectedItem,
//   onSave,
//   metricsthresholds,
//   mode
// }: ThresholdModalProps) => {
//   const [operatorList, setOperatorList] = useState<string[]>([]);
//   const [operator, setOperator] = useState<null | string>(null);
//   const [thresholdValue, setThresholdValue] = useState<string>("");

//   console.log("selected item .......",selectedItem)

//   const { result: thresholdApi } = useApiCall({
//     url:
//       process.env.NEXT_PUBLIC_USER_MANAGEMENT + Endpoint.REPORT_THRESHOLD_API,
//     method: "POST",
//     manual: true,
//     onSuccess: (data) => {
//       if (Array.isArray(data) && data.length > 0) {
//         setOperatorList(data);
//       }
//     },
//     onError: (error) => {
//       console.error("Error fetching threshold operators:", error);
//     },
//   });

//   useEffect(() => {
//     thresholdApi.mutate(); // Manually trigger the API call
//     if (metricsthresholds && metricsthresholds.length > 0) {
//       const initialThreshold = metricsthresholds[0];
//       setOperator(initialThreshold.operator);
//       setThresholdValue(initialThreshold.value);
//     }
//   }, [metricsthresholds]);


//   if (!isOpen) return null;

//   const handleSave = () => {
//     if (!selectedItem || !operator) return;

//     onSave({
//       field: selectedItem.id,
//       operator,
//       value: thresholdValue,
//     });

//     onClose();
//   };

//   return (
//     <div
//       className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
//       onClick={onClose}
//     >
//       <div
//         className="w-[500px] rounded-lg bg-white shadow-lg"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="p-4">
//           <div className="mb-4 flex items-center justify-between">
//             <h2 className="text-lg font-semibold">
//               Add Threshold for {selectedItem?.label}
//             </h2>
//             <X
//               className="h-4 w-4 cursor-pointer hover:text-gray-700"
//               onClick={onClose}
//             />
//           </div>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label>Operator</Label>
//               <Select value={operator} onValueChange={setOperator} disabled={mode === "view"}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select operator" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {operatorList.map((op) => (
//                     <SelectItem key={op} value={op}>
//                       {op}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label>Threshold Value</Label>
//               <Input
//                 placeholder="Enter Threshold Value"
//                 value={thresholdValue}
//                 disabled={mode === "view"}
//                 onChange={(e) => setThresholdValue(e.target.value)}
//               />
//             </div>
//           </div>
//           <div className="mt-6 flex justify-end gap-3">
//             <Button
//               onClick={onClose}
//               className="text-white bg-primary hover:bg-primary"
//               disabled={mode === "view"}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSave}
//               className="text-white bg-primary hover:bg-primary"
//               disabled={!operator || thresholdValue === "" || mode === "view"}
//             >
//               Save
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ThresholdModal;










import Endpoint from "@/app/(main)/webfraud/common/endpoint";
import { useApiCall } from "@/app/(main)/webfraud/queries/api_base";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface ThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: { id: string; label: string } | null;
  onSave: (thresholdData: {
    field: string;
    operator: string;
    value: string;
  }) => void;
  metricsthresholds?: Array<{ field: string; operator: string; value: string }>;
  mode: any;
}

const ThresholdModal = ({
  isOpen,
  onClose,
  selectedItem,
  onSave,
  metricsthresholds,
  mode,
}: ThresholdModalProps) => {
  const [operatorList, setOperatorList] = useState<string[]>([]);
  const [operatorMap, setOperatorMap] = useState<Record<string, string>>({});
  const [valueMap, setValueMap] = useState<Record<string, string>>({});

  const { result: thresholdApi } = useApiCall({
    url: process.env.NEXT_PUBLIC_USER_MANAGEMENT + Endpoint.REPORT_THRESHOLD_API,
    method: "POST",
    manual: true,
    onSuccess: (data) => {
      if (Array.isArray(data) && data.length > 0) {
        setOperatorList(data);
      }
    },
    onError: (error) => {
      console.error("Error fetching threshold operators:", error);
    },
  });

  useEffect(() => {
    thresholdApi.mutate();

    if (selectedItem && metricsthresholds) {
      const matched = metricsthresholds.find((t) => t.field === selectedItem.id);
      setOperatorMap((prev) => ({
        ...prev,
        [selectedItem.id]: matched?.operator || "",
      }));
      setValueMap((prev) => ({
        ...prev,
        [selectedItem.id]: matched?.value || "",
      }));
    }
  }, [selectedItem, metricsthresholds]);

  if (!isOpen || !selectedItem) return null;

  const currentOperator = operatorMap[selectedItem.id] || "";
  const currentValue = valueMap[selectedItem.id] || "";

  const handleSave = () => {
    if (!selectedItem || !currentOperator) return;

    onSave({
      field: selectedItem.id,
      operator: currentOperator,
      value: currentValue,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="w-[500px] rounded-lg bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Add Threshold for {selectedItem?.label}
            </h2>
            <X
              className="h-4 w-4 cursor-pointer hover:text-gray-700"
              onClick={onClose}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Operator</Label>
              <Select
                value={currentOperator}
                onValueChange={(val) =>
                  setOperatorMap((prev) => ({
                    ...prev,
                    [selectedItem.id]: val,
                  }))
                }
                disabled={mode === "view"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {operatorList.map((op) => (
                    <SelectItem key={op} value={op}>
                      {op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Threshold Value</Label>
              <Input
                placeholder="Enter Threshold Value"
                value={currentValue}
                onChange={(e) =>
                  setValueMap((prev) => ({
                    ...prev,
                    [selectedItem.id]: e.target.value,
                  }))
                }
                disabled={mode === "view"}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              onClick={onClose}
              className="text-white bg-primary hover:bg-primary"
              disabled={mode === "view"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="text-white bg-primary hover:bg-primary"
              disabled={!currentOperator || currentValue === "" || mode === "view"}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThresholdModal;

