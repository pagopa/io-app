import { H1, Text, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { ImageSourcePropType } from "react-native";

import ScreenHeader from "./ScreenHeader";

import I18n from "i18n-js";
import BaseScreenComponent from "./screens/BaseScreenComponent";

interface Props {
  title: string;
  icon: ImageSourcePropType;
  subtitle?: string;
  onMoreLinkPress?: () => void;
  goBack?: () => void;
}

class TopScreenComponent extends React.PureComponent<Props> {
  public render() {
    const { goBack, icon, title, subtitle, onMoreLinkPress } = this.props;
    return (
      <BaseScreenComponent goBack={goBack}>
        <ScreenHeader heading={<H1>{title}</H1>} icon={icon} />
        <View>
          {subtitle && <Text>{subtitle}</Text>}
          {onMoreLinkPress && (
            <Text link={true} onPress={onMoreLinkPress}>
              {I18n.t("preferences.moreLinkText")}
            </Text>
          )}
        </View>
        {this.props.children}
      </BaseScreenComponent>
    );
  }
}

export default connectStyle(
  "UIComponent.TopScreenComponent",
  {},
  mapPropsToStyleNames
)(TopScreenComponent);
