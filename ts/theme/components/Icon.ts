import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface Icon {
      rightArrow?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    ".rightArrow": {
      flex: variables.flexRightAlign,
      color: variables.brandPrimaryLight,
      alignSelf: "center"
    }
  };
};
