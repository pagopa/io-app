import { IOColors } from "@pagopa/io-app-design-system";
import { Theme } from "../types";
import variables from "../variables";

export default (): Theme => ({
  height: variables.inputHeightBase,
  color: IOColors["grey-850"],
  paddingLeft: 5,
  paddingRight: 5,
  flex: 1,
  fontSize: variables.inputFontSize
});
