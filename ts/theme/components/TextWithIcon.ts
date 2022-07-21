import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
  ".danger": {
    "NativeBase.Text": {
      color: variables.brandDanger
    },

    "UIComponent.IconFont": {
      color: variables.brandDanger
    }
  },

  ".success": {
    "NativeBase.Text": {
      color: variables.colorSuccess
    },

    "UIComponent.IconFont": {
      color: variables.colorSuccess
    }
  },

  "NativeBase.Text": {
    paddingHorizontal: 5
  },

  flexDirection: "row",
  justifyContent: "center",
  alignSelf: "center"
});
