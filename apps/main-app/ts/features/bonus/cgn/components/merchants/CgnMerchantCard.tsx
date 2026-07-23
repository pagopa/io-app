import {
  Badge,
  H3,
  Icon,
  IOCategoryIcons,
  IOColors,
  IOSpacingScale
} from "@io-app/design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

import { WithTestID } from "../../../../../types/WithTestID";
import { CardPressableBase } from "../../../../services/common/components/CardPressableBase";

export type CgnMerchantCardProps = WithTestID<{
  accessibilityLabel?: string;
  backgroundColor: string;
  icon: IOCategoryIcons;
  isNew?: boolean;
  name: string;
  onPress?: () => void;
}>;

const cardPadding: IOSpacingScale = 16;
const cardBorderRadius = 8;
const iconSize = 32;
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
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%"
  },
  cardTitle: {
    width: "100%",
    marginBottom: cardSafeInnerSpace
  }
});

const CgnMerchantCard = ({
  onPress,
  testID,
  accessibilityLabel,
  isNew,
  backgroundColor,
  icon,
  name
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
        <H3 color="black" numberOfLines={3}>
          {name}
        </H3>
      </View>
      <View style={styles.cardFooter}>
        {isNew && (
          <Badge
            accessible={false}
            text={I18n.t("bonus.cgn.merchantsList.news")}
            variant="cgn"
          />
        )}
        <Icon color="black" name={icon} size={iconSize} />
      </View>
    </View>
  </CardPressableBase>
);

export { CgnMerchantCard };
