import * as ReactNative from "react-native";
import { Theme } from "../types";
import customVariables from "../variables";

declare module "native-base" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NativeBase {
    interface View extends ReactNative.ViewProperties {
      footer?: boolean;
      content?: boolean;
      padded?: boolean;
    }
  }
}

/**
 * @deprecated
 */
export default (): Theme => ({
  ".padded": {
    paddingBottom: 15
  },

  ".footer": {
    backgroundColor: customVariables.footerBackground,
    paddingBottom: customVariables.footerPaddingBottom,
    paddingLeft: customVariables.footerPaddingLeft,
    paddingRight: customVariables.footerPaddingRight,
    paddingTop: customVariables.footerPaddingTop,
    // iOS shadow
    shadowColor: customVariables.footerShadowColor,
    shadowOffset: {
      width: customVariables.footerShadowOffsetWidth,
      height: customVariables.footerShadowOffsetHeight
    },
    shadowOpacity: customVariables.footerShadowOpacity,
    shadowRadius: customVariables.footerShadowRadius,
    // Android shadow
    elevation: customVariables.footerElevation
  },
  ".content": {
    padding: customVariables.contentPadding,
    backgroundColor: customVariables.contentBackground,
    flex: 1
  }
});
