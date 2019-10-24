import { Text, View } from "native-base";
import * as React from "react";
import { ImageSourcePropType, Platform, StyleSheet } from "react-native";
import { isIphoneX } from "react-native-iphone-x-helper";

import variables from "../../theme/variables";
import ScreenHeader from "../ScreenHeader";
type Props = Readonly<{
  title: string;
  icon?: ImageSourcePropType;
  subtitle?: string;
  banner?: React.ReactNode;
  fixed?: boolean;
  dark?: boolean;
}>;

const styles = StyleSheet.create({
  subheaderContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  fixedPosition: {
    position: "absolute",
    top:
      Platform.OS === "ios"
        ? isIphoneX()
          ? variables.appHeaderHeight + 42
          : variables.appHeaderHeight + 18
        : variables.appHeaderHeight,
    right: 0,
    left: 0
  },
  darkGrayBg: {
    backgroundColor: variables.brandDarkGray
  },
  white: {
    color: variables.colorWhite
  }
});

export class ScreenContentHeader extends React.PureComponent<Props> {
  public render() {
    const { banner, subtitle, fixed, dark, icon } = this.props;

    return (
      <View style={[fixed && styles.fixedPosition, dark && styles.darkGrayBg]}>
        {banner && <React.Fragment>{banner}</React.Fragment>}
        <View>
          <View spacer={true} />
          <ScreenHeader heading={this.props.title} icon={icon} dark={dark} />
          {subtitle ? (
            <View style={styles.subheaderContainer}>
              <Text>{subtitle}</Text>
              <View spacer={true} large={true} />
            </View>
          ) : (
            <View spacer={true} />
          )}
        </View>
      </View>
    );
  }
}
