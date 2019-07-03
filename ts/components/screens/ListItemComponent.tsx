import { ListItem, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import H5 from "../ui/H5";
import IconFont from "./../ui/IconFont";
import { BadgeComponent } from "./BadgeComponent";

type Props = Readonly<{
  title: string;
  subTitle: string;
  onPress: () => void;
  isFirstItem?: boolean;
  isLastItem?: boolean;
  hasBadge?: boolean;
  iconName?: string;
  hideIcon?: boolean;
  useExtendedSubTitle?: boolean;
}>;

const ICON_SIZE = 24;

const styles = StyleSheet.create({
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: customVariables.spacerHeight,
    paddingBottom: customVariables.spacerHeight
  },
  spacingBase: {
    paddingRight: customVariables.spacingBase
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  serviceName: {
    fontWeight: "700"
  },
  description: {
    paddingRight: ICON_SIZE,
    alignSelf: "flex-start"
  },
  noBorder: {
    borderBottomWidth: 0
  }
});

export default class ListItemComponent extends React.Component<Props> {
  public render() {
    return (
      <ListItem
        style={[
          styles.listItem,
          this.props.isLastItem && styles.noBorder,
          styles.flexRow
        ]}
        onPress={this.props.onPress}
        first={this.props.isFirstItem}
      >
        <View
          style={[
            {
              flexDirection: "column",
              justifyContent: "space-between",
              flexGrow: 1
            }
          ]}
        >
          <View style={styles.flexRow}>
            {this.props.hasBadge && (
              <View style={styles.spacingBase}>
                <BadgeComponent />
              </View>
            )}
            <H5 numberOfLines={2} style={styles.serviceName}>
              {this.props.title}
            </H5>
            {!this.props.iconName &&
              !this.props.hideIcon && (
                <IconFont
                  name={"io-right"}
                  size={ICON_SIZE}
                  color={customVariables.contentPrimaryBackground}
                />
              )}
          </View>
          <Text
            numberOfLines={this.props.useExtendedSubTitle ? undefined : 1}
            style={styles.description}
          >
            {this.props.subTitle}
          </Text>
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
