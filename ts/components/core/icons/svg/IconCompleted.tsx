import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconCompleted = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.7071 5.29289c.3905.39053.3905 1.02369 0 1.41422L10.4142 18c-.78103.781-2.04736.7811-2.82841 0l-5.2929-5.2929c-.39052-.3905-.39052-1.0237 0-1.4142.39053-.3905 1.02369-.3905 1.41422 0L9 16.5858 20.2929 5.29289c.3905-.39052 1.0237-.39052 1.4142 0Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconCompleted;
