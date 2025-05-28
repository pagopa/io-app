import { Dimensions } from "react-native";

const MIN_HEIGHT_TO_SHOW_FULL_RENDER = 780;

export const useDetectSmallScreen = () => ({
  isDeviceScreenSmall:
    Dimensions.get("screen").height < MIN_HEIGHT_TO_SHOW_FULL_RENDER
});
