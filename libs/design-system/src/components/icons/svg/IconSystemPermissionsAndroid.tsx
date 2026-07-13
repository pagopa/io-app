import { Path, Rect, Svg } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconSystemPermissionsAndroid = ({
  size,
  style,
  ...props
}: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Rect width={size} height={size} fill="#636B82" rx="8" />
    <Path
      d="M12 15.75C12.825 15.75 13.5 15.075 13.5 14.25C13.5 13.425 12.825 12.75 12 12.75C11.175 12.75 10.5 13.425 10.5 14.25C10.5 15.075 11.175 15.75 12 15.75ZM16.5 9H15.75V7.5C15.75 5.43 14.07 3.75 12 3.75C9.93 3.75 8.25 5.43 8.25 7.5H9.675C9.675 6.2175 10.7175 5.175 12 5.175C13.2825 5.175 14.325 6.2175 14.325 7.5V9H7.5C6.675 9 6 9.675 6 10.5V18C6 18.825 6.675 19.5 7.5 19.5H16.5C17.325 19.5 18 18.825 18 18V10.5C18 9.675 17.325 9 16.5 9ZM16.5 18H7.5V10.5H16.5V18Z"
      fill="#FFFFFF"
    />
  </Svg>
);

export default IconSystemPermissionsAndroid;
