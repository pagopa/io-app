import { Body, ContentWrapper } from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  withSpring,
  WithSpringConfig
} from "react-native-reanimated";

const CARDS = [
  "#034578", // Dark blue
  "#2563EB", // Blue
  "#60A5FA", // Light blue
  "#FDAE40", // Orange
  "#FFFFFF" // White
];

const SCREEN_BGs = {
  hero: "#CBD1FE",
  page: "#F2F8FF"
};

const PATTERN_SIZE = 3;
const endPattern = CARDS.slice(-PATTERN_SIZE);
const startPattern = CARDS.slice(0, PATTERN_SIZE);

const extendedCardsData = [...endPattern, ...CARDS, ...startPattern];

const cardsWithBuffer = extendedCardsData.map((colorString, index) => ({
  id: `${colorString}-${index}`,
  color: colorString
}));

export const DSItwBrandExploration = () => {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  return (
    <>
      <View
        style={{
          backgroundColor: SCREEN_BGs.hero,
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 400
        }}
      />
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ backgroundColor: SCREEN_BGs.hero }}
      >
        <View style={styles.heroSection}>
          <View style={styles.cardsContainer}>
            {cardsWithBuffer.map((card, index) => (
              <Card
                key={card.id}
                color={card.color}
                index={index}
                scrollOffset={scrollOffset}
                totalCards={cardsWithBuffer.length}
              />
            ))}
          </View>
        </View>

        {/* Scrollable Content Below */}
        <ContentWrapper
          style={{ paddingVertical: 24, backgroundColor: SCREEN_BGs.page }}
        >
          {[...Array(50)].map((_el, i) => (
            <Body key={`body-${i}`}>Repeated text</Body>
          ))}
        </ContentWrapper>
      </Animated.ScrollView>
    </>
  );
};

interface CardProps {
  color: string;
  index: number;
  totalCards: number;
  scrollOffset: SharedValue<number>;
}

const Card = ({ color, index, scrollOffset, totalCards }: CardProps) => {
  /* VISUAL PARAMETERS */
  /* The horizontal and vertical offset (in px) between successive cards,
  used to create a staggered stacking effect and simulate depth. */
  const staggeredCardOffsetX = 35;
  const staggeredCardOffsetY = 25;

  /* Number of pixels required to move the animated wave crest by one card. */
  const pixelsPerCard = 55;

  /* Spring configuration for card movements */
  const cardSpringConf: WithSpringConfig = {
    damping: 18,
    stiffness: 120
  };

  /* GAUSSIAN CURVE ATTRIBUTES */
  /* Amplitude of the curve, or the maximum vertical movement of the card */
  const curveAmplitude = 60;

  /* Sigma is the standard deviation of the Gaussian curve.
  A small value means the curve is more narrow and steep,
  a large value means the curve is more wide and flat.
  Depending on this value, the curve will move more or less cards. */
  const curveSigma = 0.8;

  /* Derived parameters */
  const center = totalCards / 2;
  const baseY = index * staggeredCardOffsetY;

  const animatedStyle = useAnimatedStyle(() => {
    const curvePeakPos = center + scrollOffset.value / pixelsPerCard;
    const distance = index - curvePeakPos;

    /* Gaussian curve formula */
    const curveFunction = Math.exp(-0.5 * Math.pow(distance / curveSigma, 2));

    /* We apply the curve amplitude to the Bell curve with negative
    value because the card needs to move up, not down. */
    const animatedWaveY = -curveAmplitude * curveFunction;

    return {
      zIndex: index + 1,
      transformOrigin: "left center",
      transform: [
        { skewY: "-15deg" },
        { translateX: index * staggeredCardOffsetX },
        { translateY: withSpring(baseY + animatedWaveY, cardSpringConf) }
      ]
    };
  });

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: color, zIndex: index + 1 },
        animatedStyle
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  heroSection: {
    height: 400
  },
  cardsContainer: {
    position: "relative",
    top: "55%",
    left: "-25%"
  },
  card: {
    aspectRatio: 9 / 16,
    position: "absolute",
    width: "30%",
    borderRadius: 16,
    borderCurve: "continuous",
    transformOrigin: "bottom center"
  }
});
