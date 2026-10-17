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
import { itwDiscoverMoreCEDSelector } from "../../../credentialsCatalogue/store/selectors";

export type CredentialCtaProps = ButtonBlockProps;

export type CredentialDiscoverMoreProps = Extract<
  IOScrollViewActions,
  { type: "TwoButtons" }
>["secondary"];

type ItwPresentationDetailsScreenBaseProps = {
  children?: ReactNode;
  credential: CredentialMetadata;
  ctaProps?: CredentialCtaProps;
  discoverMoreProps?: CredentialDiscoverMoreProps;
  headerTransparent?: boolean;
};

const scrollTriggerOffsetValue = 88;

const ItwPresentationDetailsScreenBase = ({
  credential,
  children,
  ctaProps,
  discoverMoreProps,
  headerTransparent = false
}: ItwPresentationDetailsScreenBaseProps) => {
  const screenReaderEnabled = useIOSelector(isScreenReaderEnabledSelector);
  const isEnabled = useIOSelector(itwDiscoverMoreCEDSelector);
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

  const check = (): IOScrollViewActions | undefined => {
    if (!ctaProps) {
      return undefined;
    }

    if (!isEnabled) {
      return { type: "SingleButton", primary: ctaProps };
    }

    return discoverMoreProps
      ? {
          type: "TwoButtons",
          primary: ctaProps,
          secondary: discoverMoreProps
        }
      : {
          type: "SingleButton",
          primary: ctaProps
        };
  };

  const actions: IOScrollViewActions | undefined = check();

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
