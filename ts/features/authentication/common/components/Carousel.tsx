import { IOColors, useIOTheme, VSpacer } from "@pagopa/io-app-design-system";

import { ComponentProps, forwardRef, useCallback, useRef } from "react";
import {
  Animated,
  GestureResponderEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View
} from "react-native";
import { LandingCardComponent } from "../../../../components/LandingCardComponent";
import { trackCarousel } from "../analytics/carouselAnalytics";

const styles = StyleSheet.create({
  normalDot: {
    borderRadius: 20,
    borderColor: IOColors["grey-650"],
    marginHorizontal: 4
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});

export type CarouselProps = {
  carouselCards: ReadonlyArray<ComponentProps<typeof LandingCardComponent>>;
  dotEasterEggCallback?: () => void;
};

type CarouselDotsProps = CarouselProps & { scrollX: Animated.Value };

const CarouselDots = (props: CarouselDotsProps) => {
  const { carouselCards, dotEasterEggCallback, scrollX } = props;
  const dotTouchCount = useRef(0);

  const theme = useIOTheme();

  const primaryColor = IOColors[theme["interactiveElem-default"]];
  const backgroundColor = IOColors[theme["appBackground-primary"]];

  const screenDimension = useWindowDimensions();
  const windowWidth = screenDimension.width;

  const getDotsAnimationStyle = useCallback(
    (imageIndex: number) => {
      const inputRange = [
        windowWidth * (imageIndex - 1),
        windowWidth * imageIndex,
        windowWidth * (imageIndex + 1)
      ];

      return {
        width: scrollX.interpolate({
          inputRange,
          outputRange: [8, 16, 8],
          extrapolate: "clamp"
        }),
        backgroundColor: scrollX.interpolate({
          inputRange,
          outputRange: [backgroundColor, primaryColor, backgroundColor],
          extrapolate: "clamp"
        }),
        height: scrollX.interpolate({
          inputRange,
          outputRange: [8, 4, 8],
          extrapolate: "clamp"
        }),
        borderWidth: scrollX.interpolate({
          inputRange,
          outputRange: [1, 0, 1],
          extrapolate: "clamp"
        })
      };
    },
    [windowWidth, scrollX, backgroundColor, primaryColor]
  );

  return (
    <View
      importantForAccessibility="yes"
      accessibilityElementsHidden={false}
      testID="carousel-dots"
      style={styles.indicatorContainer}
      onTouchEnd={(_: GestureResponderEvent) => {
        // eslint-disable-next-line functional/immutable-data
        dotTouchCount.current++;
        if (dotTouchCount.current === 3) {
          // eslint-disable-next-line functional/immutable-data
          dotTouchCount.current = 0;
          dotEasterEggCallback?.();
        }
      }}
    >
      {carouselCards.map((_, imageIndex) => (
        <Animated.View
          key={imageIndex}
          style={[styles.normalDot, getDotsAnimationStyle(imageIndex)]}
        />
      ))}
    </View>
  );
};

export const Carousel = forwardRef<View, CarouselProps>((props, ref) => {
  const { carouselCards, dotEasterEggCallback } = props;
  const screenDimension = useWindowDimensions();
  const windowWidth = screenDimension.width;
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderCardComponents = useCallback(
    () =>
      carouselCards.map(p => (
        <LandingCardComponent
          ref={p.id === 0 ? ref : null}
          key={`card-${p.id}`}
          {...p}
        />
      )),
    [carouselCards, ref]
  );

  const cardComponents = renderCardComponents();

  return (
    <>
      <ScrollView
        horizontal={true}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollEndDrag={event => {
          const contentOffsetX = event.nativeEvent.contentOffset.x;
          const currentPageIndex = Math.round(contentOffsetX / windowWidth);
          if (
            currentPageIndex >= 0 &&
            cardComponents.length > currentPageIndex
          ) {
            trackCarousel(currentPageIndex, cardComponents);
          }
        }}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  x: scrollX
                }
              }
            }
          ],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={1}
      >
        {cardComponents}
      </ScrollView>
      <CarouselDots
        dotEasterEggCallback={dotEasterEggCallback}
        carouselCards={carouselCards}
        scrollX={scrollX}
      />
      <VSpacer size={24} />
    </>
  );
});
