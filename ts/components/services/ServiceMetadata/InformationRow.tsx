import React from "react";
import { View, StyleSheet } from "react-native";
import { TranslationKeys } from "../../../../locales/locales";
import { capitalize } from "../../../utils/strings";
import I18n from "../../../i18n";
import { H4 } from "../../core/typography/H4";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import ItemSeparatorComponent from "../../ItemSeparatorComponent";
import { HSpacer } from "../../core/spacer/Spacer";

const styles = StyleSheet.create({
  touchable: {
    flexDirection: "row",
    marginVertical: 16
  },
  value: {
    flexGrow: 1,
    flexShrink: 1,
    textAlign: "right"
  }
});

type Props = {
  value: string;
  label: TranslationKeys;
  onPress: () => void;
  isLast?: boolean;
  accessibilityLabel?: string;
};

const InformationRow = ({
  value,
  label,
  onPress,
  isLast,
  accessibilityLabel
}: Props) => (
  <View>
    <TouchableDefaultOpacity
      onPress={onPress}
      style={styles.touchable}
      accessibilityRole={"button"}
      accessibilityLabel={accessibilityLabel}
    >
      <H4 numberOfLines={1} color={"bluegrey"} weight={"Regular"}>
        {capitalize(I18n.t(label))}
      </H4>
      <HSpacer size={16} />
      <H4
        style={styles.value}
        numberOfLines={1}
        ellipsizeMode="tail"
        color={"blue"}
        weight={"SemiBold"}
      >
        {value}
      </H4>
    </TouchableDefaultOpacity>
    {!isLast && <ItemSeparatorComponent noPadded />}
  </View>
);

export default InformationRow;
