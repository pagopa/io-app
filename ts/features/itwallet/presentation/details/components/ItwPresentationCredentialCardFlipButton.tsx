import { H5, IOButton, IOColors } from "@pagopa/io-app-design-system";
import { memo, useState } from "react";
import { Button, Image, StyleSheet, View } from "react-native";
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec
} from "@shopify/react-native-skia";
import I18n from "../../../../../i18n.ts";
import paypalLogoImage from "../../../../../../img/wallet/payment-methods/bpay.png";

type ItwPresentationCredentialCardFlipButtonProps = {
  isFlipped: boolean;
  handleOnPress: () => void;
  fullScreen?: boolean;
};

/**
 * This component renders the flip button for the skeumorphic credential card
 */
const ItwPresentationCredentialCardFlipButton = ({
  isFlipped,
  handleOnPress,
  fullScreen = false
}: ItwPresentationCredentialCardFlipButtonProps) => (
  <View
    style={fullScreen ? styles.fullWidthButton : styles.row}
    accessible={true}
    accessibilityLabel={I18n.t(
      "features.itWallet.presentation.credentialDetails.card.showBack"
    )}
    accessibilityRole="switch"
    accessibilityState={{ checked: isFlipped }}
  >
    <View style={styles.wrapper}>
      <StaticGradientBackground />
      <View style={styles.content}>
        <Image
          accessibilityIgnoresInvertColors
          accessible={true}
          accessibilityLabel="PayPal"
          source={paypalLogoImage}
          resizeMode="contain"
          style={styles.icon}
        />
        <H5 style={styles.text}>{I18n.t("features.itWallet.title")}</H5>
      </View>
    </View>
    <IOButton
      variant={fullScreen ? "solid" : "link"}
      label={I18n.t(
        `features.itWallet.presentation.credentialDetails.card.${
          isFlipped ? "showFront" : "showBack"
        }`
      )}
      onPress={handleOnPress}
      icon="switchCard"
      iconPosition="end"
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    width: "88%",
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "space-between"
  },
  wrapper: {
    flexDirection: "row",
    height: "100%"
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 15
  },
  text: {
    color: IOColors.white
  },
  icon: {
    width: 20,
    height: 20
  },
  fullWidthButton: {
    alignSelf: "stretch",
    marginHorizontal: "5%"
  }
});

export const MemoizedItwPresentationCredentialCardFlipButton = memo(
  ItwPresentationCredentialCardFlipButton
);

export { MemoizedItwPresentationCredentialCardFlipButton as ItwPresentationCredentialCardFlipButton };

const StaticGradientBackground = () => {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });

  return (
    <Canvas
      style={StyleSheet.absoluteFill}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <RoundedRect x={0} y={0} width={width} height={height} r={100}>
        <LinearGradient
          start={vec(0, height)}
          end={vec(width, 0)}
          colors={[
            "#0B3EE3",
            "#234FFF",
            "#436FFF",
            "#2F5EFF",
            "#1E53FF",
            "#1848F0",
            "#0B3EE3",
            "#1F4DFF",
            "#2A5CFF",
            "#1943E8",
            "#0B3EE3"
          ]}
        />
      </RoundedRect>
    </Canvas>
  );
};
