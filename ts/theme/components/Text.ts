import { Platform, TextProperties } from "react-native";
import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";
import { IOColors } from "../../components/core/variables/IOColors";

/**
 * @deprecated
 */
declare module "native-base" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NativeBase {
    /**
     * @deprecated
     */
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
    }
  }
}

export default (): Theme => ({
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
    color: IOColors.white
  },
  ".dark": {
    color: variables.textColorDark
  },
  ".alignCenter": {
    textAlign: "center"
  },
  ".primary": {
    color: variables.brandPrimary
  },
  ".badge": {
    ...makeFontStyleObject(Platform.select, variables.textBoldWeight),
    color: IOColors.white,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 14
  },
  ".robotomono": {
    ...makeFontStyleObject(Platform.select, undefined, undefined, "RobotoMono"),
    ".bold": {
      ...makeFontStyleObject(
        Platform.select,
        variables.textBoldWeight,
        undefined,
        "RobotoMono"
      )
    }
  },
  lineHeight: variables.lineHeightBase,
  fontSize: variables.fontSizeBase
});
