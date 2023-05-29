import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconNavProfileFocused = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 0C9.23858 0 7 2.23858 7 5s2.23858 5 5 5c2.7614 0 5-2.23858 5-5s-2.2386-5-5-5Zm-.0008 12C5.70844 12 .54826 16.8406.04026 23.0003c-.0454.5504.40666.9997.95895.9997H22.9992c.5523 0 1.0044-.4493.959-.9997C23.4501 16.8406 18.29 12 11.9992 12Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconNavProfileFocused;
