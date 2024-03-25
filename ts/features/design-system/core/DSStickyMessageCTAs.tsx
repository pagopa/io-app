import {
  ButtonLink,
  ButtonSolid,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useHeaderHeight } from "@react-navigation/elements";
import React, { useMemo, useState } from "react";
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

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSStickyMessageCTAs = () => {
  const scrollY = useSharedValue<number>(0);
  const insets = useSafeAreaInsets();

  /* We can't just use `screenHeight` from `Dimensions` because
  it doesn't count the fixed block used by `react-navigation`
  for the header */
  const { height: screenHeight } = Dimensions.get("screen");
  const headerHeight = useHeaderHeight();
  const activeScreenHeight = screenHeight - headerHeight;

  /* Disambiguation:
  actionBlock:            Block element fixed at the bottom of the screen
  actionBlockPlaceholder: Block element to which the fixed action block
                          needs to be attached
  */
  const [actionBlockHeight, setActionBlockHeight] =
    useState<LayoutRectangle["height"]>(0);
  const [actionBlockPlaceholderY, setActionBlockPlaceholderY] =
    useState<LayoutRectangle["y"]>(0);

  const handleScroll = useAnimatedScrollHandler(({ contentOffset }) => {
    // eslint-disable-next-line functional/immutable-data
    scrollY.value = contentOffset.y;
  });

  /* Get values from relative `onLayout` methods */
  const getActionBlockHeight = (event: LayoutChangeEvent) => {
    setActionBlockHeight(event.nativeEvent.layout.height);
  };

  const getActionBlockY = (event: LayoutChangeEvent) => {
    setActionBlockPlaceholderY(event.nativeEvent.layout.y);
  };

  const actionBlockPlaceholderTopEdge = useMemo(
    () => actionBlockPlaceholderY - activeScreenHeight + actionBlockHeight,
    [actionBlockPlaceholderY, activeScreenHeight, actionBlockHeight]
  );

  const actionBlockAnimatedStyle = useAnimatedStyle(() => ({
    /* Avoid solid background overlap with the
    system scrollbar */
    backgroundColor:
      actionBlockPlaceholderTopEdge < scrollY.value
        ? "transparent"
        : IOColors.white,
    /* 
    We only start translating the action block
    when it reaches the top of the placeholder
       0 = Translate is blocked
      -1 = Translate is unblocked
    */
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, actionBlockPlaceholderTopEdge - 1, actionBlockPlaceholderTopEdge],
          [0, 0, -1],
          { extrapolateLeft: Extrapolation.CLAMP }
        )
      }
    ]
  }));

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
        {/* Action Block Placeholder: START */}
        <View
          onLayout={getActionBlockY}
          style={[{ height: actionBlockHeight }, styles.actionBlockBackground]}
        />
        {/* Action Block Placeholder: END */}
        <View style={[styles.block, styles.footer]}>
          <Text>{`Footer`}</Text>
        </View>
      </Animated.ScrollView>
      <Animated.View
        onLayout={getActionBlockHeight}
        style={[
          styles.actionBlockBackground,
          styles.actionBlockPosition,
          { paddingBottom: insets.bottom },
          actionBlockAnimatedStyle
        ]}
      >
        <Text style={styles.debugText}>{`Height: ${actionBlockHeight}`}</Text>
        <ButtonSolid
          fullWidth
          accessibilityLabel="Tap to trigger test alert"
          label={"Pay button"}
          onPress={onButtonPress}
        />
        <VSpacer />
        <View style={{ alignSelf: "center" }}>
          <ButtonLink
            accessibilityLabel="Tap to trigger test alert"
            label={"Secondary link"}
            onPress={onButtonPress}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  debugText: {
    position: "absolute",
    right: 8,
    top: -16,
    color: IOColors.black,
    fontSize: 9,
    opacity: 0.75
  },
  block: {
    backgroundColor: IOColors["grey-100"],
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 16 / 9
  },
  footer: {
    backgroundColor: IOColors["success-100"]
  },
  actionBlockBackground: {
    backgroundColor: IOColors.white
  },
  actionBlockPosition: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16
  }
});
