import {
  IOSpacingScale,
  IOVisualCostants,
  buttonSolidHeight
} from "@pagopa/io-app-design-system";
import React from "react";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { getHeaderPropsByCredentialType } from "../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

type ItwPresentationDetailsScreenBaseProps = {
  credential: StoredCredential;
  children?: React.ReactNode;
};

const scrollTriggerOffsetValue: number = 88;
const contentEndMargin: IOSpacingScale = 32;

const ItwPresentationDetailsScreenBase = ({
  credential,
  children
}: ItwPresentationDetailsScreenBaseProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const scrollTranslationY = useSharedValue(0);

  const bottomMargin: number = React.useMemo(
    () =>
      safeAreaInsets.bottom === 0
        ? IOVisualCostants.appMarginDefault
        : safeAreaInsets.bottom,
    [safeAreaInsets]
  );

  const safeBottomAreaHeight: number = React.useMemo(
    () => bottomMargin + buttonSolidHeight + contentEndMargin,
    [bottomMargin]
  );

  const headerProps = getHeaderPropsByCredentialType(credential.credentialType);

  useHeaderSecondLevel({
    transparent: true,
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    },
    supportRequest: true,
    ...headerProps
  });

  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    // eslint-disable-next-line functional/immutable-data
    scrollTranslationY.value = contentOffset.y;
  });

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingBottom: safeBottomAreaHeight
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      snapToOffsets={[0, scrollTriggerOffsetValue]}
      snapToEnd={false}
      decelerationRate="normal"
    >
      {children}
    </Animated.ScrollView>
  );
};

export { ItwPresentationDetailsScreenBase };
