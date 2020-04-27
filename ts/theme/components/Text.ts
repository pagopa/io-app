import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

import { Platform, TextProperties } from "react-native";

declare module "native-base" {
  namespace NativeBase {
    interface Text extends TextProperties {
      link?: boolean;
      bold?: boolean;
      italic?: boolean;
      leftAlign?: boolean;
      rightAlign?: boolean;
      alternativeBold?: boolean;
      white?: boolean;
      dark?: boolean;
      alignCenter?: boolean;
      primary?: boolean;
      badge?: boolean;
      robotomono?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    ".link": {
      ...makeFontStyleObject(Platform.select, variables.textLinkWeight),
      color: variables.textLinkColor,
      textDecorationLine: "underline"
    },
    ".bold": {
      ...makeFontStyleObject(Platform.select, variables.textBoldWeight)
    },
    ".italic": {
      ...makeFontStyleObject(Platform.select, variables.textNormalWeight, true)
    },
    ".leftAlign": {
      textAlign: "left"
    },
    ".rightAlign": {
      textAlign: "right"
    },
    ".alternativeBold": {
      lineHeight: variables.lineHeight2,
      fontWeight: variables.textBoldWeight,
      color: variables.h1Color,
      ...makeFontStyleObject(Platform.select, variables.textBoldWeight)
    },
    ".white": {
      color: variables.colorWhite
    },
    ".dark": {
      color: variables.brandDarkestGray
    },
    ".alignCenter": {
      textAlign: "center"
    },
    ".primary": {
      color: variables.brandPrimary
    },
    ".badge": {
      ...makeFontStyleObject(Platform.select, variables.textBoldWeight),
      color: variables.colorWhite,
      fontSize: 10,
      textAlign: "center",
      lineHeight: 14
    },
    ".robotomono": {
      ...makeFontStyleObject(
        Platform.select,
        undefined,
        undefined,
        "RobotoMono"
      ),
      ".bold": {
        ...makeFontStyleObject(
          Platform.select,
          variables.textBoldWeight,
          undefined,
          "RobotoMono"
        )
      }
    },
    lineHeight: variables.lineHeightBase
  };
};
