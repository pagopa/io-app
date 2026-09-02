import { IOColors, IOFontSize, IOFontWeight } from "@io-app/design-system";

export type AnimatedNumericTextProps = {
  /**
   * Spoken description of the value. The animated iOS implementation renders
   * outside the React Native text tree, so it cannot be derived automatically.
   */
  accessibilityLabel: string;
  color?: IOColors;
  /**
   * Direction the digits roll while transitioning to a new value. Only the
   * animated iOS implementation reads it.
   * @default true
   */
  countsDown?: boolean;
  /**
   * Turns the numeric value into the string to display (for example `62` → `1:02`).
   * @default String(value)
   */
  formatValue?: (value: number) => string;
  size?: IOFontSize;
  /**
   * The numeric value to render. Each change is animated on iOS.
   */
  value: number;
  weight?: IOFontWeight;
};
