import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import customVariables from "../theme/variables";

type Props = Readonly<{
  title: string;
  iconComponent?: React.ReactElement;
}>;

const styles = StyleSheet.create({
  container: {
    paddingLeft: customVariables.contentPadding,
    paddingRight: customVariables.contentPadding,
    paddingTop: customVariables.contentPadding / 2,
    paddingBottom: customVariables.contentPadding / 2,
    flexDirection: "row",
    alignItems: "center",
    height: 65
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 50
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    marginTop: 4,
    color: customVariables.brandDarkestGray
  }
});

/**
 * A component for selectable list item with icon (optional) and text
 * //TODO select will be introduced with story https://www.pivotaltracker.com/story/show/167102335
 */
export default class ChooserListItemComponent extends React.Component<Props> {
  public render() {
    return (
      <View style={styles.container}>
        {this.props.iconComponent && <View>{this.props.iconComponent}</View>}
        <View style={styles.content}>
          <Text numberOfLines={2} bold={true} style={styles.title}>
            {this.props.title}
          </Text>
        </View>
      </View>
    );
  }
}
