import React from "react";
import { StyleSheet } from "react-native";
import { SvgProps } from "react-native-svg";
import MdlFrontSvg from "../../../../../img/features/itWallet/credential/mdl_front.svg";
import MdlRearSvg from "../../../../../img/features/itWallet/credential/mdl_rear.svg";
import { ItwFlippableCard } from "../../common/components/ItwFlippableCard";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type CredentialCardAssets = [React.FC<SvgProps>, React.FC<SvgProps>];

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

  const [CardFrontSvg, CardRearSvg] = cardAssets;

  return (
    <ItwFlippableCard
      containerStyle={styles.cardContainer}
      FrontComponent={<CardFrontSvg />}
      RearComponent={<CardRearSvg />}
      isFlipped={isFlipped}
    />
  );
};

const assetsMap: Partial<Record<string, CredentialCardAssets>> = {
  [CredentialType.DRIVING_LICENSE]: [MdlFrontSvg, MdlRearSvg]
};

const styles = StyleSheet.create({
  cardContainer: {
    aspectRatio: 16 / 10
  }
});
