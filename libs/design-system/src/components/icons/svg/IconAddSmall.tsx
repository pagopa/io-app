import { Path, Svg } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconAddSmall = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M12.9999 6C12.9999 5.44772 12.5522 5 11.9999 5C11.4477 5 10.9999 5.44772 10.9999 6V11L6.00098 11C5.44869 11 5.00098 11.4477 5.00098 12C5.00098 12.5523 5.44869 13 6.00098 13L10.9999 13V18.0008C10.9999 18.553 11.4477 19.0008 11.9999 19.0008C12.5522 19.0008 12.9999 18.553 12.9999 18.0008V13L17.9998 13C18.5521 13 18.9998 12.5523 18.9998 12C18.9998 11.4477 18.5521 11 17.9998 11L12.9999 11V6Z"
      clipRule="evenodd"
    />
  </Svg>
);

export default IconAddSmall;
