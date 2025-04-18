import { memo, ReactNode } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export const ReceiptFadeInOutAnimationView = memo(
  ({ children }: { children: ReactNode }) => (
    <Animated.View
      style={{ flex: 1 }}
      exiting={FadeOut.duration(200)}
      entering={FadeIn.duration(200)}
    >
      {children}
    </Animated.View>
  ),
  () => true
);
