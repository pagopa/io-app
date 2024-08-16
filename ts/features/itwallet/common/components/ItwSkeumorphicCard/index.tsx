import React from "react";
import {
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  View
} from "react-native";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { StoredCredential } from "../../utils/itwTypesUtils";
import CardBackground from "./CardBackground";
import CardData from "./CardData";
import FlippableCard from "./FlippableCard";

export type ItwSkeumorphicCardProps = {
  credential: StoredCredential;
  isFlipped?: boolean;
};

const ItwSkeumorphicCard = ({
  credential,
  isFlipped = false
}: ItwSkeumorphicCardProps) => {
  useDebugInfo({ data: credential.parsedCredential });

  const FrontComponent = (
    <>
      <CardBackground credentialType={credential.credentialType} side="front" />
      <CardData credential={credential} side="front" />
    </>
  );

  const BackComponent = (
    <>
      <CardBackground credentialType={credential.credentialType} side="back" />
    </>
  );

  return (
    <FlippableCard
      containerStyle={styles.card}
      FrontComponent={FrontComponent}
      BackComponent={BackComponent}
      isFlipped={isFlipped}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    aspectRatio: 16 / 10
  }
});

const MemoizedItwSkeumorphicCard = React.memo(ItwSkeumorphicCard);

export { MemoizedItwSkeumorphicCard as ItwSkeumorphicCard };
