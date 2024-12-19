import { Tag, useScaleAnimation } from "@pagopa/io-app-design-system";
import { memo, ReactNode, useMemo } from "react";

import {
  AccessibilityProps,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import Animated from "react-native-reanimated";
import I18n from "../../../../../i18n";
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

export type ItwSkeumorphicCardProps = {
  credential: StoredCredential;
  status: ItwCredentialStatus;
  isFlipped?: boolean;
  onPress?: () => void;
};

const ItwSkeumorphicCard = ({
  credential,
  status,
  isFlipped = false,
  onPress
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

  const accessibilityProps = useMemo(
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
      containerStyle={[styles.card]}
      FrontComponent={FrontSide}
      BackComponent={BackSide}
      isFlipped={isFlipped}
    />
  );

  const { onPressIn, onPressOut, scaleAnimatedStyle } = useScaleAnimation();

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        {...accessibilityProps}
        accessibilityRole="button"
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={scaleAnimatedStyle}>{card}</Animated.View>
      </Pressable>
    );
  }

  return (
    <View {...accessibilityProps} accessibilityRole="image">
      {card}
    </View>
  );
};

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

// Magic number for the aspect ratio of the card
// extracted from the design
export const SKEUMORPHIC_CARD_ASPECT_RATIO = 16 / 10.09;

const styles = StyleSheet.create({
  card: {
    aspectRatio: SKEUMORPHIC_CARD_ASPECT_RATIO
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

const MemoizedItwSkeumorphicCard = memo(ItwSkeumorphicCard);

export { MemoizedItwSkeumorphicCard as ItwSkeumorphicCard };
