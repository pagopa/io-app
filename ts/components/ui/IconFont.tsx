import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { TextStyle } from "react-native";
import { IconProps } from "react-native-vector-icons/Icon";
import Icon from "../../theme/font-icons/io-icon-font/index";

type Props = Readonly<IconProps>;

/**
 * A customized react-native-vector-icons/Icon component.
 * The class is connected with the native-base StyleProvider using the `connectStyle(...)` method.
 */

class IconFont extends React.Component<Props> {
  public render() {
    const { color, size, style } = this.props;
    const styleOverride: TextStyle = {
      ...style,
      color: color !== undefined ? color : style.color,
      fontSize: size !== undefined ? size : style.fontSize
    };
    return <Icon {...this.props} style={{ styleOverride }} />;
  }
}

const StyledIconFont = connectStyle(
  "UIComponents.IconFont",
  {},
  mapPropsToStyleNames
)(IconFont);

export default StyledIconFont;
