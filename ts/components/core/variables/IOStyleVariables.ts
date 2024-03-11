import { IOColors, IOSpacer } from "@pagopa/io-app-design-system";
import { ColorSchemeName } from "react-native";

const newDsBlue = IOColors["blueIO-500"];

/**
 * A collection of default style variables used within IO App.
 */
export const IOStyleVariables = {
  defaultSpaceBetweenPictogramAndText: 24 as IOSpacer,
  switchWidth: 51,
  colorPrimary: (
    colorScheme: ColorSchemeName,
    isDesignSystemEnabled: boolean
  ) =>
    colorScheme === "dark"
      ? IOColors.white
      : isDesignSystemEnabled
      ? newDsBlue
      : IOColors.blue
};
