import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconChevronTop = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.29289 15.7071c-.39052-.3905-.39052-1.0237 0-1.4142l6.00001-6.00001c.3905-.39052 1.0237-.39052 1.4142 0l6 6.00001c.3905.3905.3905 1.0237 0 1.4142-.3905.3905-1.0237.3905-1.4142 0L12 10.4142l-5.29289 5.2929c-.39053.3905-1.02369.3905-1.41422 0Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconChevronTop;
