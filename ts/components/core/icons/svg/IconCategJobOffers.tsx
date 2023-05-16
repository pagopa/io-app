import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconCategJobOffers = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M23.297 5.672h-6.375v-2.11c0-1.163-.946-2.109-2.11-2.109H9.189c-1.164 0-2.11.946-2.11 2.11v2.109H.703A.703.703 0 0 0 0 6.375v15.469c0 .388.315.703.703.703h22.594a.703.703 0 0 0 .703-.703V6.375a.703.703 0 0 0-.703-.703Zm-.703 7.734c0 1.163-.947 2.11-2.11 2.11H14.11V7.078h8.485v6.328Zm-11.297 3.516h1.406v.703a.704.704 0 0 1-1.406 0v-.703Zm1.406-9.844v8.438h-1.406V7.078h1.406ZM8.484 3.562c0-.387.316-.703.704-.703h5.624c.388 0 .704.316.704.704v2.109H8.484v-2.11ZM1.406 7.079h8.485v8.438H3.516a2.112 2.112 0 0 1-2.11-2.11V7.078Zm0 14.063v-4.924a3.497 3.497 0 0 0 2.11.705H9.89v.703c0 1.163.946 2.11 2.109 2.11s2.11-.947 2.11-2.11v-.703h6.374c.791 0 1.522-.263 2.11-.705v4.924H1.406Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconCategJobOffers;
