import { Badge, ListItem, Text as NBBadgeText } from "native-base";
import * as React from "react";
import { View, Image, Platform, StyleSheet } from "react-native";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { BonusAvailableContent } from "../../../../../definitions/content/BonusAvailableContent";
import I18n from "../../../../i18n";
import { getRemoteLocale } from "../../../../utils/messages";

import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { HSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";

export type AvailableBonusItemState = "incoming" | "active" | "completed";

type Props = {
  bonusItem: BonusAvailable;
  onPress: () => void;
  state: AvailableBonusItemState;
};

const styles = StyleSheet.create({
  listItem: {
    marginLeft: 0,
    paddingRight: 0,
    flexDirection: "row"
  },
  disabled: {
    opacity: 0.75
  },
  methodImage: {
    width: 48,
    height: 48,
    resizeMode: "contain"
  },
  columnLeft: {
    flex: 0.7,
    alignItems: "flex-start",
    alignContent: "center"
  },
  columnRight: {
    flex: 0.3,
    alignItems: "flex-end",
    alignContent: "center"
  },
  badge: {
    height: 18,
    backgroundColor: IOColors.grey
  },
  badgeText: {
    lineHeight: Platform.OS === "ios" ? 20 : 21
  }
});

const BonusBadge = (props: { caption: string }) => (
  // IOBadge (new style to be added)
  <Badge style={styles.badge}>
    <NBBadgeText style={styles.badgeText}>{props.caption}</NBBadgeText>
  </Badge>
);

const renderBadge = (state: AvailableBonusItemState) => {
  switch (state) {
    case "incoming":
      return <BonusBadge caption={I18n.t("wallet.methods.comingSoon")} />;
    case "completed":
      return <BonusBadge caption={I18n.t("bonus.state.completed.caption")} />;
    case "active":
      return null;
  }
};

/**
 * Component to show the listItem for available bonuses list,
 * clicking the item user navigates to the request of the related bonus
 * @param props
 */
export const AvailableBonusItem: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { bonusItem, state } = props;
  const disabledStyle = state !== "active" ? styles.disabled : {};
  const bonusTypeLocalizedContent: BonusAvailableContent =
    bonusItem[getRemoteLocale()];

  return (
    <ListItem
      style={styles.listItem}
      onPress={props.onPress}
      testID={`AvailableBonusItem-${bonusItem.id_type}`}
    >
      <View style={styles.columnLeft}>
        <View style={[IOStyles.row, IOStyles.alignCenter, disabledStyle]}>
          <H3 weight="Bold" color="bluegreyDark">
            {bonusTypeLocalizedContent.name}
          </H3>
          <HSpacer size={8} />
          {renderBadge(state)}
        </View>

        {bonusTypeLocalizedContent.description && (
          <View style={disabledStyle}>
            <Body>{bonusTypeLocalizedContent.description}</Body>
          </View>
        )}
      </View>
      <View style={[styles.columnRight, disabledStyle]}>
        {bonusItem.cover && (
          <Image style={styles.methodImage} source={{ uri: bonusItem.cover }} />
        )}
      </View>
    </ListItem>
  );
};
