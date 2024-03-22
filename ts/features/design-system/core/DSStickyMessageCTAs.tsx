import {
  ButtonSolid,
  IOColors,
  VSpacer,
  hexToRgba
} from "@pagopa/io-app-design-system";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THRESHOLD = 200; // Adjust this value to your desired threshold

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const { height: screenHeight } = Dimensions.get("screen");

type FooterLayout = {
  y: LayoutRectangle["y"];
  height: LayoutRectangle["height"];
};

export const DSStickyMessageCTAs = () => {
  const [footerLayout, setFooterLayout] = useState<FooterLayout>({
    y: 0,
    height: 0
  });
  const scrollY = useSharedValue(0);

  const insets = useSafeAreaInsets();

  const layoutMeasurementHeight = useSharedValue(0);
  const contentSizeHeight = useSharedValue(0);

  const getFooterLayout = (event: LayoutChangeEvent) => {
    const { height, y } = event.nativeEvent.layout;
    setFooterLayout({ height, y });
  };

  const topEdge = footerLayout?.y - screenHeight + footerLayout?.height;

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, contentSizeHeight.value - layoutMeasurementHeight.value],
      [0, -THRESHOLD],
      { extrapolateLeft: Extrapolation.CLAMP }
    );

    return {
      transform: [
        {
          translateY
        }
      ]
    };
  });

  const handleScroll = useAnimatedScrollHandler(
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      // eslint-disable-next-line functional/immutable-data
      scrollY.value = contentOffset.y;
      // eslint-disable-next-line functional/immutable-data
      layoutMeasurementHeight.value = layoutMeasurement.height;
      // eslint-disable-next-line functional/immutable-data
      contentSizeHeight.value = contentSize.height;
      // eslint-disable-next-line functional/immutable-data
      // isSticky.value = offsetY >= THRESHOLD;
    }
  );

  return (
    <View style={styles.container}>
      <Animated.ScrollView onScroll={handleScroll} scrollEventThrottle={8}>
        {[...Array(9)].map((_el, i) => (
          <React.Fragment key={`view-${i}`}>
            <View style={styles.block}>
              <Text>{`Block ${i}`}</Text>
            </View>
            <VSpacer size={4} />
          </React.Fragment>
        ))}
        <View
          style={{
            height: footerLayout?.height,
            backgroundColor: hexToRgba(IOColors.black, 0.25)
          }}
        />
        <View style={[styles.block, styles.footer]}>
          <Text>{`Footer`}</Text>
        </View>
      </Animated.ScrollView>
      <Animated.View
        style={[
          styles.button,
          { paddingBottom: insets.bottom },
          buttonAnimatedStyle
        ]}
        onLayout={getFooterLayout}
      >
        <Text
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            color: IOColors.white
          }}
        >
          {footerLayout?.height}
        </Text>
        <ButtonSolid
          fullWidth
          accessibilityLabel="Tap to trigger test alert"
          label={"Pay button"}
          onPress={onButtonPress}
        />
        {/* <VSpacer />
        <ButtonLink
          accessibilityLabel="Tap to trigger test alert"
          label={"Secondary link"}
          onPress={onButtonPress}
        /> */}
      </Animated.View>
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
  footer: {
    backgroundColor: IOColors["success-100"]
  },
  button: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: IOColors.black,
    paddingHorizontal: 24,
    paddingVertical: 16
  }
});
