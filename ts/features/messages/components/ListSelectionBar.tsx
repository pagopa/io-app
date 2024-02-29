import React from "react";
import { View, StyleSheet } from "react-native";
import {
  ButtonOutline,
  ButtonSolid,
  IOColors
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";

const styles = StyleSheet.create({
  buttonBar: {
    flexDirection: "row",
    zIndex: 1,
    justifyContent: "space-around",
    backgroundColor: IOColors.greyLight,
    padding: 5
  },
  flex: {
    flex: 1,
    margin: 5
  }
});

type Props = {
  onResetSelection: () => void;
  onToggleSelection: () => void;
  primaryButtonText: string;
  selectedItems: number;
  totalItems: number;
};

/**
 * Render a bottom bar with buttons for Cancel, Select all and Archive/Restore items.
 */
const ListSelectionBar = ({
  onToggleSelection,
  onResetSelection,
  primaryButtonText,
  selectedItems,
  totalItems
}: Props) => (
  <View style={styles.buttonBar}>
    <View style={styles.flex}>
      <ButtonOutline
        fullWidth={true}
        label={I18n.t("global.buttons.cancel")}
        accessibilityLabel={I18n.t("global.buttons.cancel")}
        onPress={onResetSelection}
      />
    </View>
    <View style={styles.flex}>
      <ButtonSolid
        fullWidth={true}
        label={primaryButtonText}
        onPress={onToggleSelection}
        disabled={selectedItems === 0}
        accessibilityLabel={primaryButtonText}
      />
    </View>
  </View>
);

export default ListSelectionBar;
