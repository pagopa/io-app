/**
 * A component to render a custom section header
 * TODO: use the same component for:
 *  - message list https://www.pivotaltracker.com/story/show/165716236
 *  - service lists https://www.pivotaltracker.com/story/show/166792020
 */
import { View } from "native-base";
import * as React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { fromNullable } from "fp-ts/lib/Option";
import customVariables from "../../theme/variables";
import OrganizationLogo from "../services/OrganizationLogo";
import { MultiImage } from "../ui/MultiImage";
import { H2 } from "../core/typography/H2";
import { IOStyles } from "../core/variables/IOStyles";

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
  sectionView: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    borderBottomColor: customVariables.itemSeparator,
    borderBottomWidth: StyleSheet.hairlineWidth
  }
});

export default class SectionHeaderComponent extends React.Component<Props> {
  public render() {
    const rightItem = fromNullable<React.ReactNode | undefined>(
      this.props.rightItem
    ).getOrElse(
      fromNullable(this.props.logoUri)
        .map(uri => <OrganizationLogo key={"right_item"} logoUri={uri} />)
        .toUndefined()
    );
    return (
      <View
        style={[
          styles.sectionView,
          this.props.logoUri ? styles.withLogo : styles.withoutLogo,
          this.props.style
        ]}
      >
        <H2 style={IOStyles.flex} accessible={true} accessibilityRole={"text"}>
          {this.props.sectionHeader}
        </H2>
        <>
          {rightItem}
          <View spacer={true} extralarge={true} />
        </>
      </View>
    );
  }
}
