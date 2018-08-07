import { Body, Container, H1, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { ImageSourcePropType } from "react-native";

import AppHeader from "./ui/AppHeader";

import { DEFAULT_APPLICATION_NAME } from "../config";

import ScreenHeader from "./ScreenHeader";

import I18n from "i18n-js";

interface Props {
  title: string;
  subtitle?: string;
  icon: ImageSourcePropType;
  onMoreLinkPress?: () => void;
}

class TopScreenComponent extends React.PureComponent<Props> {
  public render() {
    return (
      <Container>
        <AppHeader>
          <Body>
            <Text>{DEFAULT_APPLICATION_NAME}</Text>
          </Body>
        </AppHeader>
        <ScreenHeader
          heading={<H1>{this.props.title}</H1>}
          icon={this.props.icon}
        />
        <View>
          {this.props.subtitle && <Text>{this.props.subtitle}</Text>}
          {this.props.onMoreLinkPress && (
            <Text link={true} onPress={this.props.onMoreLinkPress}>
              {I18n.t("preferences.moreLinkText")}
            </Text>
          )}
        </View>
        {this.props.children}
      </Container>
    );
  }
}

export default connectStyle(
  "UIComponent.TopScreenComponent",
  {},
  mapPropsToStyleNames
)(TopScreenComponent);
