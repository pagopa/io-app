import {
  H6,
  IOColors,
  IODimensions,
  IODimensionScale,
  IOSkeleton,
  IOText,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View
} from "react-native";

import {
  CGN_FEATURED_OPPORTUNITIES_MAX_ITEMS,
  ResolvedCgnFeaturedOpportunity
} from "../../store/actions/merchants";

const CARD_SPACING: IODimensionScale = 8;
const CARD_PADDING: IODimensionScale = 12;
const CARD_BORDER_RADIUS = 8;
const CARD_HEIGHT = 92;
const LOGO_SIZE = 44;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    height: CARD_HEIGHT,
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: IOColors["grey-100"],
    backgroundColor: IOColors["grey-50"]
  },
  cardTextContainer: {
    flex: 1
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginLeft: CARD_SPACING,
    borderRadius: 12
  }
});

const FeaturedOpportunityCard = ({
  cardWidth,
  opportunity,
  onSelect
}: {
  cardWidth: number;
  onSelect: (opportunity: ResolvedCgnFeaturedOpportunity) => void;
  opportunity: ResolvedCgnFeaturedOpportunity;
}) => {
  const { merchant, discount } = opportunity;
  const description = discount.description ?? discount.name;
  return (
    <Pressable
      accessibilityLabel={`${merchant.name}. ${description}`}
      accessibilityRole="button"
      onPress={() => onSelect(opportunity)}
    >
      <View style={[styles.card, { width: cardWidth }]}>
        <View style={styles.cardTextContainer}>
          <H6 numberOfLines={2}>{merchant.name}</H6>
          <VSpacer size={4} />
          <IOText numberOfLines={1}>{description}</IOText>
        </View>
        {merchant.imageUrl && (
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={{ uri: merchant.imageUrl }}
            style={styles.logo}
          />
        )}
      </View>
    </Pressable>
  );
};

export const CgnFeaturedOpportunitiesSkeleton = () => (
  <View
    style={{ paddingHorizontal: IODimensions.padding.screen.default }}
    testID="CgnFeaturedOpportunitiesSkeleton"
  >
    <IOSkeleton height={24} radius={4} shape="rectangle" width="50%" />
    <VSpacer size={CARD_SPACING} />
    <IOSkeleton
      height={CARD_HEIGHT}
      radius={CARD_BORDER_RADIUS}
      shape="rectangle"
      width="100%"
    />
  </View>
);

export const CgnFeaturedOpportunities = ({
  opportunities,
  onSelect
}: {
  onSelect: (opportunity: ResolvedCgnFeaturedOpportunity) => void;
  opportunities: ReadonlyArray<ResolvedCgnFeaturedOpportunity>;
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = width - IODimensions.padding.screen.default * 2;
  const items = opportunities.slice(0, CGN_FEATURED_OPPORTUNITIES_MAX_ITEMS);

  if (items.length === 0) {
    return null;
  }

  return (
    <View testID="CgnFeaturedOpportunities">
      <View style={{ paddingHorizontal: IODimensions.padding.screen.default }}>
        <H6>{I18n.t("bonus.cgn.merchantsList.featuredOpportunities.title")}</H6>
      </View>
      <VSpacer size={CARD_SPACING} />
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: IODimensions.padding.screen.default
        }}
        data={items}
        horizontal
        ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
        keyExtractor={item => `${item.merchant.id}-${item.discount.id}`}
        renderItem={({ item }) => (
          <FeaturedOpportunityCard
            cardWidth={cardWidth}
            onSelect={onSelect}
            opportunity={item}
          />
        )}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + CARD_SPACING}
      />
    </View>
  );
};
