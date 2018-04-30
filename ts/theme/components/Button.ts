import { Platform } from "react-native";
import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

import * as ReactNative from "react-native";

declare module "native-base" {
  namespace NativeBase {
    interface Button extends ReactNative.TouchableOpacityProperties, BsStyle {
      white?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    ".block": {
      ".iconVeryLeft": {
        "NativeBase.Icon": {
          flex: 0,
          borderRightWidth: 1,
          borderColor: "#FFFFFF",
          margin: 0,
          padding: 11,
          paddingLeft: 15,
          paddingRight: 15
        },
        "NativeBase.Text": {
          flex: 1,
          textAlign: "center"
        },
        padding: 0,
        display: "flex",
        justifyContent: "flex-start"
      }
    },
    ".small": {
      height: variables.btnSmallHeight,
      "NativeBase.Text": {
        fontSize: variables.btnSmallFontSize
      }
    },
    ".light": {
      ".bordered": {
        "NativeBase.Text": {
          color: variables.btnLightTextColor
        },
        borderWidth: 1,
        borderColor: variables.btnLightBorderColor,
        backgroundColor: variables.brandLight
      }
    },
    ".white": {
      backgroundColor: "#FFFFFF"
    },
    "NativeBase.Text": {
      ...makeFontStyleObject(Platform.select, variables.btnTextFontWeight),
      fontSize: variables.btnFontSize
    },
    borderRadius: variables.borderRadiusBase,
    height: variables.btnHeight,
    elevation: 0,
    shadowColor: null,
    shadowOffset: null,
    shadowRadius: null,
    shadowOpacity: null
  };
};
