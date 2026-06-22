import { IOColors } from "@pagopa/io-app-design-system";
import { memo } from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { AnimatedImage } from "../../../../../components/AnimatedImage";
import { CredentialMetadata } from "../../utils/itwTypesUtils";
import { CardSide } from "./types";

type CardBackgroundProps = {
  credentialType: CredentialMetadata["credentialType"];
  side: CardSide;
};

/**
 * Renders the background of a card based on its type and side
 */
const CardBackground = ({ credentialType, side }: CardBackgroundProps) => {
  const cardAssets = assetsMap[credentialType];

  if (cardAssets === undefined) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <AnimatedImage source={cardAssets[side]} style={styles.background} />
    </View>
  );
};

type CardAssets = Record<CardSide, ImageSourcePropType>;

/**
 * Map that defines which assets to use for each credential type
 */
const assetsMap: Record<string, CardAssets> = {
  mDL: {
    front: require("../../../../../../img/features/itWallet/credential/mdl_front.png"),
    back: require("../../../../../../img/features/itWallet/credential/mdl_back.png")
  },
  EuropeanDisabilityCard: {
    front: require("../../../../../../img/features/itWallet/credential/dc_front.png"),
    back: require("../../../../../../img/features/itWallet/credential/dc_back.png")
  }
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: IOColors["grey-100"],
    borderRadius: 8
  },
  background: {
    width: "100%",
    height: "100%",
    borderRadius: 8
  }
});

const MemoizedCardBackground = memo(CardBackground);

export { MemoizedCardBackground as CardBackground };
