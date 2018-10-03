import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => {
  return {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  };
};
