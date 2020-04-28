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
    ".info": {
      backgroundColor: variables.brandHighLighter,
      bordercolor: variables.brandHighLighter
    },

    ".xsmall": {
      height: variables.btnXSmallHeight,
      "NativeBase.Text": {
        fontSize: variables.btnSmallFontSize,
        lineHeight: variables.btnXSmallLineHeight
      },
      "NativeBase.Icon": {
        fontSize: variables.btnSmallFontSize,
        paddingTop: 1
      },
      "UIComponent.IconFont": {
        fontSize: variables.btnSmallFontSize,
        paddingTop: 1
      }
    },

    ".small": {
      height: variables.btnSmallHeight,
      "NativeBase.Text": { fontSize: variables.btnSmallFontSize }
    },

    ".light": {
      ".bordered": {
        "NativeBase.Text": {
          color: variables.btnLightTextColor,
          fontWeight: variables.textBoldWeight
        },
        "UIComponent.IconFont": {
          color: variables.btnLightTextColor
        },
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
      "NativeBase.Text": {
        fontWeight: variables.textNormalWeight
      }
    },

    ".bordered": {
      ".disabled": {
        "NativeBase.Icon": {
          color: variables.btnDisabledBg
        },
        "UIComponent.IconFont": {
          color: variables.btnDisabledBg
        },
        backgroundColor: variables.colorWhite
      },
      "UIComponent.IconFont": {
        color: variables.brandPrimary
      }
    },

    ".white": { backgroundColor: variables.colorWhite },

    ".cancel": {
      backgroundColor: variables.brandDarkGray,
      "NativeBase.Text": {
        color: variables.colorWhite
      },
      "UIComponent.IconFont": {
        color: variables.colorWhite
      }
    },

    "NativeBase.Text": {
      ...makeFontStyleObject(Platform.select, variables.btnTextFontWeight),
      fontSize: variables.btnFontSize
    },

    justifyContent: "center",

    borderRadius: variables.borderRadiusBase,
    height: variables.btnHeight,
    elevation: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    shadowOpacity: 0,
    alignSelf: "flex-start" // This attribute is necessary to solve the problem reported on Pivotal https://www.pivotaltracker.com/story/show/168290964/comments/207570370
  };
};
