import { IOVisualCostants } from "@pagopa/io-app-design-system";
import { memo, ReactNode } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export const ReceiptFadeInOutAnimationView = memo(
  ({ children }: { children: ReactNode }) => (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={{
        flex: 1,
        // for swipe actions visual effect
        marginHorizontal: IOVisualCostants.appMarginDefault * -1
      }}
    >
      {children}
    </Animated.View>
  ),
  () => true
);
