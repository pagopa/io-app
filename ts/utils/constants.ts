import { Platform } from "react-native";
import {
  getBottomSpace,
  getStatusBarHeight,
  isIphoneX
} from "react-native-iphone-x-helper";
import customVariables from "../theme/variables";

export const PIN_LENGTH = 5;
export const PIN_LENGTH_SIX = 6;

export const HEADER_ICON_HEIGHT = 48;
export const MESSAGE_ICON_HEIGHT = 40;
export const SUCCESS_ICON_HEIGHT = 120;

// A key to identify the Set of the listeners of the navigtion middleware.
export const NAVIGATION_MIDDLEWARE_LISTENERS_KEY: string = "root";

export const HEADER_HEIGHT =
  customVariables.appHeaderHeight +
  (Platform.OS === "ios"
    ? isIphoneX()
      ? 18
      : getStatusBarHeight(true)
    : customVariables.spacerHeight);

// On iPhone X we have a higher bottom padding for content
export const FOOTER_SAFE_AREA = getBottomSpace();

export const HEADER_ANIMATION_DURATION = 200;
