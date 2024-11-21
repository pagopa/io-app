import { Tag } from "@pagopa/io-app-design-system";
import React, { ReactNode, useMemo } from "react";
import {
  AccessibilityProps,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { itwCredentialStatusSelector } from "../../../credentials/store/selectors";
import { accessibilityLabelByStatus } from "../../utils/itwAccessibilityUtils";
import {
  borderColorByStatus,
  getCredentialNameFromType,
  tagPropsByStatus,
  validCredentialStatuses
} from "../../utils/itwCredentialUtils";
import {
  ItwCredentialStatus,
  StoredCredential
} from "../../utils/itwTypesUtils";
import { CardBackground } from "./CardBackground";
import { CardData } from "./CardData";
import { FlippableCard } from "./FlippableCard";
import { CardOrientation } from "./types";

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
  isFlipped?: boolean;
  onPress?: () => void;
  orientation?: CardOrientation;
};

const ItwSkeumorphicCard = ({
  credential,
  isFlipped = false,
  onPress,
  orientation = "portrait"
}: ItwSkeumorphicCardProps) => {
  const { status = "valid" } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );

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

  const accessibilityProps = React.useMemo(
    () =>
      ({
        accessible: true,
        accessibilityLabel: `${getCredentialNameFromType(
          credential.credentialType
        )}, ${I18n.t(
          isFlipped
            ? "features.itWallet.presentation.credentialDetails.card.back"
            : "features.itWallet.presentation.credentialDetails.card.front"
        )}`,
        accessibilityValue: { text: accessibilityLabelByStatus[status] }
      } as AccessibilityProps),
    [credential.credentialType, isFlipped, status]
  );

  const card = (
    <FlippableCard
      containerStyle={[
        styles.card,
        orientation === "landscape" && styles.cardLandscape
      ]}
      FrontComponent={FrontSide}
      BackComponent={BackSide}
      isFlipped={isFlipped}
    />
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} {...accessibilityProps}>
        {card}
      </Pressable>
    );
  }

  return (
    <View {...accessibilityProps} accessibilityRole="image">
      {card}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    aspectRatio: 16 / 10.09
  },
  cardLandscape: {
    transform: [{ rotate: "90deg" }, { scale: 1.6 }]
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
