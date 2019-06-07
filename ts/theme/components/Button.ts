import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

import { Platform, TouchableOpacityProperties } from "react-native";

declare module "native-base" {
  namespace NativeBase {
    interface Button extends TouchableOpacityProperties, BsStyle {
      white?: boolean;
      cancel?: boolean;
      xsmall?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    ".block": {
      ".iconVeryLeft": {
        "UIComponent.IconFont": {
          flex: 0,
          borderRightWidth: 1,
          borderColor: "#FFFFFF",
          margin: 0,
          padding: 11,
          paddingLeft: 15,
          paddingRight: 15
        },
        "NativeBase.Text": { flex: 1, textAlign: "center" },
        padding: 0,
        display: "flex",
        justifyContent: "flex-start"
      }
    },

    ".xsmall": {
      "NativeBase.Text": {
        lineHeight: 32,
        fontSize: variables.btnXSmallFontSize
      },
      "NativeBase.Icon": {
        lineHeight: 32,
        fontSize: variables.btnXSmallFontSize
      },
      "UIComponent.IconFont": {
        lineHeight: 32,
        fontSize: variables.btnXSmallFontSize
      },

      height: variables.btnXSmallHeight,
      paddingTop: 0,
      paddingBottom: 0
    },

    ".small": {
      height: variables.btnSmallHeight,
      "NativeBase.Text": { fontSize: variables.btnSmallFontSize }
    },

    ".light": {
      ".bordered": {
        "NativeBase.Text": { color: variables.btnLightTextColor },
        borderWidth: 1,
        borderColor: variables.btnLightBorderColor,
        backgroundColor: variables.brandLight,
        ".primary": {
          "NativeBase.Text": { color: variables.brandPrimary },
          borderWidth: 1,
          borderColor: variables.brandPrimary,
          backgroundColor: variables.colorWhite
        }
      },
      "NativeBase.Text": { fontWeight: variables.textNormalWeight }
    },

    ".bordered": {
      ".disabled": {
        "NativeBase.Icon": {
          color: variables.btnDisabledBg
        },

        backgroundColor: variables.colorWhite
      }
    },

    ".white": { backgroundColor: "#FFFFFF" },

    ".primary": {
      "NativeBase.Icon": {
        color: variables.colorWhite
      },
      "UIComponent.IconFont": {
        color: variables.colorWhite
      }
    },

    ".danger": {
      "NativeBase.Icon": {
        color: variables.colorWhite
      },
      "UIComponent.IconFont": {
        color: variables.colorWhite
      }
    },

    ".cancel": {
      backgroundColor: variables.brandDarkGray,
      "NativeBase.Text": {
        color: variables.colorWhite
      }
    },

    "NativeBase.Text": {
      ...makeFontStyleObject(Platform.select, variables.btnTextFontWeight),
      fontSize: variables.btnFontSize
    },

    borderRadius: variables.borderRadiusBase,
    height: variables.btnHeight,
    elevation: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    shadowOpacity: 0
  };
};
