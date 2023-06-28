import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconInfo = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 12C0 5.3726 5.3726 0 12 0s12 5.3726 12 12-5.3726 12-12 12S0 18.6274 0 12Zm2 0C2 6.47717 6.47717 2 12 2c5.5228 0 10 4.47717 10 10 0 5.5228-4.4772 10-10 10-5.52283 0-10-4.4772-10-10Zm10.0281-4.50455c.8439 0 1.5281-.68415 1.5281-1.52809 0-.84394-.6842-1.52809-1.5281-1.52809-.844 0-1.5281.68415-1.5281 1.52809 0 .84394.6841 1.52809 1.5281 1.52809Zm0 1.94382h.0005c.5678 0 1.0281.46029 1.0281 1.02813v8.0045c0 .5678-.4603 1.0281-1.0281 1.0281h-.0005C11.4603 19.5 11 19.0397 11 18.4719v-8.0045c0-.56784.4603-1.02813 1.0281-1.02813Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconInfo;
