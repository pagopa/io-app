import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconNavProfile = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.99921 5c0-1.65685 1.34319-3 2.99999-3 1.6569 0 3 1.34315 3 3s-1.3431 3-3 3c-1.6568 0-2.99999-1.34315-2.99999-3Zm2.99999-5C9.23778 0 6.99921 2.23858 6.99921 5s2.23857 5 4.99999 5c2.7614 0 5-2.23858 5-5s-2.2386-5-5-5ZM2.04844 23.0014C2.54952 17.9474 6.81338 14 11.9992 14c5.1858 0 9.4497 3.9474 9.9508 9.0014.0545.5496.4969.9986 1.0492.9986.5523 0 1.0044-.4493.959-.9997C23.4501 16.8406 18.29 12 11.9992 12 5.70844 12 .54826 16.8406.04026 23.0003c-.0454.5504.40666.9997.95895.9997.55228 0 .99474-.449 1.04923-.9986Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconNavProfile;
