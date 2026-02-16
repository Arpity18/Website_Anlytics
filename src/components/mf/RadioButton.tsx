import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupDemoProps {
  // title: string;
  options: RadioOption[];
  defaultValue?: string;
  onValueChange: (value: string) => void;
}

export function RadioButtons({ options, defaultValue, onValueChange }: RadioGroupDemoProps) {
  // Ensure options is not empty and has valid values
  if (!options || options.length === 0) {
    return null; // Or return a placeholder/error message
  }

  return (
    <div>
      {/* <h3 className="mb-4 text-lg font-medium">{title}</h3> */}
      <RadioGroup 
        defaultValue={defaultValue || (options[0]?.value || '')} 
        className="flex space-x-4"
        onValueChange={onValueChange}
      >
        {options.map((option, index) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`r${index + 1}`} />
            <Label htmlFor={`r${index + 1}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

