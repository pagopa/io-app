import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconChevronBottom = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.7071 8.29289c.3905.39053.3905 1.02369 0 1.41422l-6 5.99999c-.3905.3905-1.0237.3905-1.4142 0L5.29289 9.70711c-.39052-.39053-.39052-1.02369 0-1.41422.39053-.39052 1.02369-.39052 1.41422 0L12 13.5858l5.2929-5.29291c.3905-.39052 1.0237-.39052 1.4142 0Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconChevronBottom;
