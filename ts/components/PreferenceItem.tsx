import { H3, Left, ListItem, Right, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { Image } from "react-native";
import I18n from "../i18n";
import { PreferenceItem as PreferenceItemType } from "../types/PreferenceItem";

type Props = PreferenceItemType;

/**
 * Component that implements the list item of the preferences screen
 */
class PreferenceItem extends React.Component<Props> {
  public render() {
    const { id, icon, valuePreview } = this.props;

    return (
      <ListItem>
        <Left>
          <H3>{I18n.t(`preferences.list.${id}`)}</H3>
          <Text>{valuePreview}</Text>
        </Left>
        <Right>
          <Image source={icon} />
        </Right>
      </ListItem>
    );
  }
}

export default connectStyle(
  "UIComponent.PreferenceItem",
  {},
  mapPropsToStyleNames
)(PreferenceItem);
