import React from "react";
import { StyleSheet, View } from "react-native";
import { getCredentialNameFromType } from "../../utils/itwCredentialUtils";
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
    <View
      accessible={true}
      accessibilityLabel={getCredentialNameFromType(credential.credentialType)}
      accessibilityHint={getCredentialNameFromType(credential.credentialType)}
      accessibilityRole="image"
    >
      <View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden={true}
      >
        <FlippableCard
          containerStyle={styles.card}
          FrontComponent={FrontSide}
          BackComponent={BackSide}
          isFlipped={isFlipped}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    aspectRatio: 16 / 10.09
  }
});

const MemoizedItwSkeumorphicCard = React.memo(ItwSkeumorphicCard);

export { MemoizedItwSkeumorphicCard as ItwSkeumorphicCard };
