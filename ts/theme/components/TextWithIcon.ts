import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    ".danger": {
      "NativeBase.Text": {
        color: variables.brandDanger
      },

      "UIComponents.IconFont": {
        color: variables.brandDanger
      }
    },

    ".success": {
      "NativeBase.Text": {
        color: variables.brandSuccess
      },

      "UIComponents.IconFont": {
        color: variables.brandSuccess
      }
    },

    "NativeBase.Text": {
      paddingHorizontal: 5
    },

    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center"
  };
};
