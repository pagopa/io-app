import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconEmailFill = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M.8284 4.24261C.30488 5.03304 0 5.98092 0 7v10c0 2.7614 2.23858 5 5 5h14c2.7614 0 5-2.2386 5-5V7c0-1.01908-.3049-1.96696-.8284-2.75739L13.4142 14c-.781.781-2.0474.781-2.8284 0L.8284 4.24261Zm20.929-1.41421C20.967 2.30488 20.0191 2 19 2H5c-1.01908 0-1.96696.30488-2.75739.8284L12 12.5858l9.7574-9.7574Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconEmailFill;
