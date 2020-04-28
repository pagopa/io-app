import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Platform } from "react-native";
import { makeFontStyleObject } from "../../theme/fonts";
import customVariables from "../../theme/variables";
import { BadgeComponent } from "../screens/BadgeComponent";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import IconFont from "../ui/IconFont";

type Props = Readonly<{
  text11: string;
  text2: string;
  text3: string;
  color: string;
  onPressItem: () => void;
  onLongPressItem?: () => void;
  isSelectionModeEnabled?: boolean;
  isItemSelected?: boolean;
}>;

const styles = StyleSheet.create({
  smallSpacer: {
    width: "100%",
    height: 4
  },
  verticalPad: {
    paddingVertical: customVariables.spacerHeight
  },
  spaced: {
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center"
  },
  brandDarkGray: {
    color: customVariables.brandDarkGray
  },
  text2Style: {
    lineHeight: 18,
    fontSize: 13
  },
  viewStyle: {
    flexDirection: "row"
  },
  text11: {
    fontSize: 14,
    paddingLeft: 8,
    lineHeight: 18,
    color: customVariables.brandDarkestGray
  },
  text3FontWeight: {
    ...makeFontStyleObject(Platform.select, "600")
  },
  text3: {
    fontSize: 16,
    color: customVariables.brandDarkestGray
  },
  icon: {
    width: 64,
    alignItems: "flex-end",
    justifyContent: "center"
  },
  text3Line: {
    flex: 1,
    flexDirection: "row"
  },
  text3Container: {
    flex: 1,
    flexDirection: "row",
    minHeight: 24
  }
});

const ICON_WIDTH = 24;

export default class PaymentHistoryItem extends React.PureComponent<Props> {
  private getIconName = () => {
    return this.props.isSelectionModeEnabled
      ? this.props.isItemSelected
        ? "io-checkbox-on"
        : "io-checkbox-off"
      : "io-right";
  };

  public render() {
    return (
      <TouchableDefaultOpacity
        onPress={this.props.onPressItem}
        onLongPress={this.props.onLongPressItem}
        style={styles.verticalPad}
      >
        <View style={styles.spaced}>
          <BadgeComponent color={this.props.color} />
          <Text style={styles.text11}>{this.props.text11}</Text>
        </View>

        <View style={styles.viewStyle}>
          <Text note={true} style={styles.text2Style}>
            {this.props.text2}
          </Text>
        </View>
        <View style={styles.smallSpacer} />
        <View style={styles.text3Line}>
          <View style={styles.text3Container}>
            <Text
              numberOfLines={2}
              style={[styles.text3, styles.text3FontWeight]}
            >
              {this.props.text3}
            </Text>
          </View>
          <View style={styles.icon}>
            <IconFont
              name={this.getIconName()}
              size={ICON_WIDTH}
              color={customVariables.contentPrimaryBackground}
            />
          </View>
        </View>
        {this.props.children}
      </TouchableDefaultOpacity>
    );
  }
}
