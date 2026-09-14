import { Svg, Path, Rect } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconSystemPasswordAndroid = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Rect width={size} height={size} rx="8" fill="#00C8E3" />
    <Path
      d="M5.18319 15.8751L10.2381 11.0932C9.40015 9.21311 9.78771 6.93078 11.3677 5.43609C13.3715 3.54051 16.5405 3.62846 18.4361 5.63226C20.3317 7.63606 20.2437 10.805 18.2399 12.7006C16.6599 14.1953 14.3596 14.4557 12.5288 13.5147L12.3169 13.7152L12.2515 16.0713L9.89542 16.0059L9.83003 18.362L5.09489 18.207L5.18319 15.8751ZM16.5219 10.8845C17.5207 9.93955 17.5649 8.34917 16.62 7.3503C15.675 6.35143 14.0847 6.30729 13.0858 7.25222C12.0869 8.19714 12.0428 9.78752 12.9877 10.7864C13.9326 11.7853 15.523 11.8294 16.5219 10.8845Z"
      fill="white"
    />
  </Svg>
);

export default IconSystemPasswordAndroid;
