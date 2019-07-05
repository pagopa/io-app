import { ListItem, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import customVariables from "../theme/variables";
import H5 from "./ui/H5";

type Props = Readonly<{
  title: string;
  iconComponent?: React.ReactElement;
}>;

const ICON_SIZE = 24;

const styles = StyleSheet.create({
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: customVariables.spacerHeight,
    paddingBottom: customVariables.spacerHeight
  },
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    flexGrow: 1
  },
  spacingBase: {
    paddingRight: customVariables.spacingBase
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  title: {
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

export default class ChooserListItemComponent extends React.Component<Props> {
  public render() {
    return (
      <ListItem style={[styles.listItem, styles.flexRow]}>
        <View style={styles.container}>
          <View style={styles.flexRow}>
            {this.props.iconComponent}
            <H5 numberOfLines={2} style={styles.title}>
              {this.props.title}
            </H5>
          </View>
        </View>
      </ListItem>
    );
  }
}
