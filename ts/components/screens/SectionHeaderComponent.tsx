/**
 * A component to render a custom section header
 * TODO: use the same component for:
 *  - message list https://www.pivotaltracker.com/story/show/165716236
 *  - service lists https://www.pivotaltracker.com/story/show/166792020
 */
import { ListItem, View } from "native-base";
import * as React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import customVariables from "../../theme/variables";
import OrganizationLogo from "../services/OrganizationLogo";
import H5 from "../ui/H5";
import { MultiImage } from "../ui/MultiImage";

type Props = Readonly<{
  sectionHeader: string;
  style?: StyleProp<ViewStyle>;
  logoUri?: React.ComponentProps<typeof MultiImage>["source"];
}>;

const styles = StyleSheet.create({
  withoutLogo: {
    paddingTop: 19,
    paddingBottom: 11,
    alignItems: "center"
  },
  withLogo: {
    paddingTop: customVariables.spacerWidth,
    paddingBottom: 0,
    alignItems: "center"
  },
  sectionTitle: {
    fontWeight: "400",
    flex: 1
  }
});

export default class SectionHeaderComponent extends React.Component<Props> {
  public render() {
    return (
      <ListItem
        first={true}
        style={[
          this.props.logoUri ? styles.withLogo : styles.withoutLogo,
          this.props.style
        ]}
      >
        <View spacer={true} large={true} />
        {this.props.logoUri && (
          <OrganizationLogo logoUri={this.props.logoUri} />
        )}
        <H5 style={styles.sectionTitle}>{this.props.sectionHeader}</H5>
      </ListItem>
    );
  }
}
