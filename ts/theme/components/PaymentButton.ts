import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
  ".small": {
    "NativeBase.Button": {
      "UIComponent.IconFont": {
        lineHeight: 0
      },

      "NativeBase.Text": {
        lineHeight: 0,
        fontSize: 14
      },

      height: 32
    }
  },

  ".expiring": {
    "NativeBase.Button": {
      "UIComponent.IconFont": {
        color: variables.colorWhite
      },

      "NativeBase.Text": {
        color: variables.colorWhite
      },

      backgroundColor: "#D0021B"
    }
  },

  ".expired": {
    "NativeBase.Button": {
      backgroundColor: variables.brandDarkGray
    }
  },

  "NativeBase.Button": {
    "UIComponent.IconFont": {
      fontSize: 20,
      color: variables.colorWhite
    },

    "NativeBase.Text": {
      marginLeft: 4,
      paddingRight: 0,
      paddingLeft: 0,
      color: variables.colorWhite
    },

    flex: 7,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    backgroundColor: variables.brandPrimary
  }
});
