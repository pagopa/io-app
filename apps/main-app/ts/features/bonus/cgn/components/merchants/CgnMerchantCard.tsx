import {
  H6,
  Icon,
  IOCategoryIcons,
  IOColors,
  IODimensions,
  IODimensionScale,
  IOText
} from "@io-app/design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

import { WithTestID } from "../../../../../types/WithTestID";
import { CardPressableBase } from "../../../../services/common/components/CardPressableBase";

type CgnMerchantCardProps = WithTestID<{
  accessibilityLabel?: string;
  backgroundColor: string;
  icon: IOCategoryIcons;
  isNew?: boolean;
  name: string;
  onPress?: () => void;
  textColor: "black" | "white";
}>;

const iconSize = 32;
const cardMinHeight = 116;
const cardSafeInnerSpace: IODimensionScale = 24;
const badgeTextLetterSpacing = 0.5;
const badgeTextLineHeight = 16;
const badgeTextSize = 12;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    width: "100%",
    minHeight: cardMinHeight,
    padding: IODimensions.padding.card,
    borderRadius: IODimensions.radius.card,
    borderCurve: "continuous",
    borderWidth: IODimensions.stroke.default,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%"
  },
  cardTitle: {
    width: "100%",
    marginBottom: cardSafeInnerSpace
  },
  /** @deprecated Replace with `Badge` (see the TODO below) */
  // TODO: replace with `<Badge forceLightMode variant="cgn" />` once `Badge` supports `forceLightMode`, like `Tag`
  newsBadge: {
    alignItems: "center",
    backgroundColor: IOColors["hanPurple-100"],
    borderRadius: IODimensions.radius.badge,
    borderCurve: "continuous",
    flexDirection: "row",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: IODimensions.padding.badge.horizontal,
    paddingVertical: IODimensions.padding.badge.vertical
  },
  newsBadgeText: {
    letterSpacing: badgeTextLetterSpacing,
    textTransform: "uppercase"
  }
});

const CgnMerchantCard = ({
  onPress,
  testID,
  accessibilityLabel,
  isNew,
  backgroundColor,
  icon,
  name,
  textColor
}: CgnMerchantCardProps) => (
  <CardPressableBase
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    testID={testID ? `${testID}-pressable` : undefined}
  >
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor,
          borderColor: IOColors["hanPurple-100"]
        }
      ]}
      testID={testID}
    >
      <View style={styles.cardTitle}>
        <H6 color={textColor} numberOfLines={3}>
          {name}
        </H6>
      </View>
      <View style={styles.cardFooter}>
        {isNew && (
          <View accessible={false} style={styles.newsBadge}>
            <IOText
              color="hanPurple-500"
              lineHeight={badgeTextLineHeight}
              numberOfLines={1}
              size={badgeTextSize}
              style={styles.newsBadgeText}
              weight="Semibold"
            >
              {I18n.t("bonus.cgn.merchantsList.news")}
            </IOText>
          </View>
        )}
        <Icon color={textColor} name={icon} size={iconSize} />
      </View>
    </View>
  </CardPressableBase>
);

export { CgnMerchantCard };
