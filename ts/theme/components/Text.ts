import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

import { Platform, TextProperties } from "react-native";

declare module "native-base" {
  namespace NativeBase {
    interface Text extends TextProperties {
      link?: boolean;
      bold?: boolean;
      semibold?: boolean;
      italic?: boolean;
      underlined?: boolean;
      leftAlign?: boolean;
      rightAlign?: boolean;
      alignCenter?: boolean;
      white?: boolean;
      dark?: boolean;
      primary?: boolean;
      badge?: boolean;
      robotomono?: boolean;
      small?: boolean;
      xsmall?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    ".xsmall": {
      fontSize: variables.fontSizeXSmall,
      lineHeight: variables.lineHeightXSmall,
      marginBottom: -2 // to solve alignment of the text in the given lineHeight
    },
    ".small": {
      fontSize: variables.fontSizeSmall,
      lineHeight: variables.lineHeightSmall
    },
    ".link": {
      ...makeFontStyleObject(Platform.select, variables.textLinkWeight),
      color: variables.textLinkColor,
      textDecorationLine: "underline"
    },
    ".bold": {
      ...makeFontStyleObject(Platform.select, variables.textBoldWeight)
    },
    ".semibold": {
      ...makeFontStyleObject(Platform.select, variables.textLinkWeight)
    },
    ".italic": {
      ...makeFontStyleObject(Platform.select, variables.textNormalWeight, true)
    },
    ".underlined": {
      textDecorationLine: "underline"
    },
    ".leftAlign": {
      textAlign: "left"
    },
    ".rightAlign": {
      textAlign: "right"
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
