import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconReload = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.965 10.965A1.037 1.037 0 0 0 19.931 12a7.933 7.933 0 0 1-12.48 6.494c-3.582-2.507-4.456-7.461-1.948-11.043 2.509-3.582 7.463-4.455 11.046-1.947a7.933 7.933 0 0 1 1.466 1.323h-2.912a1.034 1.034 0 1 0 0 2.069h4.828c.571 0 1.034-.463 1.034-1.034V3.034a1.034 1.034 0 0 0-2.069 0v1.723a10 10 0 0 0-16.858 6.37 9.998 9.998 0 0 0 4.226 9.062 9.927 9.927 0 0 0 7.472 1.657A10 10 0 0 0 22 11.998c0-.57-.463-1.033-1.035-1.033Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconReload;
