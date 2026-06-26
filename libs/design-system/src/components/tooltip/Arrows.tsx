import Svg, { Path } from "react-native-svg";
import { IOColors } from "../../core";

export const LeftArrow = ({ color = IOColors.white }: { color?: string }) => (
  <Svg fill="none">
    <Path
      d="M12.6955 15.2C14.8289 13.6 14.8289 10.4 12.6955 8.8L0.962204 0V24L12.6955 15.2Z"
      fill={color}
    />
  </Svg>
);
export const RightArrow = ({ color = IOColors.white }: { color?: string }) => (
  <Svg fill={color}>
    <Path
      d="M2.30448 15.2031C0.171145 13.6031 0.171145 10.4031 2.30448 8.80314L14.0378 0.00314331V24.0031L2.30448 15.2031Z"
      fill={color}
    />
  </Svg>
);
export const BottomArrow = ({ color = IOColors.white }: { color?: string }) => (
  <Svg fill={color}>
    <Path
      d="M15.2 2.26667C13.6 0.133334 10.4 0.133333 8.8 2.26667L0 14L24 14L15.2 2.26667Z"
      fill={color}
    />
  </Svg>
);
export const TopArrow = ({ color = IOColors.white }: { color?: string }) => (
  <Svg fill={color}>
    <Path
      d="M15.2 11.7333C13.6 13.8667 10.4 13.8667 8.8 11.7333L0 0L24 0L15.2 11.7333Z"
      fill={color}
    />
  </Svg>
);
