import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
  height: variables.inputHeightBase,
  color: variables.inputColor,
  paddingLeft: 5,
  paddingRight: 5,
  flex: 1,
  fontSize: variables.inputFontSize
});
