import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconHeartFilled = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M0 8.78921C0 5.04409 3.02296 2 6.7619 2C8.87634 2 10.7613 2.97409 12 4.49576C13.2387 2.97409 15.1237 2 17.2381 2C20.977 2 24 5.04409 24 8.78921C24 10.7104 23.2039 12.4473 21.9262 13.6818L14.2084 22.0743C13.0195 23.3671 10.9791 23.3666 9.79089 22.0731L2.14192 13.7467C0.824473 12.5085 0 10.7444 0 8.78921Z"
      clipRule="evenodd"
    />
  </Svg>
);

export default IconHeartFilled;
