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
      alignCenter?: boolean;
      primary?: boolean;
      markdown?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    ".link": {
      ...makeFontStyleObject(Platform.select, variables.textLinkWeight),
      color: variables.textLinkColor
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
    ".alignCenter": {
      textAlign: "center"
    },
    ".primary": {
      color: variables.brandPrimary
    },
    ".markdown": {
      lineHeight: variables.lineHeightBase + 6,
      ".link": {
        lineHeight: variables.lineHeightBase,
        marginTop: 3,
        marginBottom: 3,
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: variables.borderRadiusBase,
        color: variables.colorWhite,
        backgroundColor: variables.textLinkColor
      }
    },
    lineHeight: variables.lineHeightBase
  };
};
