import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconNavWalletFocused = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 4h14c1.6567 0 2.9998 1.34295 3 2.99964C21.1643 6.37195 20.1256 6 19 6H5c-1.12561 0-2.16434.37194-3 .99963C2.0002 5.34295 3.34327 4 5 4Zm19 11V7c0-2.76142-2.2386-5-5-5H5C2.23858 2 0 4.23858 0 7v10c0 2.7614 2.23858 5 5 5h14c2.7614 0 5-2.2386 5-5v-2Zm-2-4.0004C21.9998 9.34295 20.6567 8 19 8H5c-1.65673 0-2.99981 1.34295-3 2.9996C2.83566 10.372 3.87439 10 5 10h3.5c.77479 0 1.38769.6623 1.9258 1.2439.0373.0402.0742.0801.1108.1193.3651.3918.8856.6368 1.4634.6368s1.0983-.245 1.4634-.6368c.0366-.0392.0735-.0791.1108-.1193C14.1123 10.6623 14.7252 10 15.5 10H19c1.1256 0 2.1643.372 3 .9996Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconNavWalletFocused;
