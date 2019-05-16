import { H1, Text, View } from "native-base";
import * as React from "react";
import { ImageSourcePropType, StyleSheet } from "react-native";

import variables from "../../theme/variables";
import ScreenHeader from "../ScreenHeader";

type Props = Readonly<{
  title: string;
  icon?: ImageSourcePropType;
  subtitle?: string;
  banner?: React.ReactNode;
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
  }
});

export class TopHeader extends React.PureComponent<Props> {
  public render() {
    const { banner, subtitle } = this.props;

    return (
      <React.Fragment>
        {banner && (
          <React.Fragment>
            {this.props.banner}
            <View spacer={true} />
          </React.Fragment>
        )}
        <ScreenHeader
          heading={
            <H1 style={styles.screenHeaderHeading}>{this.props.title}</H1>
          }
          icon={this.props.icon}
        />

        {subtitle && (
          <View style={styles.subheaderContainer}>
            <Text>{subtitle}</Text>
            <View spacer={true} large={true} />
          </View>
        )}
      </React.Fragment>
    );
  }
}
