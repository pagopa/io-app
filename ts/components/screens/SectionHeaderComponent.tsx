/**
 * A component to render a custom section header
 * TODO: use the same component for:
 *  - message list https://www.pivotaltracker.com/story/show/165716236
 *  - service lists https://www.pivotaltracker.com/story/show/166792020
 */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import {
  View,
  AccessibilityRole,
  StyleProp,
  StyleSheet,
  ViewStyle
} from "react-native";
import customVariables from "../../theme/variables";
import { VSpacer } from "../core/spacer/Spacer";
import { H2 } from "../core/typography/H2";
import { IOColors } from "../core/variables/IOColors";
import { IOStyles } from "../core/variables/IOStyles";
import OrganizationLogo from "../services/OrganizationLogo";
import { MultiImage } from "../ui/MultiImage";

type Props = Readonly<{
  sectionHeader: string;
  style?: StyleProp<ViewStyle>;
  logoUri?: React.ComponentProps<typeof MultiImage>["source"];
  rightItem?: React.ReactNode;
  accessibilityRole?: AccessibilityRole;
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
    backgroundColor: IOColors.white,
    flexDirection: "row",
    borderBottomColor: customVariables.itemSeparator,
    borderBottomWidth: StyleSheet.hairlineWidth
  }
});

export default class SectionHeaderComponent extends React.Component<Props> {
  public render() {
    const rightItem = pipe(
      this.props.rightItem,
      O.fromNullable,
      O.getOrElseW(() =>
        pipe(
          this.props.logoUri,
          O.fromNullable,
          O.map(uri => <OrganizationLogo key={"right_item"} logoUri={uri} />),
          O.toUndefined
        )
      )
    );
    return (
      <View
        style={[
          styles.sectionView,
          this.props.logoUri ? styles.withLogo : styles.withoutLogo,
          this.props.style
        ]}
      >
        <H2
          style={IOStyles.flex}
          accessible={true}
          accessibilityRole={this.props.accessibilityRole}
        >
          {this.props.sectionHeader}
        </H2>
        <>
          {rightItem}
          <VSpacer size={40} />
        </>
      </View>
    );
  }
}
