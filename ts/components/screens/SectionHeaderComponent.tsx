/**
 * A component to render a custom section header
 * TODO: use the same component for:
 *  - message list https://www.pivotaltracker.com/story/show/165716236
 *  - service lists https://www.pivotaltracker.com/story/show/166792020
 */
import { View } from "native-base";
import * as React from "react";
import { Platform, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { makeFontStyleObject } from "../../theme/fonts";
import customVariables from "../../theme/variables";
import OrganizationLogo from "../services/OrganizationLogo";
import H5 from "../ui/H5";
import { MultiImage } from "../ui/MultiImage";

type Props = Readonly<{
  sectionHeader: string;
  style?: StyleProp<ViewStyle>;
  logoUri?: React.ComponentProps<typeof MultiImage>["source"];
  rightItem?: React.ReactNode;
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
    ...makeFontStyleObject(Platform.select, "700"),
    flex: 1
  },
  sectionView: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    borderBottomColor: customVariables.itemSeparator,
    borderBottomWidth: StyleSheet.hairlineWidth
  }
});

export default class SectionHeaderComponent extends React.Component<Props> {
  public render() {
    return (
      <View
        style={[
          styles.sectionView,
          this.props.logoUri ? styles.withLogo : styles.withoutLogo,
          this.props.style
        ]}
      >
        <View spacer={true} large={true} />
        {this.props.logoUri && (
          <OrganizationLogo logoUri={this.props.logoUri} />
        )}
        <H5
          style={styles.sectionTitle}
          accessible={true}
          accessibilityRole={"text"}
        >
          {this.props.sectionHeader}
        </H5>
        {this.props.rightItem}
      </View>
    );
  }
}
