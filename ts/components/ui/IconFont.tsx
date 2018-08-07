import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { IconProps } from "react-native-vector-icons/Icon";
import Icon from "../../theme/font-icons/io-icon-font/index";

type Props = Readonly<IconProps>;

/**
 * A customized react-native-vector-icons/Icon component.
 * The class is connected with the native-base StyleProvider using the `connectStyle(...)` method.
 */

const IconFont: React.SFC<Props> = props => {
  const { color, size, style } = props;
  const colorStyle = color ? { color } : {};
  const fontSizeStyle = size ? { fontSize: size } : {};
  return <Icon {...props} style={[style, colorStyle, fontSizeStyle]} />;
};

const StyledIconFont = connectStyle(
  "UIComponents.IconFont",
  {},
  mapPropsToStyleNames
)(IconFont);

export default StyledIconFont;
