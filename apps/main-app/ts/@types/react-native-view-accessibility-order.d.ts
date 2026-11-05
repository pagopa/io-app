import "react-native";

/**
 * React Native supports `experimental_accessibilityOrder` since 0.80, but only
 * declares it in the strict API typings (`types_generated`), not in the legacy
 * ones the app compiles against. On Android it is ignored unless the
 * `enableAccessibilityOrder` feature flag is enabled.
 */
declare module "react-native" {
  interface ViewProps {
    /** `nativeID`s of the descendants, in the order screen readers focus them */
    experimental_accessibilityOrder?: ReadonlyArray<string>;
  }
}
