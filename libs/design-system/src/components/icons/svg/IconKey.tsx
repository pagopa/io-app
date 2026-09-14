import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconKey = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M16 12c0-1.6569 1.3431-3 3-3s3 1.3431 3 3-1.3431 3-3 3-3-1.3431-3-3Zm-1.901.9952A1.01133 1.01133 0 0 1 14 13H8v3c0 .5523-.44772 1-1 1s-1-.4477-1-1v-3H4v1c0 .5523-.44772 1-1 1s-1-.4477-1-1v-1H1c-.55229 0-1-.4477-1-1s.44771-1 1-1h13c.0334 0 .0665.0016.099.0048C14.5604 8.72019 16.5793 7 19 7c2.7614 0 5 2.23858 5 5 0 2.7614-2.2386 5-5 5-2.4207 0-4.4396-1.7202-4.901-4.0048Z"
      clipRule="evenodd"
    />
  </Svg>
);

export default IconKey;
