import React from "react";
import { View, StyleSheet } from "react-native";
import { View as NBView } from "native-base";
import { TranslationKeys } from "../../../../locales/locales";
import { capitalize } from "../../../utils/strings";
import I18n from "../../../i18n";
import { H4 } from "../../core/typography/H4";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import ItemSeparatorComponent from "../../ItemSeparatorComponent";

const styles = StyleSheet.create({
  row: {
    flexDirection: "column"
  },
  touchable: {
    flexDirection: "row",
    marginVertical: 24
  },
  label: {
    flex: 1
  },
  alignToRight: {
    textAlign: "right"
  }
});

type Props = {
  value: string;
  label: TranslationKeys;
  onPress: () => void;
  accessibilityLabel?: string;
};

const InformationRow = ({
  value,
  label,
  onPress,
  accessibilityLabel
}: Props) => (
  <View style={styles.row}>
    <TouchableDefaultOpacity
      onPress={onPress}
      style={styles.touchable}
      accessibilityRole={"button"}
      accessibilityLabel={accessibilityLabel}
    >
      <H4
        style={styles.label}
        ellipsizeMode={"tail"}
        numberOfLines={1}
        color={"bluegrey"}
        weight={"Regular"}
      >
        {capitalize(I18n.t(label))}
      </H4>
      <NBView hspacer={true} />
      <H4
        style={[styles.label, styles.alignToRight]}
        ellipsizeMode={"tail"}
        numberOfLines={1}
        color={"blue"}
        weight={"SemiBold"}
      >
        {value}
      </H4>
    </TouchableDefaultOpacity>
    <ItemSeparatorComponent noPadded />
  </View>
);

export default InformationRow;
