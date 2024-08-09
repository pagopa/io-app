import React from "react";
import { ImageSourcePropType, StyleSheet } from "react-native";
import { AnimatedImage } from "../../../../components/AnimatedImage";
import { ItwFlippableCard } from "../../common/components/ItwFlippableCard";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type CredentialCardAssets = [ImageSourcePropType, ImageSourcePropType];

export type ItwSkeumorphicCredentialCardProps = {
  credential: StoredCredential;
  isFlipped?: boolean;
};

export const ItwSkeumorphicCredentialCard = ({
  credential,
  isFlipped = false
}: ItwSkeumorphicCredentialCardProps) => {
  const cardAssets = assetsMap[credential.credentialType];

  if (cardAssets === undefined) {
    // This should never happen, but we need to ass this check until we have the final assets list
    return null;
  }

  return (
    <ItwFlippableCard
      containerStyle={styles.cardContainer}
      FrontComponent={
        <AnimatedImage source={cardAssets[0]} style={styles.card} />
      }
      RearComponent={
        <AnimatedImage source={cardAssets[1]} style={styles.card} />
      }
      isFlipped={isFlipped}
    />
  );
};

const assetsMap: Partial<Record<string, CredentialCardAssets>> = {
  [CredentialType.DRIVING_LICENSE]: [
    require("../../../../../img/features/itWallet/credential/mdl_front.png"),
    require("../../../../../img/features/itWallet/credential/mdl_rear.png")
  ]
};

const styles = StyleSheet.create({
  cardContainer: {
    aspectRatio: 16 / 10
  },
  card: {
    width: "100%",
    height: "100%"
  }
});
