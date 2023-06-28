import * as React from "react";
import { useCallback } from "react";
import {
  StyleSheet,
  Pressable,
  GestureResponderEvent,
  Platform,
  Image,
  Text,
  ImageSourcePropType
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import { IOColors } from "../core/variables/IOColors";
import { IOSpringValues, IOScaleValues } from "../core/variables/IOAnimations";
import { IOListItemIDPRadius } from "../core/variables/IOShapes";
import { WithTestID } from "../../types/WithTestID";
import { toAndroidCacheTimestamp } from "../../utils/dates";
import { makeFontStyleObject } from "../core/fonts";

type ListItemIDP = WithTestID<{
  name: string;
  localLogo: ImageSourcePropType;
  logo: ImageSourcePropType;
  onPress: (event: GestureResponderEvent) => void;
}>;

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: IOColors["grey-100"],
    borderRadius: IOListItemIDPRadius,
    backgroundColor: IOColors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  idpName: {
    color: IOColors["grey-700"],
    fontSize: 12,
    lineHeight: 16,
    alignSelf: "center",
    textTransform: "uppercase",
    flexShrink: 1,
    ...makeFontStyleObject("Regular", false, "ReadexPro")
  },
  idpLogo: {
    width: 120,
    height: 30,
    resizeMode: "contain"
  }
});

// https://github.com/facebook/react-native/issues/12606
// Image cache forced refresh for Android by appending
// the `ts` query parameter as DDMMYYYY to simulate a 24h TTL.
const androidIdpLogoForcedRefreshed = () =>
  Platform.OS === "android" ? `?ts=${toAndroidCacheTimestamp()}` : "";

export const ListItemIDP = ({
  name,
  localLogo,
  logo,
  onPress,
  testID
}: ListItemIDP) => {
  const isPressed: Animated.SharedValue<number> = useSharedValue(0);

  // Scaling transformation applied when the button is pressed
  const animationScaleValue = IOScaleValues?.magnifiedButton?.pressedState;

  const scaleTraversed = useDerivedValue(() =>
    withSpring(isPressed.value, IOSpringValues.button)
  );

  // Interpolate animation values from `isPressed` values
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scaleTraversed.value,
      [0, 1],
      [1, animationScaleValue],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

  const onPressIn = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 1;
  }, [isPressed]);
  const onPressOut = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isPressed.value = 0;
  }, [isPressed]);

  const urlLogoIDP = localLogo
    ? localLogo
    : {
        uri: `${logo}${androidIdpLogoForcedRefreshed()}`
      };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={name}
      testID={testID}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text style={styles.idpName}>{name}</Text>
        <Image source={urlLogoIDP} style={styles.idpLogo} />
      </Animated.View>
    </Pressable>
  );
};

export default ListItemIDP;
