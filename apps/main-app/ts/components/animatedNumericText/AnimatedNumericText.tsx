/**
 * Baseline implementation used on every platform but iOS.
 *
 * Jetpack Compose has no equivalent of SwiftUI's `contentTransition(.numericText)`,
 * so the value changes without a transition here. Replace this file with an
 * `AnimatedNumericText.android.tsx` if an Android-specific animation is added.
 */
export { BaselineNumericText as AnimatedNumericText } from "./BaselineNumericText";
