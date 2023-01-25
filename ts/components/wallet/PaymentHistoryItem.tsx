import * as React from "react";
import { View, StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { HSpacer, VSpacer } from "../core/spacer/Spacer";
import { Body } from "../core/typography/Body";
import { IOStyles } from "../core/variables/IOStyles";
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
  verticalPad: {
    paddingVertical: customVariables.spacerHeight
  },
  spaced: {
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center"
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
          <HSpacer size={8} />
          <Body color="bluegreyDark">{this.props.text11}</Body>
        </View>

        <View style={IOStyles.row}>
          <Body>{this.props.text2}</Body>
        </View>
        <VSpacer size={4} />
        <View style={styles.text3Line}>
          <View style={[styles.text3Container, IOStyles.flex, IOStyles.row]}>
            <Body color="bluegreyDark" weight="SemiBold" numberOfLines={2}>
              {`${I18n.t("payment.IUV")} ${this.props.text3}`}
            </Body>
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
