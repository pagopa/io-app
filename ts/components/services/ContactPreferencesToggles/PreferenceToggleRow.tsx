import * as React from "react";
import { View, StyleSheet } from "react-native";
import Switch from "../../ui/Switch";
import { H4 } from "../../core/typography/H4";
import { IOStyles } from "../../core/variables/IOStyles";

type Props = {
  label: string;
  onPress: (value: boolean) => void;
  value: boolean;
  testID?: string;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 12
  }
});

const PreferenceToggleRow = ({
  label,
  onPress,
  value,
  testID = "preference-toggle-row"
}: Props): React.ReactElement => (
  <View style={[styles.row]}>
    <View style={IOStyles.flex}>
      <H4 weight={"Regular"} color={"bluegreyDark"}>
        {label}
      </H4>
    </View>
    <Switch value={value} onValueChange={onPress} testID={testID} />
  </View>
);

export default PreferenceToggleRow;
