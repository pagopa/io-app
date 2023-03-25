import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconStarFilled = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.2576 2.04309c.7663-1.35075 2.7127-1.35075 3.479 0l2.7291 4.81004 5.4179 1.10907c1.5215.31145 2.1229 2.1625 1.0751 3.3088l-3.7313 4.0818.6194 5.4955c.174 1.5432-1.4006 2.6873-2.8146 2.0449l-5.0351-2.2873-5.03508 2.2873c-1.41396.6424-2.98857-.5017-2.81462-2.0449l.61945-5.4955-3.73131-4.0818C-.01228 10.1247.58918 8.27365 2.11063 7.9622l5.41793-1.10907 2.72904-4.81004Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconStarFilled;
