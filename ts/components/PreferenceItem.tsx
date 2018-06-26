import { H3, Left, ListItem, Right, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { Image } from "react-native";
import I18n from "../i18n";
import { PreferenceItem } from "../types/PreferenceItem";

type Props = PreferenceItem;

const PreferenceItem: React.SFC<Props> = ({ id, icon, valuePreview }) => (
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

export default connectStyle(
  "UIComponent.PreferenceItem",
  {},
  mapPropsToStyleNames
)(PreferenceItem);
