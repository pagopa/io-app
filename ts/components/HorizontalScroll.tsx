/**
 * This component allows to display a carousel with rounded indicators at the bottom
 */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import {
  View,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent
} from "react-native";
import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import variables from "../theme/variables";
import { roundToThirdDecimal } from "../utils/number";
import { trackCarousel } from "../screens/authentication/analytics/carouselAnalytics";

type Props = {
  cards: ReadonlyArray<JSX.Element>;
  onCurrentElement?: (index: number) => void;
  indexToScroll?: number;
};

const itemWidth = 10; // Radius of the indicators
const noWidth = 0;
const screenWidth = Dimensions.get("screen").width;

const styles = StyleSheet.create({
  track: {
    backgroundColor: IOColors.greyLight,
    overflow: "hidden",
    width: itemWidth,
    height: itemWidth,
    borderRadius: itemWidth / 2
  },

  bar: {
    backgroundColor: variables.brandPrimary,
    borderRadius: itemWidth / 2,
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

export const HorizontalScroll: React.FunctionComponent<Props> = (
  props: Props
) => {
  const scrollOffset =
    (props.indexToScroll ?? 0) * Dimensions.get("window").width;
  const animVal = new Animated.Value(scrollOffset);
  const scrollRef = React.useRef<ScrollView>(null);
  const { indexToScroll } = props;

  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    trackCarousel(currentIndex, props.cards);
  }, [currentIndex, props.cards]);

  React.useEffect(() => {
    pipe(
      indexToScroll,
      O.fromNullable,
      O.map(_ =>
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({
              x: scrollOffset,
              y: 0,
              animated: false
            });
          }
        }, 0)
      )
    );
  }, [scrollRef, scrollOffset, indexToScroll]);

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

  const handleScrollEvent = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    {
      const currentIndex = Platform.select({
        ios: Math.round(
          event.nativeEvent.contentOffset.x / Dimensions.get("window").width
        ),
        default: Math.round(
          roundToThirdDecimal(event.nativeEvent.contentOffset.x) /
            roundToThirdDecimal(Dimensions.get("window").width)
        )
      });
      setCurrentIndex(currentIndex);
      pipe(
        props.onCurrentElement,
        O.fromNullable,
        O.map(onCurrElement => onCurrElement(currentIndex))
      );
      Animated.event([{ nativeEvent: { contentOffset: { x: animVal } } }])(
        event
      );
    }
  };

  return (
    <View style={styles.scrollView}>
      <ScrollView
        ref={scrollRef}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={props.cards.length > 1}
        scrollEventThrottle={props.cards.length}
        pagingEnabled={true}
        onScroll={handleScrollEvent}
      >
        {props.cards}
      </ScrollView>

      {props.cards.length > 1 && (
        <View style={styles.barContainer}>{barArray}</View>
      )}
      <VSpacer size={16} />
    </View>
  );
};
