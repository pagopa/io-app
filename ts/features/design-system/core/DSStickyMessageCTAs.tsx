import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";

const BUTTON_HEIGHT = 60;
const THRESHOLD = 200; // Adjust this value to your desired threshold

// const onButtonPress = () => {
//   Alert.alert("Alert", "Action triggered");
// };

export const DSStickyMessageCTAs = () => {
  const scrollY = useSharedValue(0);
  const isSticky = useSharedValue(true);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, THRESHOLD],
      [0, -THRESHOLD + BUTTON_HEIGHT],
      { extrapolateLeft: Extrapolation.CLAMP }
    );

    return {
      transform: [{ translateY }]
    };
  });

  const handleScroll = useAnimatedScrollHandler(
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      const offsetY = contentOffset.y;

      // eslint-disable-next-line functional/immutable-data
      scrollY.value = contentOffset.y;
      // eslint-disable-next-line functional/immutable-data
      isSticky.value = offsetY >= THRESHOLD;
    }
  );

  // const handleScroll = (event: {
  //   nativeEvent: { contentOffset: { y: any } };
  // }) => {
  //   const offsetY = event.nativeEvent.contentOffset.y;
  //   // eslint-disable-next-line functional/immutable-data
  //   scrollY.value = offsetY;
  //   // eslint-disable-next-line functional/immutable-data
  //   isSticky.value = offsetY <= THRESHOLD;
  // };

  return (
    <View style={styles.container}>
      <Animated.ScrollView onScroll={handleScroll} scrollEventThrottle={8}>
        {[...Array(5)].map((_el, i) => (
          <React.Fragment key={`view-${i}`}>
            <View style={styles.block}>
              <Text>Repeated text</Text>
            </View>
            <VSpacer size={4} />
          </React.Fragment>
        ))}
      </Animated.ScrollView>
      <Animated.View
        style={[
          styles.button,
          isSticky.value && styles.buttonSticky,
          buttonAnimatedStyle
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  // scrollViewContent: {
  //   paddingBottom: BUTTON_HEIGHT + 20 // Adjust for your content padding
  // },
  block: {
    backgroundColor: IOColors["grey-100"],
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 16 / 9
  },
  button: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BUTTON_HEIGHT,
    backgroundColor: IOColors["blueIO-500"],
    justifyContent: "center",
    alignItems: "center"
  },
  buttonSticky: {
    position: "relative"
  }
});
