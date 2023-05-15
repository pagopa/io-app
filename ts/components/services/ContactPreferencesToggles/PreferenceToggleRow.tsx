import * as React from "react";
import { View, StyleSheet } from "react-native";
import Switch from "../../ui/Switch";
import { H4 } from "../../core/typography/H4";
import { IOStyles } from "../../core/variables/IOStyles";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import I18n from "../../../i18n";
import { WithTestID } from "../../../types/WithTestID";
import ActivityIndicator from "../../ui/ActivityIndicator";
import { Icon } from "../../core/icons/Icon";

type Props = WithTestID<{
  label: string;
  onPress: (value: boolean) => void;
  value: boolean;
  graphicalState: "loading" | "error" | "ready";
  onReload: () => void;
  disabled?: boolean;
  accessiblityLabel?: string;
}>;

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
  graphicalState,
  onReload,
  disabled,
  testID = "preference-toggle-row"
}: Props): React.ReactElement => {
  const getComponentByGraphicalState = () => {
    switch (graphicalState) {
      case "loading":
        return (
          <ActivityIndicator
            size={"small"}
            testID={`${testID}-loading`}
            accessibilityLabel={I18n.t("global.remoteStates.loading")}
          />
        );
      case "error":
        return (
          <TouchableDefaultOpacity
            onPress={onReload}
            testID={`${testID}-reload`}
            accessibilityRole={"button"}
            accessibilityLabel={I18n.t("global.accessibility.reload")}
          >
            <Icon name="reload" size={20} color="blue" />
          </TouchableDefaultOpacity>
        );
      case "ready":
        return (
          <Switch
            value={value}
            onValueChange={onPress}
            testID={testID}
            disabled={disabled}
            accessibilityRole={"switch"}
            accessibilityState={{ checked: value, disabled }}
            accessibilityLabel={label}
          />
        );
    }
  };
  return (
    <View style={styles.row}>
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
      {getComponentByGraphicalState()}
    </View>
  );
};

export default PreferenceToggleRow;
