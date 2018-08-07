import { Theme } from "../types";

import variables from "../variables";

export default (): Theme => ({
  "NativeBase.Container": {
    backgroundColor: variables.contentBackground
  }
});
