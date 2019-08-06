import { Option } from "fp-ts/lib/Option";
import { Button, Text } from "native-base";
import React from "react";
import { Animated, StyleProp, StyleSheet, ViewStyle } from "react-native";
import I18n from "../i18n";
import customVariables from "../theme/variables";

const styles = StyleSheet.create({
  buttonBar: {
    flexDirection: "row",
    zIndex: 1,
    justifyContent: "space-around",
    backgroundColor: customVariables.brandLightGray,
    padding: 10
  },
  buttonBarLeft: {
    flex: 2
  },
  buttonBarRight: {
    flex: 2
  },
  buttonBarCenter: {
    flex: 2,
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

/**
 * A component to render a view with buttons for Cancel, Select all and Archive/Restore items
 */
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
          <Button
            block={true}
            bordered={true}
            light={true}
            onPress={onResetSelection}
            style={styles.buttonBarLeft}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
          <Button
            block={true}
            bordered={true}
            style={styles.buttonBarCenter}
            onPress={onToggleAllSelection}
          >
            <Text>
              {I18n.t(
                selectedItemIds.value.size === allItemIds.value.size
                  ? "messages.cta.deselectAll"
                  : "messages.cta.selectAll"
              )}
            </Text>
          </Button>
          <Button
            block={true}
            style={styles.buttonBarRight}
            disabled={selectedItemIds.value.size === 0}
            onPress={onToggleSelection}
          >
            <Text>{primaryButtonText}</Text>
          </Button>
        </Animated.View>
      )
    );
  }
}
