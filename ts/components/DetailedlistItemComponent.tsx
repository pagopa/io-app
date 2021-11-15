import { Badge, Text, View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import { makeFontStyleObject } from "../theme/fonts";
import customVariables from "../theme/variables";
import I18n from "../i18n";
import { IOColors } from "./core/variables/IOColors";
import { BadgeComponent } from "./screens/BadgeComponent";
import TouchableDefaultOpacity from "./TouchableDefaultOpacity";
import IconFont from "./ui/IconFont";
import { H5 } from "./core/typography/H5";
import { H3 } from "./core/typography/H3";

type OwnProps = Readonly<{
  text11: string;
  text12: string;
  text2: string;
  text3: string;
  isNew: boolean;
  isPaid?: boolean;
  onPressItem: () => void;
  onLongPressItem?: () => void;
  isSelectionModeEnabled?: boolean;
  isItemSelected?: boolean;
}>;

type Props = OwnProps & React.ComponentProps<typeof TouchableDefaultOpacity>;

const styles = StyleSheet.create({
  smallSpacer: {
    width: "100%",
    height: 4
  },
  verticalPad: {
    paddingVertical: customVariables.spacerHeight
  },
  spaced: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center"
  },
  brandDarkGray: {
    color: customVariables.brandDarkGray
  },
  badgeContainer: {
    flex: 0,
    paddingRight: 8,
    alignSelf: "flex-start",
    paddingTop: 6.5
  },
  viewStyle: {
    flexDirection: "row"
  },
  text11: {
    color: customVariables.brandDarkestGray
  },
  new: {
    ...makeFontStyleObject(Platform.select, "700")
  },
  notNew: {
    ...makeFontStyleObject(Platform.select, "400")
  },
  text3: {
    fontSize: 18,
    color: customVariables.brandDarkestGray
  },
  text12: {
    lineHeight: 18,
    marginBottom: -4
  },
  icon: {
    width: 90,
    alignItems: "flex-start",
    justifyContent: "flex-end",
    flexDirection: "row"
  },
  text3Line: {
    flex: 1,
    flexDirection: "row"
  },
  text3Container: {
    flex: 1,
    flexDirection: "row",
    minHeight: 24
  },
  text3SubContainer: { width: `95%` },
  badgeInfo: {
    borderWidth: 1,
    borderStyle: "solid",
    width: 65,
    height: 25,
    flexDirection: "row"
  },
  badgeInfoExpired: {
    backgroundColor: IOColors.white,
    borderColor: IOColors.red
  },
  badgeInfoPaid: {
    borderColor: IOColors.aqua,
    backgroundColor: IOColors.aqua
  }
});

const ICON_WIDTH = 24;

/**
 * A component to display a touchable list item
 */
export default class DetailedlistItemComponent extends React.PureComponent<Props> {
  private getIconName = () =>
    this.props.isSelectionModeEnabled
      ? this.props.isItemSelected
        ? "io-checkbox-on"
        : "io-checkbox-off"
      : "io-right";

  public render() {
    return (
      <TouchableDefaultOpacity
        onPress={this.props.onPressItem}
        onLongPress={this.props.onLongPressItem}
        style={styles.verticalPad}
        {...this.props}
      >
        <View style={styles.spaced}>
          <H5>{this.props.text11}</H5>
          <Text bold={true} style={styles.text12}>
            {this.props.text12}
          </Text>
        </View>

        <View style={styles.viewStyle}>
          <Text>{this.props.text2}</Text>
        </View>
        <View style={styles.smallSpacer} />
        <View style={styles.text3Line}>
          <View style={styles.text3Container}>
            {this.props.isNew && (
              <View style={styles.badgeContainer}>
                <BadgeComponent />
              </View>
            )}
            <View style={styles.text3SubContainer}>
              <H3 numberOfLines={2}>{this.props.text3}</H3>
            </View>
          </View>

          <View style={styles.icon}>
            {this.props.isPaid && (
              <Badge style={[styles.badgeInfo, styles.badgeInfoPaid]}>
                <H5 color="bluegreyDark">{I18n.t("messages.badge.paid")}</H5>
              </Badge>
            )}

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
