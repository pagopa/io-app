import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import {
  Animated,
  ScrollView,
  View,
  StyleSheet,
  GestureResponderEvent,
  useColorScheme,
  useWindowDimensions
} from "react-native";
import { useIOSelector } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { trackCarousel } from "../analytics/carouselAnalytics";
import { LandingCardComponent } from "../../../components/LandingCardComponent";
import { ComponentProps } from "../../../types/react";

const styles = StyleSheet.create({
  normalDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: IOColors.greyLight,
    marginHorizontal: 4
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});

const newDsBlue = IOColors["blueIO-500"];
const newDsGrey = IOColors["grey-200"];

type CarouselProps = {
  carouselCards: ReadonlyArray<ComponentProps<typeof LandingCardComponent>>;
  dotEasterEggCallback?: () => void;
};

type CarouselDotsProps = CarouselProps & { scrollX: Animated.Value };

const CarouselDots = (props: CarouselDotsProps) => {
  const { carouselCards, dotEasterEggCallback, scrollX } = props;
  const dotTouchCount = React.useRef(0);
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const colorScheme = useColorScheme();

  const screenDimension = useWindowDimensions();
  const windowWidth = screenDimension.width;

  const blueColor =
    colorScheme === "dark"
      ? IOColors.white
      : isDesignSystemEnabled
      ? newDsBlue
      : IOColors.blue;

  return (
    <View
      importantForAccessibility="yes"
      accessibilityElementsHidden={false}
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
      {carouselCards.map((_, imageIndex) => {
        const width = scrollX.interpolate({
          inputRange: [
            windowWidth * (imageIndex - 1),
            windowWidth * imageIndex,
            windowWidth * (imageIndex + 1)
          ],
          outputRange: [8, 16, 8],
          extrapolate: "clamp"
        });
        const backgroundColor = scrollX.interpolate({
          inputRange: [
            windowWidth * (imageIndex - 1),
            windowWidth * imageIndex,
            windowWidth * (imageIndex + 1)
          ],
          outputRange: [newDsGrey, blueColor, newDsGrey],
          extrapolate: "clamp"
        });
        return (
          <Animated.View
            key={imageIndex}
            style={[styles.normalDot, { width, backgroundColor }]}
          />
        );
      })}
    </View>
  );
};

export const Carousel = React.forwardRef<View, CarouselProps>((props, ref) => {
  const { carouselCards, dotEasterEggCallback } = props;
  const screenDimension = useWindowDimensions();
  const windowWidth = screenDimension.width;
  const scrollX = React.useRef(new Animated.Value(0)).current;

  const renderCardComponents = React.useCallback(
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
