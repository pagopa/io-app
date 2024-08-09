import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { SvgProps } from "react-native-svg";
import MdlFrontSvg from "../../../../../img/features/itWallet/credential/mdl_front.svg";
import MdlRearSvg from "../../../../../img/features/itWallet/credential/mdl_rear.svg";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type CredentialCardSide = "front" | "rear";

export type CredentialCardAssets = Record<
  CredentialCardSide,
  React.FC<SvgProps>
>;

export type ItwSkeumorphicCredentialCardProps = {
  credential: StoredCredential;
  side?: CredentialCardSide;
};

export const ItwSkeumorphicCredentialCard = ({
  credential,
  side = "front"
}: ItwSkeumorphicCredentialCardProps) => {
  const cardAssets = assetsMap[credential.credentialType];

  if (cardAssets === undefined) {
    return null;
  }

  const CardBackgroundSvg = cardAssets[side];

  return (
    <View style={styles.cardContainer}>
      <Animated.View style={styles.card}>
        <CardBackgroundSvg style={styles.cardBackground} />
      </Animated.View>
    </View>
  );
};

const assetsMap: Partial<Record<string, CredentialCardAssets>> = {
  [CredentialType.DRIVING_LICENSE]: {
    front: MdlFrontSvg,
    rear: MdlRearSvg
  }
};

const styles = StyleSheet.create({
  cardContainer: {
    aspectRatio: 16 / 10,
    borderRadius: 8,
    overflow: "hidden"
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  cardBackground: { height: "100%", width: "100%" }
});
