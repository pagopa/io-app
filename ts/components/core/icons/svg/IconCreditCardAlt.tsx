import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconCreditCardAlt = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M0 7c0-1.657 1.342-3 2.991-3H21.01A2.99 2.99 0 0 1 24 7v11c0 1.657-1.342 3-2.991 3H2.99A2.99 2.99 0 0 1 0 18V7Zm1 0v11c0 1.11.888 2 1.991 2H21.01A1.997 1.997 0 0 0 23 18V7c0-1.11-.888-2-1.991-2H2.99A1.997 1.997 0 0 0 1 7Zm3 6h5v1H4v-1ZM1 8h22v3H1V8Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconCreditCardAlt;
