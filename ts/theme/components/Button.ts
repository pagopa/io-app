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
      gray?: boolean;
      darkGray?: boolean;
      lightText?: boolean;
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
        fontSize: variables.btnXSmallFontSize,
        lineHeight: variables.btnXSmallLineHeight
      },
      "NativeBase.Icon": {
        fontSize: variables.btnXSmallIconSize,
        paddingTop: 1,
        paddingRight: 4
      },
      "UIComponent.IconFont": {
        fontSize: variables.btnXSmallIconSize,
        paddingRight: 4
      }
    },

    ".small": {
      height: variables.btnSmallHeight,
      ".lightText": {
        "NativeBase.Text": {
          ...makeFontStyleObject(
            Platform.select,
            variables.textLightButtonWeight
          )
        }
      },
      "NativeBase.Text": {
        fontSize: variables.btnSmallFontSize,
        lineHeight: variables.btnSmallLineHeight
      },
      "UIComponent.IconFont": {
        fontSize: variables.btnSmallIconSize,
        paddingRight: 4
      }
    },

    ".darkGray": {
      "NativeBase.Text": {
        color: variables.colorWhite
      },
      "UIComponent.IconFont": {
        color: variables.colorWhite
      },
      backgroundColor: variables.brandDarkGray
    },

    ".gray": {
      "NativeBase.Text": {
        color: variables.brandHighlight
      },
      "UIComponent.IconFont": {
        color: variables.brandHighlight
      },
      backgroundColor: variables.brandGray
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
      },
      backgroundColor: variables.colorWhite
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

    ".disabled": {
      "UIComponent.IconFont": {
        color: variables.colorWhite
      }
    },

    "NativeBase.Text": {
      ...makeFontStyleObject(Platform.select, variables.btnTextFontWeight),
      fontSize: variables.btnFontSize,
      paddingLeft: 0,
      paddingRight: 0
    },

    "UIComponent.IconFont": {
      fontSize: variables.btnWidgetHeight,
      paddingRight: 8
    },

    justifyContent: "center",
    paddingHorizontal: 16,

    borderRadius: variables.borderRadiusBase,
    height: variables.btnHeight,
    elevation: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    shadowOpacity: 0,
    alignSelf: "flex-start" // This attribute is necessary to solve the problem reported on Pivotal https://www.pivotaltracker.com/story/show/168290964/comments/207570370
  };
};
