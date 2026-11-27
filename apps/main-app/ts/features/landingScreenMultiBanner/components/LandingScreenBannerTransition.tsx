import { ReactElement } from "react";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition
} from "react-native-reanimated";

import { useIOSelector } from "../../../store/hooks";
import {
  isStartupLoaded,
  StartupStatusEnum
} from "../../../store/reducers/startup";

const BANNER_TRANSITION_DURATION = 300;

export const bannerLayoutTransition = LinearTransition.duration(
  BANNER_TRANSITION_DURATION
);
const bannerEntering = FadeIn.duration(BANNER_TRANSITION_DURATION);
const bannerExiting = FadeOut.duration(BANNER_TRANSITION_DURATION / 2);

type Props = {
  children: null | ReactElement;
  /** Changing it cross-fades the previous content into the new one */
  contentKey: string;
};

export const LandingScreenBannerTransition = ({
  children,
  contentKey
}: Props) => {
  // During startup onboarding, TabNavigator covers this screen with an opaque
  // LoadingSpinnerOverlay, so the content would mount and animate out of sight.
  // Rendering is deferred until the overlay is gone, so the entrance animation
  // is visible.
  const isStartupOnboarding =
    useIOSelector(isStartupLoaded) === StartupStatusEnum.ONBOARDING;

  // The container is always mounted so its height change between skeleton,
  // banner and nothing is animated, while the keyed content cross-fades
  return (
    <Animated.View layout={bannerLayoutTransition}>
      {!isStartupOnboarding && children && (
        <Animated.View
          entering={bannerEntering}
          exiting={bannerExiting}
          key={contentKey}
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
};
