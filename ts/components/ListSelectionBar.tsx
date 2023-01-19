import React from "react";
import { View, StyleSheet } from "react-native";
import { Text as NBButtonText } from "native-base";
import I18n from "../i18n";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { IOColors } from "./core/variables/IOColors";

const styles = StyleSheet.create({
  buttonBar: {
    flexDirection: "row",
    zIndex: 1,
    justifyContent: "space-around",
    backgroundColor: IOColors.greyLight,
    padding: 5
  },
  flex2: {
    flex: 2,
    margin: 5
  },
  buttonBarCenter: {
    backgroundColor: IOColors.white
  }
});

type Props = {
  onResetSelection: () => void;
  onToggleAllSelection?: () => void;
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
      <NBButtonText>{I18n.t("global.buttons.cancel")}</NBButtonText>
    </ButtonDefaultOpacity>
    {onToggleAllSelection && (
      <ButtonDefaultOpacity
        block={true}
        bordered={true}
        style={[styles.buttonBarCenter, styles.flex2]}
        onPress={onToggleAllSelection}
        testID={"toggleAllSelection"}
      >
        <NBButtonText>
          {I18n.t(
            selectedItems === totalItems
              ? "messages.cta.deselectAll"
              : "messages.cta.selectAll"
          )}
        </NBButtonText>
      </ButtonDefaultOpacity>
    )}
    <ButtonDefaultOpacity
      block={true}
      style={styles.flex2}
      disabled={selectedItems === 0}
      onPress={onToggleSelection}
    >
      <NBButtonText>{primaryButtonText}</NBButtonText>
    </ButtonDefaultOpacity>
  </View>
);

export default ListSelectionBar;
