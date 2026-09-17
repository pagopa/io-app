import { IOText, IOTypography, useIOTheme } from "@io-app/design-system";

import { AnimatedNumericTextProps } from "./types";

/* Typographic style the value is rendered with, shared by the platform
   implementations so the animated iOS text and the static baseline can
   never drift apart */
const { h1 } = IOTypography;

/**
 * Static rendering of the value, with no transition between changes.
 *
 * Used as the baseline on every platform but iOS, and on iOS versions where
 * SwiftUI can't animate the digits. `IOText` already applies the Bold Text and
 * font size accessibility settings.
 */
export const BaselineNumericText = ({
  accessibilityLabel,
  allowFontScaling,
  color,
  formatValue,
  maxFontSizeMultiplier,
  size = h1.size,
  value,
  weight = h1.weight
}: AnimatedNumericTextProps) => {
  const theme = useIOTheme();

  return (
    <IOText
      accessibilityLabel={accessibilityLabel}
      allowFontScaling={allowFontScaling}
      color={color ?? theme[h1.colorToken]}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      size={size}
      weight={weight}
    >
      {formatValue ? formatValue(value) : String(value)}
    </IOText>
  );
};
