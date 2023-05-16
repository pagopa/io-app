import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconExternalLink = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M5 2C3.34315 2 2 3.34315 2 5v14c0 1.6569 1.34315 3 3 3h14c1.6569 0 3-1.3431 3-3v-4c0-.5523.4477-1 1-1s1 .4477 1 1v4c0 2.7614-2.2386 5-5 5H5c-2.76142 0-5-2.2386-5-5V5c0-2.76142 2.23858-5 5-5h4c.55229 0 1 .44771 1 1 0 .55228-.44771 1-1 1H5Zm9-1c0-.55229.4477-1 1-1h7c1.1046 0 2 .89543 2 2v7c0 .55229-.4477 1-1 1s-1-.44771-1-1V3.41421l-8.2929 8.29289c-.3905.3905-1.0237.3905-1.4142 0-.3905-.3905-.3905-1.0237 0-1.4142L20.5858 2H15c-.5523 0-1-.44772-1-1Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconExternalLink;
