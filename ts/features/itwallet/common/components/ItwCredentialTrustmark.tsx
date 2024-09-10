import React from "react";
import { Easing, Pressable, StyleSheet, View } from "react-native";
import { easeGradient } from "react-native-easing-gradient";
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
import TrustmarkLogo from "../../../../../img/wallet/trustmark.svg";
import { useSpringPressScaleAnimation } from "../../../../components/ui/utils/hooks/useSpringPressScaleAnimation";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { QrCodeImage } from "../../../../components/QrCodeImage";
import { StoredCredential } from "../utils/itwTypesUtils";
import { generateTrustmarkUrl } from "../utils/itwCredentialUtils";

type ItwCredentialTrustmarkProps = WithTestID<{
  credential: StoredCredential;
}>;

const TRUSTMARK_HEIGHT = 48;

const { colors, locations } = easeGradient({
  colorStops: {
    0: { color: "#CCCCCC" },
    "0.3": { color: "#E0E0E0" },
    "0.7": { color: "#F2F2F2" },
    1: { color: "#E9E9E9" }
  },
  easing: Easing.ease,
  extraColorStopsPerTransition: 8
});

const gradientAngleCenter = { x: 0.5, y: 0.7 };

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

  return (
    <>
      <Pressable
        onPress={trustmarkBottomSheet.present}
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
            angleCenter={gradientAngleCenter}
            locations={locations}
            colors={colors}
            style={styles.gradientView}
          >
            <Caption style={styles.caption}>
              {I18n.t(
                "features.itWallet.presentation.trustmark.cta"
              ).toUpperCase()}
            </Caption>
            <TrustmarkLogo style={styles.logo} />
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
    <QrCodeImage value={generateTrustmarkUrl(credential)} />
    <VStack space={24}>
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
    height: TRUSTMARK_HEIGHT * 2,
    width: TRUSTMARK_HEIGHT * 2,
    top: "-40%",
    right: -TRUSTMARK_HEIGHT / 2
  }
});
