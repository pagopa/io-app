import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconBackiOS = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.7071.2929c-.3905-.39053-1.0237-.39053-1.4142 0l-11 11c-.39053.3905-.39053 1.0237 0 1.4142l11 11c.3905.3905 1.0237.3905 1.4142 0 .3905-.3905.3905-1.0237 0-1.4142L2.41421 12 12.7071 1.70711c.3905-.39053.3905-1.0237 0-1.41422Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconBackiOS;
