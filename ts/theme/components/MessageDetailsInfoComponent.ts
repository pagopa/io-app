import { Theme } from "../types";
import customVariables from "../variables";

export default (): Theme => {
  return {
    "NativeBase.ViewNB": {
      "NativeBase.ViewNB": {
        flex: 1,
        flexDirection: "row",
        alignSelf: "flex-start"
      },
      paddingLeft: 10,
      borderLeftWidth: 2,
      borderLeftColor: customVariables.brandLightGray
    }
  };
};
