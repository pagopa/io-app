import { IOColors } from "@pagopa/io-app-design-system";
import React from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { AnimatedImage } from "../../../../../components/AnimatedImage";
import { StoredCredential } from "../../utils/itwTypesUtils";
import { CardSide } from "./types";

type CardBackgroundProps = {
  credentialType: StoredCredential["credentialType"];
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
  MDL: {
    front: require("../../../../../../img/features/itWallet/credential/mdl_front.png"),
    back: require("../../../../../../img/features/itWallet/credential/mdl_back.png")
  }
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: IOColors["grey-100"],
    borderRadius: 8
  },
  background: {
    width: "100%",
    height: "100%"
  }
});

const MemoizedCardBackground = React.memo(CardBackground);

export { MemoizedCardBackground as CardBackground };
