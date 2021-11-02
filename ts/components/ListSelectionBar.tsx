import { Text, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";

const styles = StyleSheet.create({
  buttonBar: {
    flexDirection: "row",
    zIndex: 1,
    justifyContent: "space-around",
    backgroundColor: customVariables.brandLightGray,
    padding: 10
  },
  flex2: {
    flex: 2
  },
  buttonBarCenter: {
    backgroundColor: customVariables.colorWhite,
    marginLeft: 10,
    marginRight: 10
  }
});

type Props = {
  onResetSelection: () => void;
  onToggleAllSelection: () => void;
  onToggleSelection: () => void;
  primaryButtonText: string;
  selectedItems: number;
  totalItems: number;
};

/**
 * Render a bottom bar with buttons for Cancel, Select all and Archive/Restore items.
 */
const ListSelectionBar = ({
  onToggleAllSelection,
  onToggleSelection,
  onResetSelection,
  primaryButtonText,
  selectedItems,
  totalItems
}: Props) => (
  <View style={styles.buttonBar}>
    <ButtonDefaultOpacity
      block={true}
      bordered={true}
      light={true}
      onPress={onResetSelection}
      style={styles.flex2}
    >
      <Text>{I18n.t("global.buttons.cancel")}</Text>
    </ButtonDefaultOpacity>
    <ButtonDefaultOpacity
      block={true}
      bordered={true}
      style={[styles.buttonBarCenter, styles.flex2]}
      onPress={onToggleAllSelection}
    >
      <Text>
        {I18n.t(
          selectedItems === totalItems
            ? "messages.cta.deselectAll"
            : "messages.cta.selectAll"
        )}
      </Text>
    </ButtonDefaultOpacity>
    <ButtonDefaultOpacity
      block={true}
      style={styles.flex2}
      disabled={selectedItems === 0}
      onPress={onToggleSelection}
    >
      <Text>{primaryButtonText}</Text>
    </ButtonDefaultOpacity>
  </View>
);

export default ListSelectionBar;
