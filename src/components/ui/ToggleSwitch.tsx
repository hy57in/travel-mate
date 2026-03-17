import * as Switch from "@radix-ui/react-switch";
import { T } from "../../tokens";

interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function ToggleSwitch({ checked, onCheckedChange }: ToggleSwitchProps) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      style={{
        width: 42, height: 25,
        backgroundColor: checked ? T.coral : T.switchOff,
        borderRadius: 50, position: "relative",
        border: "none", cursor: "pointer",
      }}
    >
      <Switch.Thumb
        style={{
          display: "block", width: 21, height: 21,
          backgroundColor: "white", borderRadius: "50%",
          transition: "transform 0.1s",
          transform: checked ? "translateX(17px)" : "translateX(2px)",
          marginTop: 2,
        }}
      />
    </Switch.Root>
  );
}
