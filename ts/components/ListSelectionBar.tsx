/**
 * A component to render a view with buttons for Cancel, Select all and Archive/Restore items
 */
import { Option } from "fp-ts/lib/Option";
import { Text } from "native-base";
import React from "react";
import { Animated, StyleProp, StyleSheet, ViewStyle } from "react-native";
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
  containerStyle?: StyleProp<ViewStyle>;
  selectedItemIds: Option<Set<string>>;
  allItemIds: Option<Set<string>>;
  primaryButtonText: string;
  onToggleAllSelection: () => void;
  onToggleSelection: () => void;
  onResetSelection: () => void;
};

export class ListSelectionBar extends React.PureComponent<Props> {
  public render() {
    const {
      allItemIds,
      selectedItemIds,
      containerStyle,
      onToggleAllSelection,
      onToggleSelection,
      onResetSelection,
      primaryButtonText
    } = this.props;

    return (
      selectedItemIds.isSome() &&
      allItemIds.isSome() && (
        <Animated.View style={[styles.buttonBar, containerStyle]}>
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
                selectedItemIds.value.size === allItemIds.value.size
                  ? "messages.cta.deselectAll"
                  : "messages.cta.selectAll"
              )}
            </Text>
          </ButtonDefaultOpacity>
          <ButtonDefaultOpacity
            block={true}
            style={styles.flex2}
            disabled={selectedItemIds.value.size === 0}
            onPress={onToggleSelection}
          >
            <Text>{primaryButtonText}</Text>
          </ButtonDefaultOpacity>
        </Animated.View>
      )
    );
  }
}
