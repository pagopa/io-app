import { ReactNode } from "react";
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
import { useHeaderPropsByCredentialType } from "../../../common/utils/itwStyleUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils.ts";

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
  const screenReaderEnabled = useIOSelector(isScreenReaderEnabledSelector);
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const scrollTranslationY = useSharedValue(0);

  const headerProps = useHeaderPropsByCredentialType(credential.credentialType);

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
    ...headerProps
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
