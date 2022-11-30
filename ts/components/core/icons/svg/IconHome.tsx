import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconHome = ({ size, color }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M23.25 13.123a.748.748 0 0 1-.53-.22l-.595-.594v9.534a2.159 2.159 0 0 1-2.156 2.156H4.03a2.159 2.159 0 0 1-2.156-2.156v-9.534l-.595.594a.75.75 0 1 1-1.06-1.06l9.327-9.328a3.473 3.473 0 0 1 4.906 0l9.327 9.328a.75.75 0 0 1-.53 1.28Zm-13.5 9.376h4.5v-5.906a.845.845 0 0 0-.844-.844h-2.812a.845.845 0 0 0-.844.844v5.906Zm6 0v-5.906a2.346 2.346 0 0 0-2.344-2.344h-2.812a2.346 2.346 0 0 0-2.344 2.344v5.906H4.031a.657.657 0 0 1-.656-.656V10.809l7.233-7.233a1.97 1.97 0 0 1 2.784 0l7.233 7.233v11.034a.657.657 0 0 1-.656.656H15.75Z"
      fill={color}
    />
  </Svg>
);

export default IconHome;
