/**
 * A component to render a custom section header
 * TODO: use the same component for:
 *  - message list https://www.pivotaltracker.com/story/show/165716236
 *  - service lists https://www.pivotaltracker.com/story/show/166792020
 */
import { ListItem, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import H5 from "../ui/H5";

type Props = Readonly<{
  sectionHeader: string;
}>;

const styles = StyleSheet.create({
  divider: {
    paddingTop: 19,
    paddingLeft: 0,
    paddingBottom: 11,
    alignItems: "center"
  },
  sectionHeader: {
    fontWeight: "400"
  }
});

export default class SectionHeaderComponent extends React.Component<Props> {
  public render() {
    return (
      <ListItem first={true} style={styles.divider}>
        <View spacer={true} large={true} />
        <H5 style={styles.sectionHeader}>{this.props.sectionHeader}</H5>
      </ListItem>
    );
  }
}
