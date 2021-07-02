import * as React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Switch from "../../ui/Switch";
import { H4 } from "../../core/typography/H4";
import { IOStyles } from "../../core/variables/IOStyles";
import IconFont from "../../ui/IconFont";
import { IOColors } from "../../core/variables/IOColors";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import I18n from "../../../i18n";

type Props = {
  label: string;
  onPress: (value: boolean) => void;
  value: boolean;
  isLoading: boolean;
  isError: boolean;
  onReload: () => void;
  disabled?: boolean;
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
  onReload,
  disabled,
  testID = "preference-toggle-row"
}: Props): React.ReactElement => (
  <View style={[styles.row]}>
    <View style={IOStyles.flex}>
      <H4
        weight={"Regular"}
        color={"bluegreyDark"}
        testID={`${testID}-label`}
        accessibilityRole={"text"}
      >
        {label}
      </H4>
    </View>
    {!isLoading && !isError && (
      <Switch
        value={value}
        onValueChange={onPress}
        testID={testID}
        disabled={disabled}
        accessibilityRole={"switch"}
        accessibilityState={{ checked: value, disabled }}
      />
    )}
    {isLoading && !isError && (
      <ActivityIndicator
        testID={`${testID}-loading`}
        accessibilityLabel={I18n.t("global.remoteStates.loading")}
      />
    )}
    {!isLoading && isError && (
      <TouchableDefaultOpacity
        onPress={onReload}
        testID={`${testID}-reload`}
        accessibilityRole={"button"}
        accessibilityLabel={I18n.t("global.accessibility.reload")}
      >
        <IconFont name={"io-reload"} size={20} color={IOColors.blue} />
      </TouchableDefaultOpacity>
    )}
  </View>
);

export default PreferenceToggleRow;
