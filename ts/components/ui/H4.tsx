import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { Text, TextProps } from "react-native";

type Props = TextProps;

class H4 extends React.Component<Props> {
  public render() {
    return <Text {...this.props} />;
  }
}

export default connectStyle("UIComponent.H4", {}, mapPropsToStyleNames)(H4);
