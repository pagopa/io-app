import React from "react";
import { StyleSheet, View } from "react-native";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { StoredCredential } from "../../utils/itwTypesUtils";
import CardBackground from "./CardBackground";
import CardDataLayer from "./CardDataLayer";
import FlippableCard from "./FlippableCard";

export type CardProps = {
  credential: StoredCredential;
  isFlipped?: boolean;
};

const Card = ({ credential, isFlipped = false }: CardProps) => {
  useDebugInfo({ data: credential.parsedCredential });

  const FrontComponent = (
    <View>
      <CardBackground credentialType={credential.credentialType} side="front" />
      <CardDataLayer credential={credential} side="front" />
    </View>
  );

  const BackComponent = (
    <View>
      <CardBackground credentialType={credential.credentialType} side="back" />
    </View>
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

export default React.memo(Card);
