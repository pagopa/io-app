import React, { ReactNode, useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Tag } from "@pagopa/io-app-design-system";
import {
  ItwCredentialStatus,
  StoredCredential
} from "../../utils/itwTypesUtils";
import {
  borderColorByStatus,
  tagPropsByStatus,
  validCredentialStatuses
} from "../../utils/itwCredentialUtils";
import { CardBackground } from "./CardBackground";
import { CardData } from "./CardData";
import { FlippableCard } from "./FlippableCard";

type CardSideBaseProps = {
  status: ItwCredentialStatus;
  children: ReactNode;
};

const CardSideBase = ({ status, children }: CardSideBaseProps) => {
  const statusTagProps = tagPropsByStatus[status];
  const borderColor = borderColorByStatus[status];

  const dynamicStyle: StyleProp<ViewStyle> = {
    borderColor,
    backgroundColor: validCredentialStatuses.includes(status)
      ? undefined
      : "rgba(255,255,255,0.7)"
  };

  return (
    <View>
      {statusTagProps && (
        <View style={styles.tag}>
          <Tag {...statusTagProps} />
        </View>
      )}
      <View style={[styles.faded, dynamicStyle]} />
      {children}
    </View>
  );
};

export type ItwSkeumorphicCardProps = {
  credential: StoredCredential;
  status?: ItwCredentialStatus;
  isFlipped?: boolean;
};

const ItwSkeumorphicCard = ({
  credential,
  status = "valid",
  isFlipped = false
}: ItwSkeumorphicCardProps) => {
  const FrontSide = useMemo(
    () => (
      <CardSideBase status={status}>
        <CardBackground
          credentialType={credential.credentialType}
          side="front"
        />
        <CardData credential={credential} side="front" />
      </CardSideBase>
    ),
    [credential, status]
  );

  const BackSide = useMemo(
    () => (
      <CardSideBase status={status}>
        <CardBackground
          credentialType={credential.credentialType}
          side="back"
        />
        <CardData credential={credential} side="back" />
      </CardSideBase>
    ),
    [credential, status]
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
  },
  tag: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 20
  },
  faded: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderRadius: 8,
    zIndex: 10
  }
});

const MemoizedItwSkeumorphicCard = React.memo(ItwSkeumorphicCard);

export { MemoizedItwSkeumorphicCard as ItwSkeumorphicCard };
