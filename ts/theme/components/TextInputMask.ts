import variables from "../variables";
import { Theme } from "../types";

export default (): Theme => ({
  height: variables.inputHeightBase,
  color: variables.inputColor,
  paddingLeft: 5,
  paddingRight: 5,
  flex: 1,
  fontSize: variables.inputFontSize
});
