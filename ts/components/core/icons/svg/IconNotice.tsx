import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconNotice = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M12 0C5.367 0 0 5.368 0 12c0 6.633 5.368 12 12 12 6.633 0 12-5.367 12-12S18.633 0 12 0Zm0 22.125A10.12 10.12 0 0 1 1.875 12 10.12 10.12 0 0 1 12 1.875 10.12 10.12 0 0 1 22.125 12 10.12 10.12 0 0 1 12 22.125Zm0-4.492a1.266 1.266 0 1 0 0-2.532 1.266 1.266 0 0 0 0 2.531ZM12 6.04a.937.937 0 0 0-.938.938v6.037a.937.937 0 1 0 1.876 0V6.979A.937.937 0 0 0 12 6.04Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconNotice;
