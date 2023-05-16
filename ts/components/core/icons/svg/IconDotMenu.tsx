import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconDotMenu = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 6c1.1046 0 2-.89543 2-2s-.8954-2-2-2-2 .89543-2 2 .8954 2 2 2Zm0 8c1.1046 0 2-.8954 2-2s-.8954-2-2-2-2 .8954-2 2 .8954 2 2 2Zm2 6c0 1.1046-.8954 2-2 2s-2-.8954-2-2 .8954-2 2-2 2 .8954 2 2Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconDotMenu;
