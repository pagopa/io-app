import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconShare = ({ size, color }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M19.708 22H4.292A2.293 2.293 0 0 1 2 19.709V7.625a2.293 2.293 0 0 1 2.292-2.291h2.916a.625.625 0 0 1 0 1.25H4.292c-.575 0-1.042.467-1.042 1.041V19.71c0 .573.467 1.041 1.042 1.041h15.416c.575 0 1.042-.468 1.042-1.041v-7.084a.625.625 0 0 1 1.25 0v7.084A2.294 2.294 0 0 1 19.708 22Z"
      fill={color}
    />
    <Path
      d="M7.624 15.323a.553.553 0 0 1-.137-.017.616.616 0 0 1-.487-.597v-1.25c0-4.48 3.645-8.125 8.125-8.125h.208V2.625a.626.626 0 0 1 1.075-.433l5.417 5.625a.624.624 0 0 1 0 .866l-5.417 5.625a.626.626 0 0 1-1.075-.433v-2.708h-.99a6.836 6.836 0 0 0-6.149 3.8.643.643 0 0 1-.57.356Z"
      fill={color}
    />
  </Svg>
);

export default IconShare;
