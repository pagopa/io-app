import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconBonusFilled = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M3 2C1.3 2 0 3.3 0 5V19C0 20.7 1.3 22 3 22H13.6C14.1 22 14.6 21.8 15 21.4L16 20.4L17 21.4C17.4 21.8 17.9 22 18.4 22H21C22.7 22 24 20.7 24 19V5C24 3.3 22.7 2 21 2H18.4C17.9 2 17.4 2.2 17 2.6L16 3.6L15 2.6C14.6 2.2 14.1 2 13.6 2H3ZM17 8C17 8.6 16.6 9 16 9C15.4 9 15 8.6 15 8C15 7.4 15.4 7 16 7C16.6 7 17 7.4 17 8ZM16 13C16.6 13 17 12.6 17 12C17 11.4 16.6 11 16 11C15.4 11 15 11.4 15 12C15 12.6 15.4 13 16 13ZM17 16C17 16.6 16.6 17 16 17C15.4 17 15 16.6 15 16C15 15.4 15.4 15 16 15C16.6 15 17 15.4 17 16Z"
      clipRule="evenodd"
    />
  </Svg>
);

export default IconBonusFilled;
