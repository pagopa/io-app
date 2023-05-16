import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconChevronRightListItem = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.2929 5.29289c.3905-.39052 1.0237-.39052 1.4142 0l6 6.00001c.3905.3905.3905 1.0237 0 1.4142l-6 6c-.3905.3905-1.0237.3905-1.4142 0-.3905-.3905-.3905-1.0237 0-1.4142L21.5858 12l-5.2929-5.29289c-.3905-.39053-.3905-1.02369 0-1.41422Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconChevronRightListItem;
