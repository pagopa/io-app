import * as React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Switch from "../../ui/Switch";
import { H4 } from "../../core/typography/H4";
import { IOStyles } from "../../core/variables/IOStyles";
import IconFont from "../../ui/IconFont";
import { IOColors } from "../../core/variables/IOColors";

type Props = {
  label: string;
  onPress: (value: boolean) => void;
  value: boolean;
  isLoading: boolean;
  isError: boolean;
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
  isLoading,
  isError,
  testID = "preference-toggle-row"
}: Props): React.ReactElement => (
  <View style={[styles.row]}>
    <View style={IOStyles.flex}>
      <H4 weight={"Regular"} color={"bluegreyDark"}>
        {label}
      </H4>
    </View>
    {!isLoading && !isError && (
      <Switch value={value} onValueChange={onPress} testID={testID} />
    )}
    {isLoading && !isError && <ActivityIndicator />}
    {!isLoading && isError && (
      <IconFont name={"io-reload"} size={20} color={IOColors.blue} />
    )}
  </View>
);

export default PreferenceToggleRow;
