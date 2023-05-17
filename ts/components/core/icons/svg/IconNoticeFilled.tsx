import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconNoticeFilled = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 0C5.3726 0 0 5.3726 0 12s5.3726 12 12 12 12-5.3726 12-12S18.6274 0 12 0Zm.0281 19.5c.8439 0 1.5281-.6842 1.5281-1.5281s-.6842-1.5281-1.5281-1.5281c-.844 0-1.5281.6842-1.5281 1.5281S11.1841 19.5 12.0281 19.5Zm0-15.05618h.0005c.5678 0 1.0281.46029 1.0281 1.02808v8.0046c0 .5678-.4603 1.028-1.0281 1.028h-.0005c-.5678 0-1.0281-.4602-1.0281-1.028V5.4719c0-.56779.4603-1.02808 1.0281-1.02808Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconNoticeFilled;
