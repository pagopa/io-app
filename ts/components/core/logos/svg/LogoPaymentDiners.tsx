import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGLogoProps } from "../LogoPayment";

const LogoPaymentDiners = ({ size }: SVGLogoProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M21.997 19.75H22c.956.008 1.74-.773 1.751-1.746V6.006a1.788 1.788 0 0 0-.52-1.25 1.72 1.72 0 0 0-1.233-.506H2.001a1.718 1.718 0 0 0-1.23.507c-.33.33-.517.779-.521 1.247v11.99c.004.47.191.92.52 1.25.329.328.771.51 1.233.506h19.994Z"
      fill="#fff"
      stroke="#5C6F82"
      stroke-width=".5"
    />
    <Path
      d="M10.002 6.052v-.016h4v.016a6 6 0 0 1 0 11.968v.016h-4v-.016a6 6 0 0 1 0-11.968Z"
      fill="#0165AC"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.202 12.036a5.2 5.2 0 1 0 10.4 0 5.2 5.2 0 0 0-10.4 0Zm4-3.392a3.6 3.6 0 0 0 0 6.784V8.644Zm2.4 6.784a3.6 3.6 0 0 0 0-6.784v6.784Z"
      fill="#fff"
    />
  </Svg>
);

export default LogoPaymentDiners;
