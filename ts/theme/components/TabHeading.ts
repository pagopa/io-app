import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    "NativeBase.Text": {
      color: variables.brandDarkGray
    },
    ".active": {
      "NativeBase.Text": {
        color: variables.brandPrimaryLight,
        fontWeight: "600"
      }
    },
    backgroundColor: "#fff",
    borderBottomWidth: 0,
    borderColor: "#fff"
  };
};
