import { useIOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
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
import { useHeaderPropsByCredentialType } from "../../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors/index.ts";

export type CredentialCtaProps = ButtonBlockProps;

export type ItwPresentationDetailsScreenBaseProps = {
  credential: StoredCredential;
  children?: ReactNode;
  ctaProps?: CredentialCtaProps;
};

const scrollTriggerOffsetValue: number = 88;

const ItwPresentationDetailsScreenBase = ({
  credential,
  children,
  ctaProps
}: ItwPresentationDetailsScreenBaseProps) => {
  const itwFeaturesEnabled = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const toast = useIOToast();
  const scrollTranslationY = useSharedValue(0);

  const headerProps = useHeaderPropsByCredentialType(credential.credentialType);

  // Support requests for ITW credentials are temporarily disabled until
  // final release.
  const onStartSupportRequest = () => {
    if (itwFeaturesEnabled) {
      toast.info(I18n.t("features.itWallet.generic.featureUnavailable.title"));
      return false;
    }
    return true;
  };

  useHeaderSecondLevel({
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    },
    supportRequest: true,
    onStartSupportRequest,
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    ...headerProps
  });

  const actions: IOScrollViewActions | undefined = ctaProps
    ? { type: "SingleButton", primary: ctaProps }
    : undefined;

  return (
    <IOScrollView
      animatedRef={animatedScrollViewRef}
      includeContentMargins={false}
      actions={actions}
    >
      {children}
    </IOScrollView>
  );
};

export { ItwPresentationDetailsScreenBase };
