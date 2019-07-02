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
}>;

const ICON_SIZE = 24;

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "column",
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: customVariables.spacerHeight,
    paddingBottom: customVariables.spacerHeight
  },
  spacingBase: {
    paddingRight: customVariables.spacingBase
  },
  flexRow: {
    flexDirection: "row"
  },
  serviceName: {
    flex: 1,
    fontWeight: "700"
  },
  center: {
    alignSelf: "center"
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
        style={[styles.listItem, this.props.isLastItem && styles.noBorder]}
        onPress={this.props.onPress}
        first={this.props.isFirstItem}
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
          <IconFont
            style={styles.center}
            name={"io-right"}
            size={ICON_SIZE}
            color={customVariables.contentPrimaryBackground}
          />
        </View>
        <Text numberOfLines={1} style={styles.description}>
          {this.props.subTitle}
        </Text>
      </ListItem>
    );
  }
}
