import Color from "color";
import { ReactNode, useMemo } from "react";
import Animated, {
  useAnimatedRef,
  useSharedValue
} from "react-native-reanimated";

import {
  IOScrollView,
  IOScrollViewActions
} from "../../../../../components/ui/IOScrollView.tsx";
import { ButtonBlockProps } from "../../../../../components/ui/utils/buttons.ts";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { isScreenReaderEnabledSelector } from "../../../../../store/reducers/preferences";
import { useCredentialCardConfig } from "../../../common/components/ItwCredentialCard/config.ts";
import { useItwCredentialName } from "../../../common/hooks/useItwCredentialName.ts";
import { getLegacyThemeColorByCredentialType } from "../../../common/utils/itwStyleUtils.ts";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors/index.ts";

export type CredentialCtaProps = ButtonBlockProps;

type ItwPresentationDetailsScreenBaseProps = {
  children?: ReactNode;
  credential: CredentialMetadata;
  ctaProps?: CredentialCtaProps;
  headerTransparent?: boolean;
};

const scrollTriggerOffsetValue = 88;

const ItwPresentationDetailsScreenBase = ({
  credential,
  children,
  ctaProps,
  headerTransparent = false
}: ItwPresentationDetailsScreenBaseProps) => {
  const withL3Design = useIOSelector(itwLifecycleIsITWalletValidSelector);
  // Must match the header card, which is always in light mode
  const { color } = useCredentialCardConfig(credential.credentialType, "light");
  const title = useItwCredentialName(credential.credentialType);

  const backgroundColor = withL3Design
    ? color
    : getLegacyThemeColorByCredentialType(credential.credentialType)
        .backgroundColor;
  const variant = useMemo(
    () => (Color(backgroundColor).isDark() ? "contrast" : "neutral"),
    [backgroundColor]
  );

  const screenReaderEnabled = useIOSelector(isScreenReaderEnabledSelector);
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const scrollTranslationY = useSharedValue(0);

  useHeaderSecondLevel({
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    },
    supportRequest: true,
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    transparent: headerTransparent && !screenReaderEnabled,
    ignoreAccessibilityCheck: headerTransparent,
    title,
    backgroundColor,
    variant
  });

  const actions: IOScrollViewActions | undefined = ctaProps
    ? { type: "SingleButton", primary: ctaProps }
    : undefined;

  return (
    <IOScrollView
      actions={actions}
      animatedRef={animatedScrollViewRef}
      includeContentMargins={false}
    >
      {children}
    </IOScrollView>
  );
};

export { ItwPresentationDetailsScreenBase };
