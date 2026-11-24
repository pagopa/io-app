import { IOFontSize, IOTextProps, IOTokenColor } from "@io-app/design-system";

export type AnimatedNumericTextProps = InheritedTextProps & {
  /**
   * Direction the digits roll while transitioning to a new value. Only the
   * animated iOS implementation reads it.
   *
   * @default true
   */
  countsDown?: boolean;
  /**
   * Turns the numeric value into the string to display (for example `62` →
   * `1:02`).
   *
   * @default String(value)
   */
  formatValue?: (value: number) => string;
  /** The numeric value to render. Each change is animated on iOS. */
  value: number;
};

/**
 * The props shared with `IOText`, so both implementations behave the same way:
 * the baseline forwards them, the iOS one applies them to the SwiftUI text.
 */
type InheritedTextProps = Pick<
  IOTextProps,
  "allowFontScaling" | "maxFontSizeMultiplier" | "weight"
> & {
  /**
   * Spoken description of the value. The animated iOS implementation renders
   * outside the React Native text tree, so it cannot be derived automatically.
   */
  accessibilityLabel: NonNullable<IOTextProps["accessibilityLabel"]>;
  /** A token, as SwiftUI takes the color value itself */
  color?: IOTokenColor;
  /**
   * Restricted to the sizes of the design system, unlike `IOText`, since the
   * value is always rendered on its own.
   */
  size?: IOFontSize;
};
