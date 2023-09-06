import * as React from "react";
import { useCallback } from "react";
import {
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import {
  IOColors,
  IOScaleValues,
  IOSpringValues,
  IOListItemIDPRadius,
  IOListItemIDPHSpacing,
  IOListItemIDPSavedVSpacing,
  IOListItemIDPVSpacing,
  IOListItemLogoMargin
} from "@pagopa/io-app-design-system";
import { WithTestID } from "../../types/WithTestID";
import { toAndroidCacheTimestamp } from "../../utils/dates";
import { makeFontStyleObject } from "../core/fonts";

type ListItemIDP = WithTestID<{
  name: string;
  localLogo: ImageSourcePropType;
  logo: ImageSourcePropType;
  saved?: boolean;
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
    paddingVertical: IOListItemIDPVSpacing,
    paddingHorizontal: IOListItemIDPHSpacing
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
    marginStart: IOListItemLogoMargin,
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

/**
 * Represents a list item for an Identity Provider (IDP).
 * It displays the IDP's name and logo and provides interaction when pressed.
 *
 * Currently if the Design System is enabled, the component returns the ListItemIDP of the @pagopa/io-app-design-system library
 * otherwise it returns the legacy component.
 *
 * @param {string} name - The name of the Identity Provider (IDP).
 * @param {string} localLogo - The local URI of the IDP's logo image (if available).
 * @param {string} logo - The URL of the IDP's logo image.
 * @param {boolean} saved - Indicates whether the IDP is saved or not.
 * @param {function} onPress - The callback function to be executed when the item is pressed.
 * @param {string} testID - The test ID for testing purposes.
 *
 * @deprecated The usage of this component is discouraged as it is being replaced by the ListItemIDP of the @pagopa/io-app-design-system library.
 *
 */
export const ListItemIDP = ({
  name,
  localLogo,
  logo,
  saved,
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
      onTouchEnd={onPressOut}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={name}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.button,
          saved && { paddingVertical: IOListItemIDPSavedVSpacing },
          animatedStyle
        ]}
      >
        <Text style={styles.idpName}>{name}</Text>
        <Image source={urlLogoIDP} style={styles.idpLogo} />
      </Animated.View>
    </Pressable>
  );
};

export default ListItemIDP;
