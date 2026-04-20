import { cn } from "@lib/cn";
import { Button } from "heroui-native";
import type { ReactNode } from "react";
import type { GestureResponderEvent } from "react-native";
import { tv } from "tailwind-variants";
import { useCSSVariable } from "uniwind";

type Tone = "primary" | "soft" | "ghost";

interface KawaiiButtonProps {
  label: ReactNode;
  tone?: Tone;
  className?: string;
  isDisabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

const root = tv({
  base: "rounded-full items-center justify-center",
  variants: {
    tone: {
      primary: "bg-primary",
      soft: "bg-overlay-soft border border-border-soft",
      ghost: "bg-transparent border border-border",
    },
  },
});

const label = tv({
  base: "font-extrabold",
  variants: {
    tone: {
      primary: "text-white text-[17px]",
      soft: "text-foreground text-base",
      ghost: "text-foreground-secondary text-base",
    },
  },
});

export function KawaiiButton({
  label: labelContent,
  tone = "primary",
  className,
  isDisabled,
  ...rest
}: KawaiiButtonProps) {
  const shadowColor = useCSSVariable("--color-primary") as string;

  const style = {
    paddingVertical: 10,
    ...(tone === "primary" && !isDisabled
      ? {
          shadowColor,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 8,
        }
      : {}),
  };

  return (
    <Button
      {...rest}
      isDisabled={isDisabled}
      className={cn(root({ tone }), isDisabled && "opacity-50", className)}
      style={style}
    >
      <Button.Label className={label({ tone })}>{labelContent}</Button.Label>
    </Button>
  );
}
