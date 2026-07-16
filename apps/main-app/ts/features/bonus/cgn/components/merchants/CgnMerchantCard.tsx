import {
  Badge,
  H4,
  Icon,
  IOCategoryIcons,
  IOSpacingScale,
  useIOTheme
} from "@io-app/design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

import { WithTestID } from "../../../../../types/WithTestID";
import { CardPressableBase } from "../../../../services/common/components/CardPressableBase";

export type CgnMerchantCardProps = WithTestID<{
  accessibilityLabel?: string;
  icon: IOCategoryIcons;
  iconBackgroundColor: string;
  iconColor: "black" | "white";
  isNew?: boolean;
  name: string;
  onPress?: () => void;
}>;

const cardPadding: IOSpacingScale = 16;
const cardBorderRadius = 8;
const iconSize = 32;
const iconContainerSize = 56;
const cardMinHeight = 120;
const cardSafeInnerSpace: IOSpacingScale = 24;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    width: "100%",
    minHeight: cardMinHeight,
    padding: cardPadding,
    borderRadius: cardBorderRadius,
    borderCurve: "continuous",
    borderWidth: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%"
  },
  iconContainer: {
    width: iconContainerSize,
    height: iconContainerSize,
    borderRadius: cardBorderRadius,
    alignItems: "center",
    justifyContent: "center"
  },
  cardTitle: {
    width: "100%",
    marginTop: cardSafeInnerSpace
  }
});

const CgnMerchantCard = ({
  onPress,
  testID,
  accessibilityLabel,
  isNew,
  icon,
  iconBackgroundColor,
  iconColor,
  name
}: CgnMerchantCardProps) => {
  const theme = useIOTheme();

  return (
    <CardPressableBase
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      testID={`${testID}-pressable`}
    >
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: theme["appBackground-primary"],
            borderColor: theme["divider-default"]
          }
        ]}
        testID={testID}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconBackgroundColor }
            ]}
          >
            <Icon color={iconColor} name={icon} size={iconSize} />
          </View>
          {isNew && (
            <Badge
              accessible={false}
              text={I18n.t("bonus.cgn.merchantsList.news")}
              variant="cgn"
            />
          )}
        </View>
        <View style={styles.cardTitle}>
          <H4
            color={theme["textHeading-default"]}
            lineBreakMode="head"
            numberOfLines={3}
          >
            {name}
          </H4>
        </View>
      </View>
    </CardPressableBase>
  );
};

export { CgnMerchantCard };
