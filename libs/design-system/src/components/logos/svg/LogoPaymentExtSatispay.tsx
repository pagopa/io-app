import { Svg, Path } from "react-native-svg";
import { SVGLogoProps } from "../types";

const LogoPaymentExtSatispay = ({ size }: SVGLogoProps) => (
  <Svg width={size} height={size} viewBox="0 0 48 30">
    <Path
      fill="#FF3D00"
      fillRule="evenodd"
      d="M0 3a3 3 0 0 1 3-3h42a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3Z"
      clipRule="evenodd"
    />
    <Path
      fill="#fff"
      d="M17.67 25.519h6.038l9.541-8.784a2.34 2.34 0 0 0 0-3.432l-9.541-8.784H17.67a.452.452 0 0 0-.43.296.46.46 0 0 0 .12.51l10.22 9.41a.389.389 0 0 1 0 .57l-10.22 9.41a.46.46 0 0 0-.12.51.452.452 0 0 0 .43.296v-.002Z"
    />
    <Path
      fill="#fff"
      d="m19.509 8.922-4.758 4.38a2.34 2.34 0 0 0 0 3.433l4.758 4.38 3.611-3.325-2.701-2.487a.388.388 0 0 1 0-.57l2.701-2.487-3.611-3.324ZM30.33 4.519h-4.862l3.023 2.783 2.148-1.977a.46.46 0 0 0 .12-.51.452.452 0 0 0-.43-.296ZM28.491 22.736l-3.023 2.783h4.861a.453.453 0 0 0 .43-.296.46.46 0 0 0-.12-.51l-2.148-1.977Z"
    />
  </Svg>
);

export default LogoPaymentExtSatispay;
