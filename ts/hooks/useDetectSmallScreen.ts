import { Dimensions } from "react-native";

/*
This threshold excludes all the iOS devices with home button
(iPhone SE 2022, for example) or Android devices with a
viewport height considered too small.

VIEWPORT HEIGHTS considered too small:
iPhone SE 2022: 667px
Pixel 2: 732px
*/
const MIN_HEIGHT_TO_SHOW_FULL_RENDER = 800;

export const useDetectSmallScreen = () => ({
  isDeviceScreenSmall:
    Dimensions.get("screen").height < MIN_HEIGHT_TO_SHOW_FULL_RENDER
});
