import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { View, ViewProperties } from "react-native";

type Props = ViewProperties;

/**
 * A simple wrapper where you can put an Icon and a Text components that will be rendered side-by-side.
 *
 * More @https://github.com/teamdigitale/italia-app#textwithicon
 */
class TextWithIcon extends React.Component<Props> {
  public render() {
    return <View {...this.props} />;
  }
}

type StyleProps = {
  danger?: boolean;
  success?: boolean;
};

const StyledTextWithIcon = connectStyle<Props, StyleProps>(
  "UIComponents.TextWithIcon",
  {},
  mapPropsToStyleNames
)(TextWithIcon);

export default StyledTextWithIcon;
