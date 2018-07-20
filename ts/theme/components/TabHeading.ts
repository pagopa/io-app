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
    flex: 0,
    width: 85,
    backgroundColor: variables.brandPrimaryInverted,
    borderBottomWidth: 0,
    borderColor: variables.brandPrimaryInverted
  };
};
