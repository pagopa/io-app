import I18n from "i18n-js";
import { H1, Text, View } from "native-base";
import * as React from "react";
import { ImageSourcePropType, StyleSheet } from "react-native";

import variables from "../../theme/variables";
import ScreenHeader from "../ScreenHeader";

type Props = Readonly<{
  title: string;
  icon?: ImageSourcePropType;
  subtitle?: string;
  onMoreLinkPress?: () => void;
  banner?: React.ReactNode;
}>;

const styles = StyleSheet.create({
  subheaderContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding,
    paddingBottom: variables.spacerLargeHeight
  },
  screenHeaderHeading: {
    flex: 1
  }
});

export class TopHeader extends React.PureComponent<Props> {
  public render() {
    return (
      <React.Fragment>
        {this.props.banner && (
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
        <View style={styles.subheaderContainer}>
          {this.props.subtitle && <Text>{this.props.subtitle}</Text>}
          {this.props.onMoreLinkPress && (
            <Text link={true} onPress={this.props.onMoreLinkPress}>
              {I18n.t("preferences.moreLinkText")}
            </Text>
          )}
        </View>
      </React.Fragment>
    );
  }
}
