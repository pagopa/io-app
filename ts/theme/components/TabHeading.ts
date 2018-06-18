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
        fontWeight: variables.h3FontWeight
      }
    },
    backgroundColor: variables.brandPrimaryInverted,
    borderBottomWidth: 0,
    borderColor: variables.brandPrimaryInverted
  };
};
