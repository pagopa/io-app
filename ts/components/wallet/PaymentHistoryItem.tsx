import { Text as NBText } from "native-base";
import * as React from "react";
import { View, StyleSheet, Platform } from "react-native";
import I18n from "../../i18n";
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
  viewStyle: {
    flexDirection: "row"
  },
  text11: {
    paddingLeft: 8,
    color: customVariables.textColorDark
  },
  text3FontWeight: {
    ...makeFontStyleObject(Platform.select, "600")
  },
  text3: {
    fontSize: 16,
    color: customVariables.textColorDark
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
  public render() {
    return (
      <TouchableDefaultOpacity
        onPress={this.props.onPressItem}
        style={styles.verticalPad}
      >
        <View style={styles.spaced}>
          <BadgeComponent color={this.props.color} />
          <NBText style={styles.text11}>{this.props.text11}</NBText>
        </View>

        <View style={styles.viewStyle}>
          <NBText>{this.props.text2}</NBText>
        </View>
        <View style={styles.smallSpacer} />
        <View style={styles.text3Line}>
          <View style={styles.text3Container}>
            <NBText
              numberOfLines={2}
              style={[styles.text3, styles.text3FontWeight]}
            >
              {`${I18n.t("payment.IUV")} ${this.props.text3}`}
            </NBText>
          </View>
          <View style={styles.icon}>
            <IconFont
              name={"io-right"}
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
