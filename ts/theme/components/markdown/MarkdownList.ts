import { Theme } from "../../types";
import variables from "../../variables";

export default (): Theme => {
  return {
    "NativeBase.ViewNB": {
      // List item
      "NativeBase.ViewNB": {
        alignItems: "center",
        flexDirection: "row",
        paddingLeft: 10
      },

      marginBottom: variables.lineHeightBase
    }
  };
};
