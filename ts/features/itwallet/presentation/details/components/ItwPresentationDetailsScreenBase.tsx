import {
  BodySmall,
  ButtonSolidProps,
  FooterActions,
  HStack,
  useFooterActionsMeasurements,
  useIOToast
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Fragment, ReactNode } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import ITWalletLogoImage from "../../../../../../img/features/itWallet/brand/itw_logo.svg";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import { useItwFeaturesEnabled } from "../../../common/hooks/useItwFeaturesEnabled.ts";
import { isItwCredential } from "../../../common/utils/itwCredentialUtils.ts";
import { useHeaderPropsByCredentialType } from "../../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";

export type CredentialCtaProps = Omit<ButtonSolidProps, "fullWidth">;

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
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const itwFeaturesEnabled = useItwFeaturesEnabled(credential);
  const toast = useIOToast();
  const scrollTranslationY = useSharedValue(0);
  const isL3Credential = isItwCredential(credential);

  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  const headerProps = useHeaderPropsByCredentialType(
    credential.credentialType,
    itwFeaturesEnabled
  );

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

  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    // eslint-disable-next-line functional/immutable-data
    scrollTranslationY.value = contentOffset.y;
  });

  return (
    <Fragment>
      <Animated.ScrollView
        ref={animatedScrollViewRef}
        contentContainerStyle={{
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight || 24
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={8}
        snapToOffsets={[0, scrollTriggerOffsetValue]}
        snapToEnd={false}
        decelerationRate="normal"
      >
        {children}
        {isL3Credential && <PoweredByItWallet />}
      </Animated.ScrollView>
      {ctaProps && (
        <FooterActions
          onMeasure={handleFooterActionsMeasurements}
          actions={{
            type: "SingleButton",
            primary: ctaProps
          }}
        />
      )}
    </Fragment>
  );
};

const PoweredByItWallet = () => (
  <HStack space={8} style={styles.poweredBy}>
    <BodySmall>
      {I18n.t("features.itWallet.presentation.credentialDetails.poweredBy")}
    </BodySmall>
    <ITWalletLogoImage width={75} height={15} accessibilityLabel="IT Wallet" />
  </HStack>
);

const styles = StyleSheet.create({
  poweredBy: {
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center"
  }
});

export { ItwPresentationDetailsScreenBase };
