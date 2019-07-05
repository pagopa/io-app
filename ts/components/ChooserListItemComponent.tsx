import { Text, View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import { makeFontStyleObject } from "../theme/fonts";
import customVariables from "../theme/variables";

type Props = Readonly<{
  title: string;
  iconComponent?: React.ReactElement;
}>;

const styles = StyleSheet.create({
  container: {
    paddingLeft: customVariables.contentPadding,
    paddingRight: customVariables.contentPadding,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    height: 70
  },
  content: {
    flex: 1
  },
  title: {
    ...makeFontStyleObject(Platform.select, "700", false),
    fontSize: 18,
    lineHeight: 21,
    color: customVariables.brandDarkestGray
  }
});

export default class ChooserListItemComponent extends React.Component<Props> {
  public render() {
    return (
      <View style={styles.container}>
        <View>{this.props.iconComponent}</View>
        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>
            {this.props.title}
          </Text>
        </View>
      </View>
    );
  }
}
