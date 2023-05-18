import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconHome = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.14 2.743a3 3 0 0 1 3.72 0l7 5.53A3 3 0 0 1 22 10.626V19a3 3 0 0 1-3 3h-3v-6a4 4 0 0 0-8 0v6H5a3 3 0 0 1-3-3v-8.373a3 3 0 0 1 1.14-2.355l7-5.529ZM14 22h-4v-6a2 2 0 1 1 4 0v6Zm-6 2H5a5 5 0 0 1-5-5v-8.373a5 5 0 0 1 1.9-3.924l7-5.53a5 5 0 0 1 6.2 0l7 5.53a5 5 0 0 1 1.9 3.923V19a5 5 0 0 1-5 5H8Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconHome;
