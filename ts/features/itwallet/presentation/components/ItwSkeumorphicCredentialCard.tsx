import { hexToRgba, IOColors } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { SvgProps } from "react-native-svg";
import MdlFrontSvg from "../../../../../img/features/itWallet/credential/mdl_front.svg";
import MdlRearSvg from "../../../../../img/features/itWallet/credential/mdl_rear.svg";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type CredentialCardAssets = [React.FC<SvgProps>, React.FC<SvgProps>];

export type ItwSkeumorphicCredentialCardProps = {
  credential: StoredCredential;
  isFlipped?: boolean;
};

export const ItwSkeumorphicCredentialCard = (
  props: ItwSkeumorphicCredentialCardProps
) => {
  const duration = 500;
  const cardAssets = assetsMap[props.credential.credentialType];
  const isFlipped = useSharedValue(props.isFlipped);
  const shadowColor = hexToRgba(IOColors.black, 0.15);

  React.useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    isFlipped.value = props.isFlipped;
  }, [isFlipped, props]);

  const regularCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });
    const scaleValue = withSequence(
      withTiming(1.05, { duration: duration / 2 }),
      withTiming(1, { duration: duration / 2 })
    );
    const shadowOpacityValue = withSequence(
      withTiming(0.8, { duration: duration / 2 }),
      withTiming(0, { duration: duration / 2 })
    );

    return {
      transform: [{ rotateY: rotateValue }, { scale: scaleValue }],
      // Shadow styles must be applied only to one card face in order to avoid a "double" shadow
      shadowColor,
      shadowOpacity: shadowOpacityValue,
      shadowRadius: 8
    };
  });

  const flippedCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });
    const scaleValue = withSequence(
      withTiming(1.05, { duration: 250 }),
      withTiming(1, { duration: 250 })
    );

    return {
      transform: [{ rotateY: rotateValue }, { scale: scaleValue }]
    };
  });

  if (cardAssets === undefined) {
    // This should never happen, but we need to ass this check until we have the final assets list
    return null;
  }

  const [CardFrontSvg, CardRearSvg] = cardAssets;

  return (
    <View style={styles.cardContainer}>
      <Animated.View
        style={[styles.card, styles.regularCard, regularCardAnimatedStyle]}
      >
        <CardFrontSvg />
      </Animated.View>
      <Animated.View
        style={[styles.card, styles.flippedCard, flippedCardAnimatedStyle]}
      >
        <CardRearSvg />
      </Animated.View>
    </View>
  );
};

const assetsMap: Partial<Record<string, CredentialCardAssets>> = {
  [CredentialType.DRIVING_LICENSE]: [MdlFrontSvg, MdlRearSvg]
};

const styles = StyleSheet.create({
  cardContainer: {
    aspectRatio: 16 / 10,
    borderRadius: 8
  },
  card: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  regularCard: {
    zIndex: 1
  },
  flippedCard: {
    backfaceVisibility: "hidden",
    zIndex: 2
  }
});
