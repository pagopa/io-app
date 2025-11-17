import { Tag, useScaleAnimation } from "@pagopa/io-app-design-system";
import { memo, ReactNode, useMemo } from "react";

import I18n from "i18next";
import {
  AccessibilityProps,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import Animated from "react-native-reanimated";
import { accessibilityLabelByStatus } from "../../utils/itwAccessibilityUtils";
import {
  getCredentialNameFromType,
  tagPropsByStatus,
  useBorderColorByStatus,
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
  valuesHidden: boolean;
  isFlipped?: boolean;
  onPress?: () => void;
};

const ItwSkeumorphicCard = ({
  credential,
  status,
  isFlipped = false,
  onPress,
  valuesHidden
}: ItwSkeumorphicCardProps) => {
  const FrontSide = useMemo(
    () => (
      <CardSideBase status={status}>
        <CardBackground
          credentialType={credential.credentialType}
          side="front"
        />
        <CardData
          credential={credential}
          side="front"
          valuesHidden={valuesHidden}
        />
      </CardSideBase>
    ),
    [credential, status, valuesHidden]
  );

  const BackSide = useMemo(
    () => (
      <CardSideBase status={status}>
        <CardBackground
          credentialType={credential.credentialType}
          side="back"
        />
        <CardData
          credential={credential}
          side="back"
          valuesHidden={valuesHidden}
        />
      </CardSideBase>
    ),
    [credential, status, valuesHidden]
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
  const borderColorMap = useBorderColorByStatus();

  const statusTagProps = tagPropsByStatus[status];
  const borderColor = borderColorMap[status];
  // Include "jwtExpired" as a valid status because the credential skeumorphic card with this state
  // should not appear faded. Only the "expired" status should be displayed with reduced opacity.
  const isValid = [...validCredentialStatuses, "jwtExpired"].includes(status);

  const dynamicStyle: StyleProp<ViewStyle> = {
    borderColor,
    backgroundColor: isValid ? undefined : "rgba(255,255,255,0.7)"
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
