import { IOSpacer, IOStyles, Pictogram } from "@pagopa/io-app-design-system";
import React, { ComponentProps } from "react";
import { Dimensions, View } from "react-native";

export const MIN_HEIGHT_TO_SHOW_FULL_RENDER = 820;

/**
 * if the device height is > 800 then the pictogram will be visible,
 * otherwise it will not be visible
 * @param pictogramName
 * @returns Pictogram JSX element
 */

type PictogramHiddenOnSmallDeviceProps = {
  bottomSpaceSize: IOSpacer;
} & ComponentProps<typeof Pictogram>;

const PictogramHiddenOnSmallDevice = (
  props: PictogramHiddenOnSmallDeviceProps
) => (
  <>
    {Dimensions.get("screen").height > MIN_HEIGHT_TO_SHOW_FULL_RENDER && (
      <View
        style={[IOStyles.selfCenter, { marginBottom: props.bottomSpaceSize }]}
        testID="pictogram-test"
      >
        <Pictogram {...props} />
      </View>
    )}
  </>
);

export default PictogramHiddenOnSmallDevice;
