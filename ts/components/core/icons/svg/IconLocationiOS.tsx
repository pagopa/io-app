import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconLocationiOS = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.9447 3.36939c.2318-.7727-.4997-1.48773-1.2669-1.23838L2.5497 8.02265c-.13656.04438-.13872.2368-.00319.28423l8.42499 2.94872a3.00053 3.00053 0 0 1 1.7944 1.7174l3.4392 8.598c.0527.1319.2421.1235.2829-.0126l5.4567-18.18901ZM20.0596.22894c2.3017-.74804 4.4962 1.39703 3.8008 3.71515L18.2802 22.5445c-.544 1.8135-3.0694 1.9261-3.7726.1681l-3.5987-8.9968a1.00009 1.00009 0 0 0-.5981-.5725l-8.84454-3.0955C-.34079 9.41529-.312 6.84973 1.50879 6.25797L20.0596.22894Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconLocationiOS;
