import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconNotice = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 12C0 5.3726 5.3726 0 12 0s12 5.3726 12 12-5.3726 12-12 12S0 18.6274 0 12Zm2 0C2 6.47717 6.47717 2 12 2c5.5228 0 10 4.47717 10 10 0 5.5228-4.4772 10-10 10-5.52283 0-10-4.4772-10-10Zm10.0281 7.5c.8439 0 1.5281-.6842 1.5281-1.5281s-.6842-1.5281-1.5281-1.5281c-.844 0-1.5281.6842-1.5281 1.5281S11.1841 19.5 12.0281 19.5Zm0-15.05618h.0005c.5678 0 1.0281.46029 1.0281 1.02808v8.0046c0 .5678-.4603 1.028-1.0281 1.028h-.0005c-.5678 0-1.0281-.4602-1.0281-1.028V5.4719c0-.56779.4603-1.02808 1.0281-1.02808Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconNotice;
