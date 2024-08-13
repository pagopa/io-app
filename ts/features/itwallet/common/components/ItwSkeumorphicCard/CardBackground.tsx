import React from "react";
import { ImageSourcePropType, StyleSheet } from "react-native";
import { AnimatedImage } from "../../../../../components/AnimatedImage";
import { StoredCredential } from "../../utils/itwTypesUtils";
import { CardSide } from "./types";

type CardBackgroundProps = {
  credentialType: StoredCredential["credentialType"];
  side: CardSide;
};

/**
 * Renderes the background of the card based on the credential type and the side
 */
const CardBackground = ({ credentialType, side }: CardBackgroundProps) => {
  const cardAssets = assetsMap[credentialType];

  if (cardAssets === undefined) {
    return null;
  }

  return <AnimatedImage source={cardAssets[side]} style={styles.background} />;
};

type CardAssets = Record<CardSide, ImageSourcePropType>;

/**
 * Map which defines which assets to use for each credential type
 */
const assetsMap: Record<string, CardAssets> = {
  MDL: {
    front: require("../../../../../../img/features/itWallet/credential/mdl_front.png"),
    back: require("../../../../../../img/features/itWallet/credential/mdl_back.png")
  }
};

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: "100%"
  }
});

export default React.memo(CardBackground);
