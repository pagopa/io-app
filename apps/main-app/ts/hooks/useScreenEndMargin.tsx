import { IOSpacing, IOVisualCostants } from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type EndScreenSpacingValues = {
  screenEndSafeArea: number;
  screenEndMargin: number;
};

/**
 * A custom React Hook that returns two spacing values that must be applied at
 * the end of a ScrollView to prevent the content from being cut off.
 * Depending on what you need, you can set one of these two values as `paddingBottom`
 * using ScrollView's `contentContainerStyle` prop:
 * - `screenEndSafeArea`
 *    The amount of safe area without additional margins. For devices that don't have safe area
 *    boundaries (e.g. iPhone with home button) it returns a fallback value that prevents content
 *    from sticking to the bottom.
 * - `screenEndMargin`
 *    The total amount of space to add at the end of the ScrollView. It's a sum of the
 *    `screenSafeArea' value and the default `contentEndMargin' that should be applied
 *    at the end of each app screen.
 */
export const useScreenEndMargin = (): EndScreenSpacingValues => {
  const insets = useSafeAreaInsets();

  const needSafeAreaMargin = insets.bottom !== 0;

  /* We use this fallback value to ensure that the spacing
     is is consistent across all axes. */
  const fallbackSafeAreaMargin = IOVisualCostants.appMarginDefault;

  /* End content margin. If the devices don't have safe area
     boundaries, we calculate the difference to get the same spacing
     value as for devices that do have safe area boundaries. */
  const contentEndMargin: number = IOSpacing.screenEndMargin;
  const computedContentEndMargin = needSafeAreaMargin
    ? contentEndMargin
    : contentEndMargin - fallbackSafeAreaMargin;

  /* Check if the iPhone bottom handle is present.
     If not add a default margin to prevent the button
     from sticking to the bottom. */
  const screenEndSafeArea = !needSafeAreaMargin
    ? fallbackSafeAreaMargin
    : insets.bottom;

  return {
    screenEndSafeArea,
    screenEndMargin: screenEndSafeArea + computedContentEndMargin
  };
};
