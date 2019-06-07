import { H1, Text, View } from "native-base";
import * as React from "react";
import { ImageSourcePropType, StyleSheet } from "react-native";
import { getStatusBarHeight } from "react-native-iphone-x-helper";

import variables from "../../theme/variables";
import ScreenHeader from "../ScreenHeader";
type Props = Readonly<{
  title: string;
  icon?: ImageSourcePropType;
  subtitle?: string;
  banner?: React.ReactNode;
  fixed?: boolean;
}>;

const styles = StyleSheet.create({
  subheaderContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  screenHeaderHeading: {
    flex: 1,
    fontSize: variables.fontSize4,
    lineHeight: 40,
    marginRight: variables.contentPadding
  },
  fixedPosition: {
    position: "absolute",
    top: variables.appHeaderHeight + getStatusBarHeight(true),
    right: 0,
    left: 0
  }
});

export class ScreenContentHeader extends React.PureComponent<Props> {
  public render() {
    const { banner, subtitle, fixed } = this.props;

    return (
      <View style={fixed ? styles.fixedPosition : {}}>
        {banner && <React.Fragment>{this.props.banner}</React.Fragment>}
        <View>
          <View spacer={true} />
          <ScreenHeader
            heading={
              <H1 style={styles.screenHeaderHeading}>{this.props.title}</H1>
            }
            icon={this.props.icon}
          />
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
