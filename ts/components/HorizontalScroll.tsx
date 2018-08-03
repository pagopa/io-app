/**
 * This component allows to display a carousel with rounded indicators at the bottom
 */
import { View } from "native-base";
import * as React from "react";
import { Animated, Dimensions, ScrollView, StyleSheet } from "react-native";
import { landingCardType } from "../screens/authentication/LandingScreen";
import variables from "../theme/variables";

export type Props = {
  cardsContent: ReadonlyArray<landingCardType> | ReadonlyArray<any>;
  cardsArray: ReadonlyArray<JSX.Element>;
};

const itemWidth = 10; // Radius of the indicators
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

export class HorizontalScroll extends React.PureComponent<Props> {
  private animVal = new Animated.Value(0);

  private getBarArray(cards: ReadonlyArray<any>) {
    const barArray: JSX.Element[] = [];

    cards.forEach((_, i) => {
      const scrollBarVal = this.animVal.interpolate({
        inputRange: [screenWidth * (i - 1), screenWidth * (i + 1)],
        outputRange: [-itemWidth, itemWidth],
        extrapolate: "clamp"
      });

      const thisBar = (
        <View
          key={`bar${i}`}
          style={[
            styles.track,
            {
              marginLeft: i === 0 ? 0 : itemWidth
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
      barArray.push(thisBar);
    });

    return barArray;
  }

  public render() {
    return (
      <View style={styles.scrollView}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={this.props.cardsContent.length}
          pagingEnabled={true}
          onScroll={Animated.event([
            { nativeEvent: { contentOffset: { x: this.animVal } } }
          ])}
        >
          {this.props.cardsArray}
        </ScrollView>

        <View style={styles.barContainer}>
          {this.getBarArray(this.props.cardsContent)}
        </View>
      </View>
    );
  }
}
