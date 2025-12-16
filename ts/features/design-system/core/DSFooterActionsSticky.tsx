import {
  FooterActions,
  FooterActionsMeasurements,
  IOColors,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useHeaderHeight } from "@react-navigation/elements";
import { Fragment, useMemo, useState } from "react";
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

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSFooterActionsSticky = () => {
  const theme = useIOTheme();

  const scrollY = useSharedValue<number>(0);

  /* We can't just use `windowHeight` from `Dimensions` because
  it doesn't count the fixed block used by `react-navigation`
  for the header */
  const { height: windowHeight } = Dimensions.get("window");
  const headerHeight = useHeaderHeight();
  const activeScreenHeight = windowHeight - headerHeight;

  /* Disambiguation:
  actionBlock:            Block element fixed at the bottom of the screen
  actionBlockPlaceholder: Block element to which the fixed action block
                          needs to be attached
  */
  type ActionBlockHeight = LayoutRectangle["height"];

  const [actionBlockHeight, setActionBlockHeight] =
    useState<ActionBlockHeight>(0);
  const [actionBlockPlaceholderY, setActionBlockPlaceholderY] =
    useState<LayoutRectangle["y"]>(0);

  const handleScroll = useAnimatedScrollHandler(({ contentOffset }) => {
    // eslint-disable-next-line functional/immutable-data
    scrollY.value = contentOffset.y;
  });

  /* Get `FooterActions` measurements from `onLayout` */
  const handleFooterActionsHeight = (values: FooterActionsMeasurements) => {
    setActionBlockHeight(values.safeBottomAreaHeight);
  };

  const getActionBlockY = (event: LayoutChangeEvent) => {
    setActionBlockPlaceholderY(event.nativeEvent.layout.y);
  };

  const actionBlockPlaceholderTopEdge = useMemo(
    () => actionBlockPlaceholderY - activeScreenHeight + actionBlockHeight,
    [actionBlockPlaceholderY, activeScreenHeight, actionBlockHeight]
  );

  const actionBlockAnimatedStyle = useAnimatedStyle(() => ({
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

  const actionBackgroundBlockAnimatedStyle = useAnimatedStyle(() => ({
    /* Avoid solid background overlap with the
       system scrollbar */
    backgroundColor:
      actionBlockPlaceholderTopEdge < scrollY.value
        ? "transparent"
        : IOColors[theme["appBackground-primary"]]
  }));

  return (
    <View style={styles.container}>
      <Animated.ScrollView onScroll={handleScroll} scrollEventThrottle={8}>
        {[...Array(9)].map((_el, i) => (
          <Fragment key={`view-${i}`}>
            <View
              style={[
                styles.block,
                { backgroundColor: IOColors[theme["appBackground-secondary"]] }
              ]}
            >
              <Text style={{ color: IOColors[theme["textBody-tertiary"]] }}>
                {`Block ${i}`}
              </Text>
            </View>
            <VSpacer size={4} />
          </Fragment>
        ))}
        {/* Action Block Placeholder: START */}
        <View
          onLayout={getActionBlockY}
          style={{
            height: actionBlockHeight,
            backgroundColor: IOColors[theme["appBackground-primary"]]
          }}
        />
        {/* Action Block Placeholder: END */}
        <View style={[styles.block, styles.footer]}>
          <Text>{`Footer`}</Text>
        </View>
      </Animated.ScrollView>
      <FooterActions
        actions={{
          type: "TwoButtons",
          primary: {
            label: "Pay button",
            onPress: onButtonPress
          },
          secondary: {
            label: "Secondary link",
            onPress: onButtonPress
          }
        }}
        animatedStyles={{
          mainBlock: actionBlockAnimatedStyle,
          background: actionBackgroundBlockAnimatedStyle
        }}
        onMeasure={handleFooterActionsHeight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  block: {
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 16 / 10
  },
  footer: {
    backgroundColor: IOColors["success-100"]
  }
});
