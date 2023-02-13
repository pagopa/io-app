import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconCalendarAlt = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M18.21 3.316h1.169a3.462 3.462 0 0 1 3.463 3.474v12.736A3.47 3.47 0 0 1 19.38 23H5.463A3.462 3.462 0 0 1 2 19.526V6.79a3.47 3.47 0 0 1 3.463-3.474h1.169V1h2.315v2.316h6.948V1h2.316v2.316Zm3.474 3.474v4.631H3.158V6.79v12.736a2.304 2.304 0 0 0 2.305 2.316H19.38a2.313 2.313 0 0 0 2.305-2.316V6.79ZM6.632 3.316v2.316h2.315V3.316H6.632Zm11.579 0h-2.316v2.316h2.316V3.316Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconCalendarAlt;
