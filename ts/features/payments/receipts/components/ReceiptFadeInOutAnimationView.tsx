import { IOStyles } from "@pagopa/io-app-design-system";
import { memo, ReactNode } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export const ReceiptFadeInOutAnimationView = memo(
  ({ children }: { children: ReactNode }) => (
    <Animated.View
      style={IOStyles.flex}
      exiting={FadeOut.duration(200)}
      entering={FadeIn.duration(200)}
    >
      {children}
    </Animated.View>
  ),
  () => true
);
