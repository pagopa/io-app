/**
 * This component allows to display a carousel with rounded indicators at the bottom
 */
import { View } from "native-base";
import * as React from "react";
import { Animated, Dimensions, ScrollView, StyleSheet } from "react-native";
import variables from "../theme/variables";

type Props = {
  cards: ReadonlyArray<JSX.Element>;
};

const itemWidth = 10; // Radius of the indicators
const noWidth = 0;
const screenWidth = Dimensions.get("screen").width;

const styles = StyleSheet.create({
  track: {
    backgroundColor: variables.brandLightGray,
    overflow: "hidden",
    width: itemWidth,
    height: itemWidth,
    borderRadius: itemWidth / 2
  },

  bar: {
    backgroundColor: variables.brandPrimary,
    width: itemWidth,
    height: itemWidth
  },

  scrollView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },

  barContainer: {
    zIndex: itemWidth,
    flexDirection: "row"
  }
});

export const HorizontalScroll: React.SFC<Props> = props => {
  const animVal = new Animated.Value(0);

  const barArray = props.cards.map((_, i) => {
    const scrollBarVal = animVal.interpolate({
      inputRange: [screenWidth * (i - 1), screenWidth * (i + 1)],
      outputRange: [-itemWidth, itemWidth],
      extrapolate: "clamp"
    });

    return (
      <View
        key={`bar${i}`}
        style={[
          styles.track,
          {
            marginLeft: i === 0 ? noWidth : itemWidth
          }
        ]}
      >
        <Animated.View
          style={[
            styles.bar,
            {
              transform: [{ translateX: scrollBarVal }]
            }
          ]}
        />
      </View>
    );
  });

  return (
    <View style={styles.scrollView}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={props.cards.length}
        pagingEnabled={true}
        onScroll={Animated.event([
          { nativeEvent: { contentOffset: { x: animVal } } }
        ])}
      >
        {props.cards}
      </ScrollView>

      <View style={styles.barContainer}>{barArray}</View>
    </View>
  );
};
