import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconTheme = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0ZM22 12C22 17.5228 17.5228 22 12 22V2C17.5228 2 22 6.47715 22 12Z"
      clipRule="evenodd"
    />
  </Svg>
);

export default IconTheme;
