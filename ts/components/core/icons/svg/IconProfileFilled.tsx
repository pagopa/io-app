import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconProfileFilled = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 9c0-4.97056 4.02944-9 9-9 4.9706 0 9 4.02944 9 9 0 1.7438-.4959 3.3717-1.3544 4.7505C22.3054 15.9515 24 19.2778 24 23c0 .5522-.4477 1-1 1s-1-.4478-1-1c0-3.0854-1.3973-5.8444-3.5936-7.6788C16.7745 16.975 14.5069 18 12 18c-2.50694 0-4.77448-1.025-6.4064-2.6788C3.39729 17.1556 2 19.9146 2 23c0 .5522-.44772 1-1 1-.55229 0-1-.4478-1-1 0-3.7222 1.69462-7.0485 4.35442-9.2495C3.49592 12.3717 3 10.7438 3 9Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconProfileFilled;
