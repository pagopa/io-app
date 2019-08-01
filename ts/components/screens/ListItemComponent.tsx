import { ListItem, Text, View } from "native-base";
import * as React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import customVariables from "../../theme/variables";
import H5 from "../ui/H5";
import IconFont from "./../ui/IconFont";
import { BadgeComponent } from "./BadgeComponent";

type Props = Readonly<{
  title: string;
  onPress?: () => void;
  subTitle?: string;
  isFirstItem?: boolean;
  isLastItem?: boolean;
  hasBadge?: boolean;
  iconName?: string;
  hideIcon?: boolean;
  useExtendedSubTitle?: boolean;
  style?: StyleProp<ViewStyle>;
  hideSeparator?: boolean;
}>;

const ICON_SIZE = 24;

const styles = StyleSheet.create({
  listItem: {
    paddingLeft: 0,
    paddingRight: 0
  },
  spacingBase: {
    paddingRight: customVariables.spacingBase
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  flexRow2: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flex: 1
  },
  flexColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1
  },
  serviceName: {
    fontWeight: "700",
    alignSelf: "flex-start",
    paddingRight: 24 + 4 // icon width + margin - to overcome title not going on second line when overlapping with the right icon
  },
  description: {
    paddingRight: ICON_SIZE,
    alignSelf: "flex-start"
  }
});

export default class ListItemComponent extends React.Component<Props> {
  public render() {
    return (
      <ListItem
        style={[styles.listItem, styles.flexRow, this.props.style]}
        onPress={this.props.onPress}
        first={this.props.isFirstItem}
        last={this.props.isLastItem || this.props.hideSeparator}
      >
        <View style={styles.flexColumn}>
          <View style={styles.flexRow}>
            <View style={styles.flexRow2}>
              {this.props.hasBadge && (
                <View style={styles.spacingBase}>
                  <BadgeComponent />
                </View>
              )}
              <H5 numberOfLines={2} style={styles.serviceName}>
                {this.props.title}
              </H5>
            </View>

            {!this.props.iconName &&
              !this.props.hideIcon && (
                <IconFont
                  name={"io-right"}
                  size={ICON_SIZE}
                  color={customVariables.contentPrimaryBackground}
                />
              )}
          </View>
          {this.props.subTitle && (
            <Text
              numberOfLines={this.props.useExtendedSubTitle ? undefined : 1}
              style={styles.description}
            >
              {this.props.subTitle}
            </Text>
          )}
        </View>
        {this.props.iconName && (
          <IconFont
            name={this.props.iconName}
            size={ICON_SIZE * 2}
            style={{ alignSelf: "center" }}
            color={customVariables.contentPrimaryBackground}
          />
        )}
      </ListItem>
    );
  }
}
