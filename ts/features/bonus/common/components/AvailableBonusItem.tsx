import { Badge, Body, H6, HSpacer } from "@pagopa/io-app-design-system";

import { FunctionComponent } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { BonusAvailableContent } from "../../../../../definitions/content/BonusAvailableContent";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { getRemoteLocale } from "../../../messages/utils/messages";

export type AvailableBonusItemState = "incoming" | "active" | "completed";

type Props = {
  bonusItem: BonusAvailable;
  onPress: () => void;
  state: AvailableBonusItemState;
};

const styles = StyleSheet.create({
  listItem: {
    alignItems: "center",
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
  }
});

const renderBadge = (state: AvailableBonusItemState) => {
  switch (state) {
    case "incoming":
      return (
        <Badge variant="default" text={I18n.t("wallet.methods.comingSoon")} />
      );
    case "completed":
      return (
        <Badge
          variant="default"
          text={I18n.t("bonus.state.completed.caption")}
        />
      );
    case "active":
      return null;
  }
};

/**
 * Component to show the listItem for available bonuses list,
 * clicking the item user navigates to the request of the related bonus
 * @param props
 */
export const AvailableBonusItem: FunctionComponent<Props> = (props: Props) => {
  const { bonusItem, state } = props;
  const disabledStyle = state !== "active" ? styles.disabled : {};
  const bonusTypeLocalizedContent: BonusAvailableContent =
    bonusItem[getRemoteLocale()];

  return (
    <Pressable
      accessibilityRole="button"
      style={styles.listItem}
      onPress={props.onPress}
      testID={`AvailableBonusItem-${bonusItem.id_type}`}
    >
      <View style={styles.columnLeft}>
        <View style={[IOStyles.row, IOStyles.alignCenter, disabledStyle]}>
          <H6 color="bluegreyDark">{bonusTypeLocalizedContent.name}</H6>
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
          <Image
            accessibilityIgnoresInvertColors
            style={styles.methodImage}
            source={{ uri: bonusItem.cover }}
          />
        )}
      </View>
    </Pressable>
  );
};
