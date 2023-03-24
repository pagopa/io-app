import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconChevronRight = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.29289 5.29289c.39053-.39052 1.02369-.39052 1.41422 0l5.99999 6.00001c.3905.3905.3905 1.0237 0 1.4142l-5.99999 6c-.39053.3905-1.02369.3905-1.41422 0-.39052-.3905-.39052-1.0237 0-1.4142L13.5858 12 8.29289 6.70711c-.39052-.39053-.39052-1.02369 0-1.41422Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconChevronRight;
