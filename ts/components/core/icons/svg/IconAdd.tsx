import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconAdd = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.9999 1c0-.55229-.4477-1-1-1-.5522 0-1 .44771-1 1v10H1.00098c-.55229 0-1 .4477-1 1s.44771 1 1 1h9.99892v10.0008c0 .5522.4478 1 1 1 .5523 0 1-.4478 1-1V13h9.9999c.5523 0 1-.4477 1-1s-.4477-1-1-1h-9.9999V1Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconAdd;
