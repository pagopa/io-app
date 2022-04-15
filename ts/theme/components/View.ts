import * as ReactNative from "react-native";
import { Theme } from "../types";
import customVariables from "../variables";

declare module "native-base" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NativeBase {
    interface View extends ReactNative.ViewProperties {
      spacer?: boolean;
      hspacer?: boolean;
      xsmall?: boolean;
      small?: boolean;
      large?: boolean;
      extralarge?: boolean;
      modal?: boolean;
      footer?: boolean;
      header?: boolean;
      content?: boolean;
      padded?: boolean;
      centerJustified?: boolean;
    }
  }
}

/**
 * TODO:
 * if no components are inserted as footer, the following component should be
 * included at the bottom of the screen to show the proper shadow upside the navigation bar:
 *
 * <View footer={true} noPadded={true}/>
 *
 * TODO: check if this rule is still valid or a workaround has been implemented to avoid it been manually done
 * https://www.pivotaltracker.com/story/show/170819564
 */

export default (): Theme => ({
  ".spacer": {
    xsmall: {
      height: customVariables.spacerExtrasmallHeight
    },
    ".xsmall": {
      height: customVariables.spacerExtrasmallHeight
    },
    ".small": {
      height: customVariables.spacerSmallHeight
    },
    ".large": {
      height: customVariables.spacerLargeHeight
    },
    ".extrasmall": {
      height: customVariables.spacerExtrasmallHeight
    },

    ".extralarge": {
      height: customVariables.spacerExtralargeHeight
    },

    height: customVariables.spacerHeight
  },

  // horizontal spacer
  ".hspacer": {
    ".small": {
      width: customVariables.spacerSmallHeight
    },
    ".large": {
      width: customVariables.spacerLargeWidth
    },
    ".extralarge": {
      width: customVariables.spacerExtralargeWidth
    },
    width: customVariables.spacerWidth
  },

  ".modal": {
    flex: 1,
    backgroundColor: customVariables.contentBackground
  },

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
  },
  ".centerJustified": {
    flex: 1,
    justifyContent: "center"
  }
});
