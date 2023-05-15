import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconQrCode = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 3a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3Zm3-1a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3ZM0 16a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-5Zm3-1a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3ZM16 0a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3h-5Zm-1 3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V3Zm-1.5 13.681a.5.5 0 0 1-.5-.5V13.5a.5.5 0 0 1 .5-.5h2.637a.5.5 0 0 1 .5.5v3.181H13.5Zm6.819 0h-3.682v3.637H13.5a.5.5 0 0 0-.5.5V23.5a.5.5 0 0 0 .5.5h3.137v-3.681h3.681V24H23.5a.5.5 0 0 0 .5-.5v-3.181h-3.681v-3.637Zm0 0V13.5a.5.5 0 0 1 .5-.5H23.5a.5.5 0 0 1 .5.5v3.181h-3.681ZM5 4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5ZM4 18a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1ZM18 4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-1Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconQrCode;
