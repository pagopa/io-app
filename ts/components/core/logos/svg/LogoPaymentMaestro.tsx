import React from "react";
import { Svg, Rect, Circle, Path } from "react-native-svg";
import { SVGLogoProps } from "../LogoPayment";

const LogoPaymentMaestro = ({ size }: SVGLogoProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect y="4" width="24" height="16" rx="2" fill="#252525" />
    <Circle cx="9" cy="12" r="5" fill="red" />
    <Circle cx="15" cy="12" r="5" fill="#00A1DF" />
    <Path
      d="M12 8c1.214.912 2 2.364 2 4a4.992 4.992 0 0 1-2 4 4.992 4.992 0 0 1-2-4c0-1.636.786-3.088 2-4Z"
      fill="#7673C0"
    />
  </Svg>
);

export default LogoPaymentMaestro;
