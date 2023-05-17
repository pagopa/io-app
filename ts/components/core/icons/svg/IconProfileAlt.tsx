import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconProfileAlt = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M12.263 11.421a4.632 4.632 0 1 0 0-9.263 4.632 4.632 0 0 0 0 9.263Zm0 1.158a5.79 5.79 0 1 1 0-11.579 5.79 5.79 0 0 1 0 11.579ZM4.158 23H3a9.263 9.263 0 1 1 18.526 0h-1.158a8.105 8.105 0 1 0-16.21 0Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconProfileAlt;
