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
  dark?: boolean;
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

export class ScreenContentHeader extends React.PureComponent<Props> {
  public render() {
    const { banner, subtitle } = this.props;

    return (
      <React.Fragment>
        <View style={ this.props.dark && {backgroundColor: variables.brandDarkGray}}>
          {banner && <React.Fragment>{this.props.banner}</React.Fragment>}
          <View spacer={true} />
          <ScreenHeader
            heading={
              <H1 style={[styles.screenHeaderHeading, this.props.dark && {color: variables.colorWhite}]}>{this.props.title}</H1>
            }
            icon={this.props.icon}
            dark={this.props.dark}
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
        
      </React.Fragment>
    );
  }
}
