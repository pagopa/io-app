import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconDocumentAttachment = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 19c0 1.6569 1.34315 3 3 3h9v-5c0-1.6569 1.3431-3 3-3h5V5c0-1.65685-1.3431-3-3-3H5C3.34315 2 2 3.34315 2 5v14Zm19.501-3H17c-.5523 0-1 .4477-1 1v4.501c.1659-.1099.3216-.2369.4645-.3797l4.6568-4.6568c.1428-.1429.2698-.2986.3797-.4645ZM5 24c-2.76142 0-5-2.2386-5-5V5c0-2.76142 2.23858-5 5-5h14c2.7614 0 5 2.23858 5 5v9.3431c0 1.3261-.5268 2.5979-1.4645 3.5356l-4.6568 4.6568A5.00011 5.00011 0 0 1 14.3431 24H5Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconDocumentAttachment;
