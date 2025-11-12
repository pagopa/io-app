/* eslint-disable react-native/no-color-literals */
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  useScrollViewOffset,
  useAnimatedRef
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = 192;
const SCROLL_RANGE = 100;

const CARDS = [
  "#1E3A8A", // Dark blue
  "#2563EB", // Blue
  "#60A5FA", // Light blue
  "#F59E0B", // Orange
  "#FBBF24", // Light orange
  "#FFFFFF" // White
];

const PATTERN_SIZE = 3;
const endPattern = CARDS.slice(-PATTERN_SIZE);
const startPattern = CARDS.slice(0, PATTERN_SIZE);

const extendedCardsData = [...endPattern, ...CARDS, ...startPattern];

const cardsWithBuffer = extendedCardsData.map((colorString, index) => ({
  id: `${colorString}-${index}`,
  color: colorString
}));

export const DSITWalletBrandExploration_1 = () => {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ backgroundColor: "#F3F4F6" }}
    >
      {/* Hero Section with Cards */}
      <View style={styles.heroSection}>
        <View
          style={{
            ...styles.cardsContainer,
            transform: [{ translateY: 50 }]
          }}
        >
          {cardsWithBuffer.map((card, index) => (
            <Card
              key={card.id}
              color={card.color}
              index={index}
              scrollOffset={scrollOffset}
              totalCards={CARDS.length}
            />
          ))}
        </View>
      </View>

      {/* Scrollable Content Below */}
      <View style={styles.content}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={styles.contentItem}>
            <Animated.Text>Content Item {i + 1}</Animated.Text>
          </View>
        ))}
      </View>
    </Animated.ScrollView>
  );
};

interface CardProps {
  color: string;
  index: number;
  scrollOffset: Animated.SharedValue<number>;
  totalCards: number;
}

function Card({ color, index, scrollOffset, totalCards }: CardProps) {
  const animatedStyle = useAnimatedStyle(() => {
    // All cards use the same scroll range (0-100px)
    // Cards positioned at different X offsets, like slides in a row
    const cardOffset = (index - totalCards / 2) * 20; // Space between cards

    // Horizontal translation: cards advance from their offset position to center
    const translateX = interpolate(
      scrollOffset.value,
      [0, SCROLL_RANGE],
      [-SCREEN_WIDTH * 0.25, SCREEN_WIDTH * 0.25]
    );

    const translateY = interpolate(
      scrollOffset.value,
      [0, SCROLL_RANGE],
      [-SCREEN_WIDTH * 0.25, SCREEN_WIDTH * 0.25]
    );

    // Rotation: perspective effect based on X position
    const rotateY = interpolate(
      scrollOffset.value,
      [0, SCROLL_RANGE],
      [cardOffset > 0 ? -25 : 25, 0] // Cards on right rotate left, cards on left rotate right
    );

    // Scale: cards in back (far from center) are smaller
    const initialScale = 0.75 + (1 - Math.abs(cardOffset) / 200) * 0.25;
    const scale = interpolate(
      scrollOffset.value,
      [0, SCROLL_RANGE],
      [initialScale, 1]
    );

    return {
      // top: index * 20,
      zIndex: index + 1,
      transform: [
        { translateX: translateX + index * 35 - 100 },
        { translateY: translateY + index * 10 },
        { skewY: "-15deg" }

        // { rotateY: `${45}deg` }
        // { scale: 0.5 }
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  heroSection: {
    height: 400,
    backgroundColor: "#DDD6FE",
    justifyContent: "center",
    alignItems: "center"
  },
  cardsContainer: {
    position: "relative"
  },
  card: {
    aspectRatio: 10 / 16,
    position: "absolute",
    width: CARD_WIDTH * 0.3,
    borderRadius: 16,
    borderCurve: "continuous",
    transformOrigin: "bottom center"
  },
  content: {
    padding: 20,
    backgroundColor: "#FFFFFF"
  },
  contentItem: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 8
  }
});
