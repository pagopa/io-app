import {
  IOColors,
  IOPictograms,
  IOPictogramSizeScale,
  IOStyles,
  Pictogram
} from "@pagopa/io-app-design-system";
import React from "react";
import { Dimensions, View } from "react-native";

export const MIN_HEIGHT_TO_SHOW_FULL_RENDER = 820;

type IOPictogramsProps = {
  name: IOPictograms;
  color?: IOColors;
  pictogramStyle?: "default" | "light-content" | "dark-content";
  size?: IOPictogramSizeScale | "100%";
};

/**
 * if the device height is > 800 then the pictogram will be visible,
 * otherwise it will not be visible
 * @param pictogramName
 * @returns Pictogram JSX element
 */

const PictogramOnSmallDevice = (Props: IOPictogramsProps) => (
  <>
    {Dimensions.get("screen").height > MIN_HEIGHT_TO_SHOW_FULL_RENDER && (
      <View style={IOStyles.selfCenter} testID="pictogram-test">
        <Pictogram {...Props} />
      </View>
    )}
  </>
);

export default PictogramOnSmallDevice;
