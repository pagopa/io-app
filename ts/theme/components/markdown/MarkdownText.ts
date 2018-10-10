import { Theme } from "../../types";
import variables from "../../variables";

export default (): Theme => {
  return {
    ".inMessage": {
      "NativeBase.Text": {
        lineHeight: variables.lineHeightBase
      }
    }
  };
};
