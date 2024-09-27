import React from "react";
import { Pressable, StyleSheet, View, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  WithTestID,
  Caption,
  VStack,
  Body,
  FeatureInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import Animated from "react-native-reanimated";
import I18n from "../../../../i18n";
import { useSpringPressScaleAnimation } from "../../../../components/ui/utils/hooks/useSpringPressScaleAnimation";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { QrCodeImage } from "../../../../components/QrCodeImage";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { generateTrustmarkUrl } from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { getCredentialStatus } from "../../common/utils/itwClaimsUtils";
import { itwEaaVerifierBaseUrl } from "../../../../config";
import { trackWalletCredentialShowTrustmark } from "../../analytics";

type ItwCredentialTrustmarkProps = WithTestID<{
  credential: StoredCredential;
}>;

const TRUSTMARK_HEIGHT = 48;

const linearGradient = {
  colors: ["#CCCCCC", "#F2F2F2", "#E9E9E9", "#E0E0E0"],
  locations: [0, 0.35, 0.7, 1],
  center: { x: 0.5, y: 0.7 }
};

const trustmarkEnabledCredentials = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD,
  CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
];

const shouldDisplayTrustmark = (credential: StoredCredential) =>
  trustmarkEnabledCredentials.includes(
    credential.credentialType as CredentialType
  ) && getCredentialStatus(credential) !== "expired";

export const ItwCredentialTrustmark = ({
  testID,
  credential
}: ItwCredentialTrustmarkProps) => {
  const trustmarkBottomSheet = useIOBottomSheetAutoresizableModal({
    title: I18n.t("features.itWallet.presentation.trustmark.title"),
    component: <QrCodeBottomSheetContent credential={credential} />
  });

  const { onPressIn, onPressOut, animatedScaleStyle } =
    useSpringPressScaleAnimation();

  if (!shouldDisplayTrustmark(credential)) {
    return null;
  }

  const onPressWithTrackEvent = () => {
    trackWalletCredentialShowTrustmark(credential.credential);
    trustmarkBottomSheet.present();
  };

  return (
    <>
      <Pressable
        onPress={onPressWithTrackEvent}
        testID={testID}
        accessible={true}
        accessibilityLabel={I18n.t(
          "features.itWallet.presentation.trustmark.cta"
        )}
        accessibilityRole="button"
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onTouchEnd={onPressOut}
      >
        <Animated.View style={[styles.container, animatedScaleStyle]}>
          <LinearGradient
            useAngle
            angle={1}
            angleCenter={linearGradient.center}
            locations={linearGradient.locations}
            colors={linearGradient.colors}
            style={styles.gradientView}
          >
            <Caption style={styles.caption}>
              {I18n.t(
                "features.itWallet.presentation.trustmark.cta"
              ).toUpperCase()}
            </Caption>
            <Image
              style={styles.logo}
              source={require("../../../../../img/features/itWallet/credential/trustmark.png")}
              accessibilityIgnoresInvertColors
            />
          </LinearGradient>
        </Animated.View>
      </Pressable>
      {trustmarkBottomSheet.bottomSheet}
    </>
  );
};

export const QrCodeBottomSheetContent = ({
  credential
}: {
  credential: StoredCredential;
}) => (
  <View>
    <VStack space={24}>
      <QrCodeImage
        size={170}
        value={generateTrustmarkUrl(credential, itwEaaVerifierBaseUrl)}
      />
      <Body>
        {I18n.t("features.itWallet.presentation.trustmark.usageDescription")}
      </Body>
      <FeatureInfo
        iconName="security"
        body={I18n.t("features.itWallet.presentation.trustmark.certifiedLabel")}
      />
    </VStack>
    <VSpacer size={24} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden"
  },
  gradientView: {
    height: TRUSTMARK_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 16,
    position: "relative"
  },
  caption: {
    zIndex: 10
  },
  logo: {
    zIndex: 1,
    position: "absolute",
    height: TRUSTMARK_HEIGHT * 1.65,
    width: TRUSTMARK_HEIGHT * 1.65,
    top: "-25%",
    right: -TRUSTMARK_HEIGHT / 2.7
  }
});
