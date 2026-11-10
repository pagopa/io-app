import { CgnFeaturedOpportunity } from "@io-app/api-types/generated/definitions/content/CgnFeaturedOpportunity";
import {
  H6,
  IOColors,
  IODimensions,
  IODimensionScale,
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

import { openWebUrl } from "../../../../../utils/url";

export const CGN_FEATURED_OPPORTUNITIES_MAX_ITEMS = 3;

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
    marginLeft: CARD_SPACING
  }
});

const FeaturedOpportunityCard = ({
  cardWidth,
  opportunity
}: {
  cardWidth: number;
  opportunity: CgnFeaturedOpportunity;
}) => {
  const ctaUrl = opportunity.ctaUrl;
  return (
    <Pressable
      accessibilityLabel={`${opportunity.partnerName}. ${opportunity.description}`}
      accessibilityRole={ctaUrl ? "link" : undefined}
      disabled={!ctaUrl}
      onPress={ctaUrl ? () => openWebUrl(ctaUrl) : undefined}
    >
      <View style={[styles.card, { width: cardWidth }]}>
        <View style={styles.cardTextContainer}>
          <H6 numberOfLines={2}>{opportunity.partnerName}</H6>
          <VSpacer size={4} />
          <IOText numberOfLines={1}>{opportunity.description}</IOText>
        </View>
        {opportunity.partnerLogo && (
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={{ uri: opportunity.partnerLogo }}
            style={styles.logo}
          />
        )}
      </View>
    </Pressable>
  );
};

export const CgnFeaturedOpportunities = ({
  opportunities
}: {
  opportunities: ReadonlyArray<CgnFeaturedOpportunity>;
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
        keyExtractor={(item, index) => `${item.partnerName}-${index}`}
        renderItem={({ item }) => (
          <FeaturedOpportunityCard cardWidth={cardWidth} opportunity={item} />
        )}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + CARD_SPACING}
      />
    </View>
  );
};
