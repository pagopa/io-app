import { View, StyleSheet } from "react-native";
import { memo, useState } from "react";
import {
  HStack,
  Body,
  Icon,
  IOButton,
  IOColors
} from "@pagopa/io-app-design-system";
import {
  Canvas,
  RoundedRect,
  vec,
  LinearGradient
} from "@shopify/react-native-skia";
import I18n from "../../../../i18n";
import { IT_WALLET_ID_LOGO } from "../utils/constants";

type Props = {
  onShow: () => void;
};

export const ItwWalletID = memo(({ onShow }: Props) => (
  <View style={styles.itwWalletID}>
    <BackgroundGradient />
    <HStack>
      <Icon name={IT_WALLET_ID_LOGO} color="blueIO-500" />
      <Body weight="Semibold" color="grey-850">
        {I18n.t("features.itWallet.walletID.title")}
      </Body>
    </HStack>
    <IOButton
      color="primary"
      variant="link"
      label={I18n.t("features.itWallet.walletID.show")}
      onPress={onShow}
    />
  </View>
));

const BackgroundGradient = () => {
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
      <RoundedRect x={0} y={0} width={width} height={height} r={8}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={[IOColors.white, IOColors.white + "00"]}
        />
      </RoundedRect>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  itwWalletID: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24
  }
});
