import React from "react";
import { StyleSheet } from "react-native";
import { StoredCredential } from "../../utils/itwTypesUtils";
import { CardBackground } from "./CardBackground";
import { CardData } from "./CardData";
import { FlippableCard } from "./FlippableCard";

export type ItwSkeumorphicCardProps = {
  credential: StoredCredential;
  isFlipped?: boolean;
};

const ItwSkeumorphicCard = ({
  credential,
  isFlipped = false
}: ItwSkeumorphicCardProps) => {
  const FrontSide = (
    <>
      <CardBackground credentialType={credential.credentialType} side="front" />
      <CardData credential={credential} side="front" />
    </>
  );

  const BackSide = (
    <>
      <CardBackground credentialType={credential.credentialType} side="back" />
      <CardData credential={credential} side="back" />
    </>
  );

  return (
    <FlippableCard
      containerStyle={styles.card}
      FrontComponent={FrontSide}
      BackComponent={BackSide}
      isFlipped={isFlipped}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    aspectRatio: 16 / 10.09
  }
});

const MemoizedItwSkeumorphicCard = React.memo(ItwSkeumorphicCard);

export { MemoizedItwSkeumorphicCard as ItwSkeumorphicCard };
