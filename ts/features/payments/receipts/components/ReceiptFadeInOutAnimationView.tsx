import * as React from "react";
import { IOStyles } from "@pagopa/io-app-design-system";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export const ReceiptFadeInOutAnimationView = React.memo(
  ({ children }: { children: React.ReactNode }) => (
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
