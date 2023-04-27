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
      bold?: boolean;
      semibold?: boolean;
      white?: boolean;
      dark?: boolean;
    }
  }
}

export default (): Theme => ({
  ".bold": {
    ...makeFontStyleObject(Platform.select, variables.textBoldWeight)
  },
  ".semibold": {
    ...makeFontStyleObject(Platform.select, variables.textLinkWeight)
  },
  ".white": {
    color: IOColors.white
  },
  ".dark": {
    color: variables.textColorDark
  },
  lineHeight: variables.lineHeightBase,
  fontSize: variables.fontSizeBase
});
