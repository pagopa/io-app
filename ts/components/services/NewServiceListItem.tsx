/**
 * A component to render the preview of a service
 */
import { ListItem, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import { Badge } from "./../Badge";
import H5 from "./../ui/H5";
import IconFont from "./../ui/IconFont";

const ICON_SIZE = 24;

const styles = StyleSheet.create({
  spacingBase: {
    paddingRight: customVariables.spacingBase
  },

  flexRow: {
    flexDirection: "row"
  },

  flex1: {
    flex: 1
  },

  listItem: {
    flexDirection: "column",
    paddingRight: 0
  },

  center: {
    alignSelf: "center"
  },

  description: {
    paddingRight: ICON_SIZE,
    alignSelf: "flex-start"
  }
});

type Props = Readonly<{
  name: string;
  description: string;
  hasBadge?: boolean;
}>;

export class NewServiceListItem extends React.PureComponent<Props> {
  public render() {
    return (
      <ListItem style={styles.listItem}>
        <View style={styles.flexRow}>
          {this.props.hasBadge && (
            <View style={styles.spacingBase}>
              <Badge />
            </View>
          )}
          <H5 numberOfLines={2} style={styles.flex1}>
            {this.props.name}
          </H5>
          <IconFont
            style={styles.center}
            name={"io-right"}
            size={ICON_SIZE}
            color={customVariables.contentPrimaryBackground}
          />
        </View>

        <Text numberOfLines={1} style={styles.description}>
          {this.props.description}
        </Text>
      </ListItem>
    );
  }
}
