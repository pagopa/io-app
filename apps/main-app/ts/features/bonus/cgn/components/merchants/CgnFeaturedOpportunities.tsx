import {
  Body,
  H6,
  IOColors,
  IOSpacingScale,
  IOText,
  IOVisualCostants,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import {
  FlatList,
  Image,
  StyleSheet,
  useWindowDimensions,
  View
} from "react-native";

export type FeaturedOpportunity = {
  description: string;
  id: string;
  logoUri?: string;
  title: string;
};

export const CGN_FEATURED_OPPORTUNITIES_MAX_ITEMS = 3;

const CARD_WIDTH_RATIO = 0.8;
const CARD_SPACING: IOSpacingScale = 8;
const CARD_PADDING: IOSpacingScale = 16;
const CARD_BORDER_RADIUS = 8;
const LOGO_SIZE = 40;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: IOColors["grey-100"],
    backgroundColor: IOColors.white
  },
  cardTextContainer: {
    flex: 1
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginLeft: CARD_SPACING
  }
});

const FeaturedOpportunityCard = ({
  cardWidth,
  opportunity
}: {
  cardWidth: number;
  opportunity: FeaturedOpportunity;
}) => (
  <View style={[styles.card, { width: cardWidth }]}>
    <View style={styles.cardTextContainer}>
      <H6 numberOfLines={2}>{opportunity.title}</H6>
      <IOText numberOfLines={2}>{opportunity.description}</IOText>
    </View>
    {opportunity.logoUri && (
      <Image
        accessibilityIgnoresInvertColors
        source={{ uri: opportunity.logoUri }}
        style={styles.logo}
      />
    )}
  </View>
);

export const CgnFeaturedOpportunities = ({
  opportunities
}: {
  opportunities: ReadonlyArray<FeaturedOpportunity>;
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = width * CARD_WIDTH_RATIO;
  const items = opportunities.slice(0, CGN_FEATURED_OPPORTUNITIES_MAX_ITEMS);

  if (items.length === 0) {
    return null;
  }

  return (
    <View testID="CgnFeaturedOpportunities">
      <Body color="grey-700" weight="Semibold">
        {I18n.t("bonus.cgn.merchantsList.featuredOpportunities.title")}
      </Body>
      <VSpacer size={CARD_SPACING} />
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        data={items}
        horizontal
        ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <FeaturedOpportunityCard cardWidth={cardWidth} opportunity={item} />
        )}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + CARD_SPACING}
      />
    </View>
  );
};
